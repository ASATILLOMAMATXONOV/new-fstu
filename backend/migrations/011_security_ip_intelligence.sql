-- Forwarding headers claimed by the client (X-Forwarded-For, X-Real-IP, ...) and
-- whether they tried to present an address different from the real connection.
ALTER TABLE security_events ADD COLUMN IF NOT EXISTS forwarded_claims VARCHAR(300) NOT NULL DEFAULT '';
ALTER TABLE security_events ADD COLUMN IF NOT EXISTS spoof_attempt BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS security_events_spoof_idx ON security_events(last_seen DESC) WHERE spoof_attempt;

-- Cached geolocation / network classification of attacking IP addresses.
CREATE TABLE IF NOT EXISTS security_ip_intel (
  ip INET PRIMARY KEY,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS security_ip_intel_fetched_idx ON security_ip_intel(fetched_at);
