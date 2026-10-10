ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
  ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;

UPDATE admin_users
SET
  failed_login_attempts = COALESCE(failed_login_attempts, 0),
  password_changed_at = COALESCE(password_changed_at, created_at, NOW()),
  token_version = COALESCE(token_version, 1)
WHERE
  failed_login_attempts IS NULL
  OR password_changed_at IS NULL
  OR token_version IS NULL;
