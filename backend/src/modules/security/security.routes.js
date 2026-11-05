import { Router } from 'express';
import { env } from '../../config/env.js';
import { authenticate, authorizeRoles } from '../../middleware/authenticate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { HttpError } from '../../utils/http-error.js';
import { clientIp, normalizeIp, safeText } from './security-rules.js';
import { securityStore } from './security.store.js';
import { readDependencyAudit } from './security-audit.js';
import { accountSecuritySummary } from '../account/mfa.service.js';
import { validatePasswordStrength } from '../../utils/password-policy.js';
import { intelStatus, isPublicIp, lookupIps, parseUserAgent } from './security-intel.js';
import { createHoneytoken, deleteHoneytoken, listHoneytokens, setHoneytokenActive } from './honeytoken.store.js';

async function withIntel(items, ipKey = 'ip') {
  const intel = await lookupIps(items.map((item) => item[ipKey])).catch(() => new Map());
  return items.map((item) => ({ ...item, intel: intel.get(item[ipKey]) || null,
    client: item.user_agent !== undefined ? parseUserAgent(item.user_agent) : undefined }));
}

function countBy(items, pick) {
  const counts = new Map();
  for (const item of items) {
    const key = pick(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + Number(item.attempts || 1));
  }
  return [...counts.entries()].map(([key, total]) => ({ key, total })).sort((a, b) => b.total - a.total);
}

const severities = ['info', 'medium', 'high', 'critical'];
const actions = ['observed', 'rejected', 'blocked', 'unblocked'];

export function eventFilters(input = {}) {
  const hours = Number(input.hours || 24);
  const page = Number(input.page || 0);
  const limit = Number(input.limit || 25);
  const ip = input.ip ? normalizeIp(input.ip) : null;
  if (!Number.isInteger(hours) || hours < 1 || hours > 24 * 365 || !Number.isInteger(page) || page < 0 || page > 10000 ||
    !Number.isInteger(limit) || limit < 1 || limit > 100 || (input.ip && !ip) ||
    (input.severity && !severities.includes(input.severity)) || (input.action && !actions.includes(input.action)) ||
    (input.type && !/^[a-z_]{1,40}$/.test(input.type))) throw new HttpError(400, 'Filtr qiymatlari noto‘g‘ri.');
  return { hours, page, limit, ip, severity: input.severity || null, action: input.action || null, type: input.type || null };
}

export function configurationChecks(req) {
  return [
    { id: 'mfa', title: 'Majburiy ikki bosqichli kirish', ok: true,
      detail: 'Parol + TOTP kodi. Barcha bosqichlardan o‘tmaguncha admin sessiyasi berilmaydi.' },
    { id: 'mfa-key', title: 'Autentifikator sirlarini shifrlash', ok: /^[a-f0-9]{64}$/i.test(env.mfaEncryptionKey),
      detail: 'TOTP sirlari alohida server kaliti bilan AES-256-GCM orqali shifrlanadi.' },
    { id: 'sessions', title: 'Himoyalangan server sessiyalari', ok: true,
      detail: `HttpOnly/SameSite cookie + CSRF. Sessiya ${env.sessionMinutes} daqiqa; so‘rovsiz ${env.sessionIdleMinutes} daqiqada tugaydi.` },
    { id: 'registration', title: 'Ommaviy admin ro‘yxatdan o‘tishi', ok: !env.allowPublicRegistration,
      detail: 'Adminlar faqat super admin orqali yaratilishi kerak.' },
    { id: 'password', title: 'Parol siyosati', ok: env.adminPasswordMinLength >= 12 && env.bcryptRounds >= 12,
      detail: 'Kamida 12 belgi va bcrypt 12 yoki undan yuqori.' },
    { id: 'bootstrap', title: 'Boshlang‘ich admin paroli', ok: validatePasswordStrength(env.defaultAdminPassword, {
      login: env.defaultAdminLogin, email: env.defaultAdminEmail, fullName: env.defaultAdminFullName
    }).valid,
      detail: 'Boshlang‘ich admin parolini kuchli qiymatga almashtiring; mavjud admin hisobining parolini ham tekshiring.' },
    { id: 'bootstrap-sync', title: 'Admin parolini qayta yozish', ok: !env.syncDefaultAdminOnBoot,
      detail: 'SYNC_DEFAULT_ADMIN_ON_BOOT yoqilsa, har qayta ishga tushishda admin paroli muhit sozlamasiga qaytariladi.' },
    { id: 'cors', title: 'Ruxsat etilgan saytlar', ok: !env.corsOrigins.includes('*'),
      detail: 'CORS uchun faqat aniq domenlar ro‘yxati ishlatiladi.' },
    { id: 'proxy', title: 'Ishonchli proksi', ok: env.trustedProxies.length > 0,
      detail: env.trustedProxies.length ? 'Faqat TRUST_PROXY ro‘yxatidagi proksilar IP manzilni uzata oladi.' :
        'To‘g‘ridan-to‘g‘ri ulanishda IP ishonchli. Reverse proxy bo‘lsa, uning IP/CIDR manzilini TRUST_PROXY orqali kiriting.' },
    { id: 'https', title: 'Joriy API ulanishi HTTPS', ok: req.secure,
      detail: 'TLS proksida tugasa, HTTPS holati to‘g‘ri TRUST_PROXY sozlamasiga bog‘liq.' },
    { id: 'monitor', title: 'Doimiy kuzatuv va bloklash', ok: true,
      detail: `So‘rovlar tekshiriladi; avtomatik blok ${env.securityBlockMinutes} daqiqa, jurnal ${env.securityRetentionDays} kun saqlanadi.` }
  ];
}

