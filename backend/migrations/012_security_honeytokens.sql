-- Honeytokens ("tuzoq kalitlar"): fake credentials planted around the system.
-- A legitimate user never sends them, so any request carrying one is hostile.
-- The matching IP is recorded and auto-blocked. Nothing is sent back to the client.
CREATE TABLE IF NOT EXISTS security_honeytokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  label VARCHAR(160) NOT NULL DEFAULT '',
  placement VARCHAR(200) NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  triggers INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  last_ip INET,
  created_by BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS security_honeytokens_active_idx ON security_honeytokens(active, last_triggered_at DESC);
