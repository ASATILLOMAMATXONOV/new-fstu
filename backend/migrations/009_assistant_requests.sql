CREATE TABLE IF NOT EXISTS assistant_requests (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('appeal', 'hemis')),
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
  student_id VARCHAR(50),
  student_group VARCHAR(80),
  language VARCHAR(5) NOT NULL DEFAULT 'uz',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS assistant_requests_created_at_idx ON assistant_requests (created_at DESC);