export function createSecurityRouter(store = securityStore, monitorState = {}) {
  const router = Router();
  router.use(authenticate, authorizeRoles('super_admin'));
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  router.get('/overview', asyncHandler(async (req, res) => {
    const { hours } = eventFilters(req.query);
    const compact = req.query.compact === '1';
    const [totals, trend, sources, blocks, audit, accountSecurity] = await Promise.all([
      store.run(`SELECT COALESCE(SUM(occurrences),0)::int AS total,
        COALESCE(SUM(occurrences) FILTER (WHERE severity IN ('high','critical')),0)::int AS high,
        COALESCE(SUM(occurrences) FILTER (WHERE event_type IN ('login_failure','login_rate_limit','mfa_failure','mfa_rate_limit')),0)::int AS login_failures,
        COALESCE(SUM(occurrences) FILTER (WHERE action IN ('blocked','rejected') AND event_type NOT IN ('manual_block','manual_unblock')),0)::int AS prevented,
        COUNT(DISTINCT ip) FILTER (WHERE severity <> 'info' AND event_type NOT IN ('manual_block','manual_unblock'))::int AS sources
        FROM security_events WHERE last_seen >= NOW() - $1 * INTERVAL '1 hour'`, [hours]),
      compact ? Promise.resolve({ rows: [] }) : store.run(`SELECT date_trunc('hour', last_seen) AS hour, SUM(occurrences)::int AS total,
        COALESCE(SUM(occurrences) FILTER (WHERE severity IN ('high','critical')),0)::int AS high
        FROM security_events WHERE last_seen >= NOW() - $1 * INTERVAL '1 hour'
        GROUP BY 1 ORDER BY 1`, [Math.min(hours, 168)]),
      compact ? Promise.resolve({ rows: [] }) : store.run(`SELECT host(e.ip) AS ip, SUM(e.occurrences)::int AS attempts,
        MIN(e.first_seen) AS first_seen, MAX(e.last_seen) AS last_seen, BOOL_OR(e.severity IN ('high','critical')) AS high,
        BOOL_OR(e.spoof_attempt) AS spoof, COUNT(DISTINCT e.event_type)::int AS event_types,
        (ARRAY_AGG(e.user_agent ORDER BY e.last_seen DESC))[1] AS user_agent,
        (ARRAY_AGG(e.event_type ORDER BY e.occurrences DESC))[1] AS main_type,
        MAX(b.blocked_until) AS blocked_until
        FROM security_events e LEFT JOIN security_ip_blocks b ON e.ip = b.ip AND b.blocked_until > NOW()
        WHERE e.last_seen >= NOW() - $1 * INTERVAL '1 hour' AND e.severity <> 'info'
        GROUP BY e.ip ORDER BY attempts DESC LIMIT 25`, [hours]),
      store.run('SELECT COUNT(*)::int AS count FROM security_ip_blocks WHERE blocked_until > NOW()'),
      readDependencyAudit(),
      accountSecuritySummary(store.run)
    ]);
    const enrichedSources = await withIntel(sources.rows);
    const networkCounts = countBy(enrichedSources, (item) => item.intel?.network?.type);
    res.json({ totals: { ...totals.rows[0], activeBlocks: blocks.rows[0]?.count || 0,
      spoofSources: enrichedSources.filter((item) => item.spoof).length,
      anonymizedSources: enrichedSources.filter((item) => ['vpn', 'tor'].includes(item.intel?.network?.type)).length },
    trend: trend.rows, sources: enrichedSources,
      countries: countBy(enrichedSources, (item) => item.intel?.countryCode && `${item.intel.countryCode}|${item.intel.country}`).slice(0, 12),
      networks: networkCounts, intel: intelStatus(),
      checks: configurationChecks(req), accountSecurity, audit, monitor: { ...monitorState }, currentIp: clientIp(req),
      policy: { requestLimit: env.securityRequestLimit, writeLimit: env.securityWriteLimit,
        loginLimit: env.loginRateLimitMaxAttempts, loginWindowMinutes: env.loginRateLimitWindowMs / 60000,
        blockMinutes: env.securityBlockMinutes, retentionDays: env.securityRetentionDays }, timestamp: new Date().toISOString() });
  }));

  router.get('/sources', asyncHandler(async (req, res) => {
    const filters = eventFilters(req.query);
    const status = req.query.status || 'all';
    if (!['all', 'suspicious', 'blocked'].includes(status)) throw new HttpError(400, 'IP holati noto‘g‘ri.');
    // Administrative block/unblock records refer to the target IP, not a request
    // made by that IP. Keep them in the journal without inventing client activity.
    const cte = `WITH activity AS (
      SELECT * FROM security_events WHERE last_seen >= NOW()-$1*INTERVAL '1 hour'
        AND ($2::inet IS NULL OR ip=$2::inet) AND event_type NOT IN ('manual_block','manual_unblock')
    ), grouped AS (
      SELECT ip, SUM(occurrences)::bigint AS attempts, MIN(first_seen) AS first_seen, MAX(last_seen) AS last_seen,
        MAX(last_seen) FILTER(WHERE event_type='login_success') AS last_login_at,
        BOOL_OR(severity IN ('medium','high','critical')) AS suspicious,
        MAX(CASE severity WHEN 'critical' THEN 3 WHEN 'high' THEN 2 WHEN 'medium' THEN 1 ELSE 0 END) AS risk
      FROM activity GROUP BY ip
    ), latest AS (
      SELECT DISTINCT ON(ip) ip,event_type,summary,method,path,status_code,action FROM activity ORDER BY ip,last_seen DESC,id DESC
    ), sources AS (
      SELECT host(g.ip) AS ip,g.attempts,g.first_seen,g.last_seen,g.last_login_at,g.suspicious,g.risk,
        l.event_type,l.summary,l.method,l.path,l.status_code,l.action,
        b.created_at AS blocked_at,b.blocked_until,b.reason AS block_reason,b.source AS block_source
      FROM grouped g JOIN latest l ON l.ip=g.ip
      LEFT JOIN security_ip_blocks b ON b.ip=g.ip AND b.blocked_until>NOW()
      WHERE ($3='all' OR ($3='suspicious' AND g.suspicious) OR ($3='blocked' AND b.ip IS NOT NULL))
    )`;
    const args = [filters.hours, filters.ip, status];
    const [items, count, block] = await Promise.all([
      store.run(`${cte} SELECT * FROM sources ORDER BY last_seen DESC,ip LIMIT $4 OFFSET $5`, [...args, filters.limit, filters.page*filters.limit]),
      store.run(`${cte} SELECT COUNT(*)::int AS total FROM sources`, args),
      filters.ip ? store.activeBlock(filters.ip) : Promise.resolve(null)
    ]);
    res.json({ items: items.rows, total: count.rows[0].total, block, page: filters.page, limit: filters.limit });
  }));

  router.get('/events', asyncHandler(async (req, res) => {
    const filters = eventFilters(req.query);
    const values = [filters.hours, filters.ip, filters.severity, filters.action, filters.type];
    const where = `last_seen >= NOW() - $1 * INTERVAL '1 hour' AND ($2::inet IS NULL OR ip = $2::inet)
      AND ($3::text IS NULL OR severity = $3) AND ($4::text IS NULL OR action = $4) AND ($5::text IS NULL OR event_type = $5)`;
    const [items, count] = await Promise.all([
      store.run(`SELECT id, host(ip) AS ip, event_type, severity, action, method, path, status_code,
        user_agent, actor_id, summary, occurrences, first_seen, last_seen, forwarded_claims, spoof_attempt FROM security_events
        WHERE ${where} ORDER BY last_seen DESC, id DESC LIMIT $6 OFFSET $7`, [...values, filters.limit, filters.page * filters.limit]),
      store.run(`SELECT COUNT(*)::int AS total FROM security_events WHERE ${where}`, values)
    ]);
    res.json({ items: req.query.compact === '1' ? items.rows : await withIntel(items.rows), total: count.rows[0]?.total || 0, page: filters.page, limit: filters.limit });
  }));

  // Full dossier of one address: network intelligence, activity, clients and spoofed headers.
  router.get('/ip/:ip', asyncHandler(async (req, res) => {
    const ip = normalizeIp(req.params.ip);
    if (!ip) throw new HttpError(400, 'IP noto‘g‘ri.');
    const [intel, summary, types, agents, claims, paths, block] = await Promise.all([
      lookupIps([ip], { refresh: req.query.refresh === '1' }).then((map) => map.get(ip)).catch(() => null),
      store.run(`SELECT COALESCE(SUM(occurrences),0)::int AS total, MIN(first_seen) AS first_seen, MAX(last_seen) AS last_seen,
        COALESCE(SUM(occurrences) FILTER (WHERE severity IN ('high','critical')),0)::int AS high,
        COALESCE(SUM(occurrences) FILTER (WHERE action IN ('blocked','rejected')),0)::int AS prevented,
        BOOL_OR(spoof_attempt) AS spoof FROM security_events WHERE ip = $1`, [ip]),
      store.run(`SELECT event_type, severity, SUM(occurrences)::int AS total, MAX(last_seen) AS last_seen
        FROM security_events WHERE ip = $1 GROUP BY event_type, severity ORDER BY total DESC LIMIT 30`, [ip]),
      store.run(`SELECT user_agent, SUM(occurrences)::int AS total, MAX(last_seen) AS last_seen
        FROM security_events WHERE ip = $1 GROUP BY user_agent ORDER BY total DESC LIMIT 10`, [ip]),
      store.run(`SELECT forwarded_claims, BOOL_OR(spoof_attempt) AS spoof, SUM(occurrences)::int AS total, MAX(last_seen) AS last_seen
        FROM security_events WHERE ip = $1 AND forwarded_claims <> '' GROUP BY forwarded_claims ORDER BY total DESC LIMIT 10`, [ip]),
      store.run(`SELECT method, path, status_code, SUM(occurrences)::int AS total, MAX(last_seen) AS last_seen
        FROM security_events WHERE ip = $1 GROUP BY method, path, status_code ORDER BY total DESC LIMIT 15`, [ip]),
      store.activeBlock(ip)
    ]);
    res.json({
      ip, public: isPublicIp(ip), intel, block, isCurrent: ip === clientIp(req),
      summary: summary.rows[0], types: types.rows, paths: paths.rows, claims: claims.rows,
      agents: agents.rows.map((row) => ({ ...row, client: parseUserAgent(row.user_agent) }))
    });
  }));

  router.get('/blocks', asyncHandler(async (req, res) => {
    const { ip, page, limit } = eventFilters(req.query);
    const source = req.query.source || null;
    if (source && !['manual', 'automatic'].includes(source)) throw new HttpError(400, 'Blok manbasi noto‘g‘ri.');
    const where = 'blocked_until>NOW() AND ($1::inet IS NULL OR ip=$1::inet) AND ($2::text IS NULL OR source=$2::text)';
    const [result, count] = await Promise.all([
      store.run(`SELECT host(ip) AS ip, blocked_until, reason, source, created_by, created_at
        FROM security_ip_blocks WHERE ${where} ORDER BY created_at DESC,ip LIMIT $3 OFFSET $4`, [ip, source, limit, page*limit]),
      store.run(`SELECT COUNT(*)::int AS total FROM security_ip_blocks WHERE ${where}`, [ip, source])
    ]);
    res.json({ items: result.rows, total: count.rows[0].total, page, limit });
  }));

  router.post('/blocks', asyncHandler(async (req, res) => {
    const ip = normalizeIp(req.body?.ip);
    const minutes = Number(req.body?.minutes);
    const reason = typeof req.body?.reason === 'string' ? safeText(req.body.reason.trim(), 300) : '';
    if (!ip || !Number.isInteger(minutes) || minutes < 5 || minutes > 1440 || reason.length < 5) {
      throw new HttpError(400, 'IP, sabab va 5–1440 daqiqalik muddatni kiriting.');
    }
    if (ip === clientIp(req)) throw new HttpError(400, 'Joriy ulanish IP manzilini bloklash mumkin emas.');
    await store.manualBlock(req, ip, minutes, reason);
    res.status(201).json({ message: 'IP vaqtincha bloklandi.' });
  }));

  router.delete('/blocks/:ip', asyncHandler(async (req, res) => {
    const ip = normalizeIp(req.params.ip);
    if (!ip) throw new HttpError(400, 'IP noto‘g‘ri.');
    await store.unblock(req, ip);
    res.json({ message: 'Blok olib tashlandi.' });
  }));

  // ---- Honeytokens ("tuzoq kalitlar") ----
  router.get('/honeytokens', asyncHandler(async (_req, res) => {
    res.json({ items: await listHoneytokens() });
  }));

  router.post('/honeytokens', asyncHandler(async (req, res) => {
    const label = safeText(String(req.body?.label || '').trim(), 160);
    const placement = safeText(String(req.body?.placement || '').trim(), 200);
    if (label.length < 2) throw new HttpError(400, 'Kalit uchun nom (kamida 2 belgi) kiriting.');
    const item = await createHoneytoken({ label, placement, userId: req.user.id });
    await store.record(req, { type: 'honeytoken_created', severity: 'info', action: 'observed', status: 201,
      summary: `Super admin yangi tuzoq kalit yaratdi: ${label}.` });
    res.status(201).json({ item });
  }));

  router.patch('/honeytokens/:id', asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'ID noto‘g‘ri.');
    if (typeof req.body?.active !== 'boolean') throw new HttpError(400, 'active qiymati kerak.');
    const found = await setHoneytokenActive(id, req.body.active);
    if (!found) throw new HttpError(404, 'Tuzoq kalit topilmadi.');
    res.json({ message: req.body.active ? 'Kalit faollashtirildi.' : 'Kalit o‘chirildi.' });
  }));

  router.delete('/honeytokens/:id', asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'ID noto‘g‘ri.');
    const found = await deleteHoneytoken(id);
    if (!found) throw new HttpError(404, 'Tuzoq kalit topilmadi.');
    res.json({ message: 'Tuzoq kalit o‘chirildi.' });
  }));

  // Attackers that triggered any honeytoken, newest first, enriched with IP intel.
  router.get('/honeytokens/triggers', asyncHandler(async (req, res) => {
    const { hours } = eventFilters({ hours: req.query.hours || 720 });
    const result = await store.run(
      `SELECT host(ip) AS ip, event_type, severity, action, method, path, status_code, user_agent,
              summary, occurrences, first_seen, last_seen, spoof_attempt, forwarded_claims
         FROM security_events
        WHERE event_type = 'honeytoken' AND last_seen >= NOW() - $1 * INTERVAL '1 hour'
        ORDER BY last_seen DESC LIMIT 200`,
      [hours]
    );
    const intel = await lookupIps(result.rows.map((row) => row.ip)).catch(() => new Map());
    res.json({ items: result.rows.map((row) => ({ ...row, intel: intel.get(row.ip) || null, client: parseUserAgent(row.user_agent) })) });
  }));

  return router;
}
