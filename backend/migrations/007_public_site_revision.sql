CREATE TABLE IF NOT EXISTS public_site_revisions (
  key TEXT PRIMARY KEY,
  revision BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public_site_revisions (key, revision, updated_at)
VALUES ('site', 1, NOW())
ON CONFLICT (key) DO NOTHING;
