import { createHash } from 'node:crypto';
import { query, withTransaction } from '../../db/pool.js';
import { env } from '../../config/env.js';
import { clientIp, safePath, safeText } from './security-rules.js';
import { inspectForwarding } from './security-intel.js';

export function createSecurityStore(run = query, transaction = withTransaction) {
  async function increment(ip, kind, seconds) {
    const result = await run(`INSERT INTO security_counters (ip, kind, count, expires_at)
      VALUES ($1, $2, 1, NOW() + $3 * INTERVAL '1 second')
      ON CONFLICT (ip, kind) DO UPDATE SET
        count = CASE WHEN security_counters.expires_at <= NOW() THEN 1 ELSE LEAST(security_counters.count + 1, 1000000) END,
        expires_at = CASE WHEN security_counters.expires_at <= NOW() THEN EXCLUDED.expires_at ELSE security_counters.expires_at END
      RETURNING count, expires_at`, [ip, kind, seconds]);
    return result.rows[0];
  }

  async function activeBlock(ip) {
    const result = await run('SELECT host(ip) AS ip, blocked_until, reason, source, created_at, created_by FROM security_ip_blocks WHERE ip = $1 AND blocked_until > NOW()', [ip]);
    return result.rows[0] || null;
  }

  async function record(req, event, execute = run, targetIp = clientIp(req)) {
    if (!targetIp) return;
    const path = safePath(req);
    const status = event.status || 0;
    const action = event.action || (status >= 400 ? 'rejected' : 'observed');
    // Forwarding headers are recorded only for requests from the target itself (not for admin actions on it).
    const forwarding = targetIp === clientIp(req) ? inspectForwarding(req, targetIp) : { claims: '', spoofAttempt: false };
    // No request bodies, query values, cookies, credentials or authorization headers.
    const fingerprint = createHash('sha256').update(JSON.stringify([targetIp, event.type, action, req.method, path, status, req.user?.id || null,
      event.type === 'manual_block' ? safeText(event.summary, 300) : null])).digest('hex');
    await execute(`INSERT INTO security_events
      (fingerprint, ip, event_type, severity, action, method, path, status_code, user_agent, actor_id, summary,
        forwarded_claims, spoof_attempt)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (bucket, fingerprint) DO UPDATE SET
        occurrences = LEAST(security_events.occurrences + 1, 1000000), last_seen = NOW(),
        forwarded_claims = CASE WHEN EXCLUDED.forwarded_claims <> '' THEN EXCLUDED.forwarded_claims ELSE security_events.forwarded_claims END,
        spoof_attempt = security_events.spoof_attempt OR EXCLUDED.spoof_attempt`,
    [fingerprint, targetIp, event.type, event.severity, action, safeText(req.method, 16), path, status,
      safeText(req.headers?.['user-agent'], 200), req.user?.id || null, safeText(event.summary, 300),
      forwarding.claims, forwarding.spoofAttempt]);
  }

  async function block(ip, reason, minutes = env.securityBlockMinutes) {
    await run(`INSERT INTO security_ip_blocks (ip, blocked_until, reason, source)
      VALUES ($1, NOW() + $2 * INTERVAL '1 minute', $3, 'automatic')
      ON CONFLICT (ip) DO UPDATE SET blocked_until = GREATEST(security_ip_blocks.blocked_until, EXCLUDED.blocked_until),
        reason = CASE WHEN security_ip_blocks.source = 'manual' AND security_ip_blocks.blocked_until > NOW()
          THEN security_ip_blocks.reason ELSE EXCLUDED.reason END,
        source = CASE WHEN security_ip_blocks.source='manual' AND security_ip_blocks.blocked_until>NOW()
          THEN 'manual' ELSE 'automatic' END,
        created_by = CASE WHEN security_ip_blocks.source='manual' AND security_ip_blocks.blocked_until>NOW()
          THEN security_ip_blocks.created_by ELSE NULL END,
        created_at = CASE WHEN security_ip_blocks.blocked_until>NOW() THEN security_ip_blocks.created_at ELSE NOW() END`,
    [ip, minutes, safeText(reason, 300)]);
  }

  async function detect(req, event, threshold, kind = 'suspicious') {
    const ip = clientIp(req);
    if (!ip) return false;
    const counter = await increment(ip, kind, 600);
    const blocked = Number(counter.count) >= threshold;
    if (blocked) await block(ip, event.summary);
    await record(req, { ...event, action: blocked ? 'blocked' : 'rejected' });
    return blocked;
  }

  async function manualBlock(req, ip, minutes, reason) {
    return transaction(async (client) => {
      await client.query(`INSERT INTO security_ip_blocks (ip, blocked_until, reason, source, created_by)
        VALUES ($1, NOW() + $2 * INTERVAL '1 minute', $3, 'manual', $4)
        ON CONFLICT (ip) DO UPDATE SET blocked_until = EXCLUDED.blocked_until, reason = EXCLUDED.reason,
          source = 'manual', created_by = EXCLUDED.created_by, created_at = NOW()`, [ip, minutes, reason, req.user.id]);
      await record(req, { type: 'manual_block', severity: 'high', action: 'blocked', status: 201, summary: reason }, client.query.bind(client), ip);
    });
  }

  async function unblock(req, ip) {
    return transaction(async (client) => {
      await client.query('DELETE FROM security_ip_blocks WHERE ip = $1', [ip]);
      await client.query('DELETE FROM security_counters WHERE ip = $1', [ip]);
      await record(req, { type: 'manual_unblock', severity: 'info', action: 'unblocked', status: 200,
        summary: 'Super admin IP blokini va urinish hisoblagichlarini tozaladi.' }, client.query.bind(client), ip);
    });
  }

  async function cleanup() {
    // Bounded deletions keep retention work short even after a long downtime.
    await run(`DELETE FROM security_events WHERE id IN
      (SELECT id FROM security_events WHERE last_seen < NOW() - $1 * INTERVAL '1 day' LIMIT 10000)`, [env.securityRetentionDays]);
    await run(`DELETE FROM security_counters WHERE (ip,kind) IN
      (SELECT ip,kind FROM security_counters WHERE expires_at < NOW() LIMIT 10000)`);
    await run('DELETE FROM security_ip_blocks WHERE blocked_until < NOW()');
    await run("DELETE FROM admin_login_challenges WHERE expires_at < NOW()-INTERVAL '1 hour'");
    await run("DELETE FROM admin_sessions WHERE expires_at < NOW()-INTERVAL '1 day' OR revoked_at < NOW()-INTERVAL '1 day'");
  }

  return { increment, activeBlock, record, block, detect, manualBlock, unblock, cleanup, run };
}

export const securityStore = createSecurityStore();
