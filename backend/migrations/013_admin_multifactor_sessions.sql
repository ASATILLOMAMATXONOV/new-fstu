ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS mfa_secret_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS mfa_last_step BIGINT NOT NULL DEFAULT -1,
  ADD COLUMN IF NOT EXISTS mfa_recovery_hashes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS admin_login_challenges (
  id UUID PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  admin_id BIGINT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_version INTEGER NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('password_change','enroll','verify','recovery_codes')),
  requires_password_change BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_verified BOOLEAN NOT NULL DEFAULT FALSE,
  pending_secret_encrypted TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  ip INET NOT NULL,
  user_agent_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '5 minutes'
);
CREATE INDEX IF NOT EXISTS admin_login_challenges_user_idx ON admin_login_challenges(admin_id,created_at DESC);
CREATE INDEX IF NOT EXISTS admin_login_challenges_expiry_idx ON admin_login_challenges(expires_at);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  admin_id BIGINT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_version INTEGER NOT NULL,
  ip INET NOT NULL,
  user_agent_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS admin_sessions_user_idx ON admin_sessions(admin_id,created_at DESC);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions(expires_at);

-- Existing password-only sessions must be replaced by a complete MFA login.
UPDATE admin_users SET token_version = token_version + 1;
