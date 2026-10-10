UPDATE content_entries
SET
  metadata = COALESCE(metadata, '{}'::jsonb) - 'files',
  updated_at = NOW()
WHERE resource = 'faculty-page-menus'
  AND metadata ? 'files';
