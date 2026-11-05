CREATE TABLE IF NOT EXISTS security_events (
  id BIGSERIAL PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  bucket TIMESTAMPTZ NOT NULL DEFAULT date_trunc('minute', NOW()),
  ip INET NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'medium', 'high', 'critical')),
  action TEXT NOT NULL CHECK (action IN ('observed', 'rejected', 'blocked', 'unblocked')),
  method VARCHAR(16) NOT NULL,
  path VARCHAR(240) NOT NULL,
  status_code INTEGER NOT NULL,
  user_agent VARCHAR(200) NOT NULL DEFAULT '',
  actor_id BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
  summary VARCHAR(300) NOT NULL,
  occurrences INTEGER NOT NULL DEFAULT 1,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bucket, fingerprint)
);
CREATE INDEX IF NOT EXISTS security_events_last_seen_idx ON security_events(last_seen DESC, id DESC);
CREATE INDEX IF NOT EXISTS security_events_ip_idx ON security_events(ip, last_seen DESC);

CREATE TABLE IF NOT EXISTS security_ip_blocks (
  ip INET PRIMARY KEY,
  blocked_until TIMESTAMPTZ NOT NULL,
  reason VARCHAR(300) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('automatic', 'manual')),
  created_by BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_counters (
  ip INET NOT NULL,
  kind TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (ip, kind)
);
CREATE INDEX IF NOT EXISTS security_counters_expiry_idx ON security_counters(expires_at);
