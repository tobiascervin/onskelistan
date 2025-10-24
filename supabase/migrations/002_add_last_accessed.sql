-- Add last_accessed_at column to track when wishlists were last opened
ALTER TABLE wishlists
ADD COLUMN last_accessed_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing rows to have last_accessed_at = created_at
UPDATE wishlists
SET last_accessed_at = created_at
WHERE last_accessed_at IS NULL;

-- Create index for efficient cleanup queries
CREATE INDEX idx_wishlists_last_accessed ON wishlists(last_accessed_at);

-- Function to delete wishlists older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_wishlists()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete wishlists not accessed in 30 days
  WITH deleted AS (
    DELETE FROM wishlists
    WHERE last_accessed_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (optional)
-- For manual cleanup, you can call: SELECT cleanup_old_wishlists();

COMMENT ON FUNCTION cleanup_old_wishlists() IS 'Deletes wishlists that have not been accessed in 30 days. Returns number of deleted wishlists.';
