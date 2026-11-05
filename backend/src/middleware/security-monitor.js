import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { clientIp, classifyRequest, responseEvent } from '../modules/security/security-rules.js';
import { securityStore } from '../modules/security/security.store.js';
import { inspectForwarding, isPublicIp } from '../modules/security/security-intel.js';
import { matchHoneytoken, registerTrigger } from '../modules/security/honeytoken.store.js';

export function createSecurityMonitor(store = securityStore) {
  const pending = new Set();
  const state = { startedAt: new Date().toISOString(), checked: 0, rejected: 0, pending: 0,
    dropped: 0, lastCheckedAt: null, lastErrorAt: null };
  let lastWarning = 0;

  function failure() {
    state.lastErrorAt = new Date().toISOString();
    if (Date.now() - lastWarning > 60000) {
      lastWarning = Date.now();
      console.error('Security monitoring storage is unavailable. Check database connection and migration 010.');
    }
  }

  async function observe(req, res) {
    if (req.securityHandled) return;
    const event = req.securityEvent || responseEvent(req, res.statusCode) || req.securitySpoofEvent;
    if (!event) return;
    const data = { ...event, status: res.statusCode };
    if (event.type === 'login_failure') await store.detect(req, data, env.loginRateLimitMaxAttempts, 'login_failure');
    else if (event.type === 'mfa_failure') await store.detect(req, data, 5, 'mfa_failure');
    else if (['authentication_failure', 'access_denied'].includes(event.type)) await store.detect(req, data, 20, 'access_failure');
    else await store.record(req, data);
  }

  function enqueue(req, res) {
    if (pending.size >= 256) { state.dropped += 1; return; }
    const task = observe(req, res).catch(failure).finally(() => {
      pending.delete(task);
      state.pending = pending.size;
    });
    pending.add(task);
    state.pending = pending.size;
  }

  async function reject(req, res, event, status, retrySeconds) {
    req.securityHandled = true;
    state.rejected += 1;
    if (retrySeconds) res.set('Retry-After', String(Math.max(1, Math.ceil(retrySeconds))));
    res.set('Cache-Control', 'no-store');
    await store.record(req, { ...event, status });
    return res.status(status).json({ message: 'So‘rov xavfsizlik qoidalari asosida vaqtincha rad etildi.', requestId: req.securityRequestId });
  }

  async function middleware(req, res, next) {
    req.securityRequestId = randomUUID();
    res.set('X-Request-ID', req.securityRequestId);
    if (req.path === '/health' && ['GET', 'HEAD'].includes(req.method)) return next();
    res.once('finish', () => enqueue(req, res));
    const ip = clientIp(req);
    if (!ip) return res.status(400).json({ message: 'Invalid client address.' });
    try {
      state.checked += 1;
      state.lastCheckedAt = new Date().toISOString();
      const blocked = await store.activeBlock(ip);
      if (blocked) return await reject(req, res, { type: 'blocked_request', severity: 'high', action: 'blocked',
        summary: 'Bloklangan IP manzilidan qayta so‘rov yuborildi.' }, 403,
      (new Date(blocked.blocked_until).getTime() - Date.now()) / 1000);

      // Honeytoken: a fake credential only an attacker would ever send. Block on sight.
      const honeytokenId = await matchHoneytoken(req).catch(() => null);
      if (honeytokenId) {
        req.securityHandled = true;
        state.rejected += 1;
        await registerTrigger(honeytokenId, ip);
        await store.block(ip, 'Tuzoq kalit (honeytoken) ishlatildi.', env.securityBlockMinutes);
        await store.record(req, { type: 'honeytoken', severity: 'critical', action: 'blocked', status: 403,
          summary: 'Soxta API kalit ishlatildi — faqat hujumchi yuboradi. IP bloklandi.' });
        res.set('Retry-After', String(env.securityBlockMinutes * 60));
        res.set('Cache-Control', 'no-store');
        return res.status(403).json({ message: 'Xavfli so‘rov rad etildi.', requestId: req.securityRequestId });
      }

      const requestCounter = await store.increment(ip, 'requests', 60);
      if (Number(requestCounter.count) > env.securityRequestLimit) {
        await store.block(ip, 'Bir daqiqada juda ko‘p so‘rov yuborildi.');
        return await reject(req, res, { type: 'request_flood', severity: 'high', action: 'blocked',
          summary: 'So‘rovlar tezligi cheklovdan oshdi.' }, 429, env.securityBlockMinutes * 60);
      }

      const event = classifyRequest(req);
      if (event) {
        req.securityHandled = true;
        state.rejected += 1;
        const blockedNow = await store.detect(req, { ...event, status: 403 }, 3);
        if (blockedNow) res.set('Retry-After', String(env.securityBlockMinutes * 60));
        res.set('Cache-Control', 'no-store');
        return res.status(403).json({ message: 'Xavfli so‘rov rad etildi.', requestId: req.securityRequestId });
      }

      // A public client that sends forwarding headers with other public addresses is trying
      // to disguise its source. The real connection IP is always the one recorded.
      const forwarding = inspectForwarding(req, ip);
      if (isPublicIp(ip) && forwarding.fakeIps.some(isPublicIp)) {
        req.securitySpoofEvent = { type: 'header_spoof', severity: 'medium',
          summary: `Soxta IP sarlavhasi: ${forwarding.fakeIps.slice(0, 3).join(', ')} deb ko‘rsatishga urinildi.` };
      }

      const path = req.path.toLowerCase().replace(/\/+$/, '');
      if (path === '/api/account/login' && req.method === 'POST') {
        const counter = await store.increment(ip, 'login_attempts', env.loginRateLimitWindowMs / 1000);
        if (Number(counter.count) > env.loginRateLimitMaxAttempts) {
          await store.block(ip, 'Login urinishlari cheklovdan oshdi.');
          return await reject(req, res, { type: 'login_rate_limit', severity: 'high', action: 'blocked',
            summary: 'Login urinishlari cheklovdan oshdi.' }, 429, env.securityBlockMinutes * 60);
        }
      }
      if (path.startsWith('/api/account/login/') && req.method === 'POST') {
        const counter = await store.increment(ip, 'mfa_steps', 600);
        if (Number(counter.count) > 20) {
          await store.block(ip, 'Ikki bosqichli kirish urinishlari cheklovdan oshdi.');
          return await reject(req, res, { type: 'mfa_failure', severity: 'high', action: 'blocked',
            summary: 'Ikki bosqichli kirish urinishlari cheklovdan oshdi.' }, 429, env.securityBlockMinutes * 60);
        }
      }
      if (path.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        const counter = await store.increment(ip, 'writes', 60);
        if (Number(counter.count) > env.securityWriteLimit) {
          return await reject(req, res, { type: 'write_rate_limit', severity: 'medium', action: 'rejected',
            summary: 'Yozish yoki AI so‘rovlari tezligi cheklovdan oshdi.' }, 429,
          (new Date(counter.expires_at).getTime() - Date.now()) / 1000);
        }
      }
      return next();
    } catch {
      failure();
      req.securityHandled = true;
      res.set('Retry-After', '30');
      res.set('Cache-Control', 'no-store');
      return res.status(503).json({ message: 'Xavfsizlik tekshiruvi vaqtincha mavjud emas. Keyinroq urinib ko‘ring.' });
    }
  }

  return { middleware, state, drain: () => Promise.all([...pending]) };
}
