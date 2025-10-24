# Database Migration Guide

## Applying Migrations

### 002_add_last_accessed.sql

This migration adds automatic cleanup functionality for old wishlists.

**What it does:**
- Adds `last_accessed_at` column to track when wishlists were last opened
- Creates an index for efficient queries
- Creates a `cleanup_old_wishlists()` function that deletes wishlists not accessed in 30 days

**How to apply:**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/002_add_last_accessed.sql`
4. Paste into the SQL editor
5. Click **Run**

**Verify the migration:**

```sql
-- Check if column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'wishlists' AND column_name = 'last_accessed_at';

-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'cleanup_old_wishlists';
```

## Automatic Cleanup

The cleanup function can be called manually or scheduled:

### Manual Cleanup

```sql
SELECT cleanup_old_wishlists();
-- Returns the number of deleted wishlists
```

### Scheduled Cleanup (Optional)

You can set up a scheduled job in Supabase to run cleanup automatically.

**Important:** `pg_cron` extension may not be available on all Supabase tiers. If you're on the Free tier, you may need to manually run cleanup or use an external scheduler (see alternatives below).

#### Step 1: Enable pg_cron Extension

1. Open your Supabase project dashboard at [app.supabase.com](https://app.supabase.com)
2. In the left sidebar, click **Database**
3. Click **Extensions** (in the Database submenu)
4. In the search box, type `pg_cron`
5. Find `pg_cron` in the list and click the toggle or **Enable** button
6. Wait a few seconds for the extension to activate

#### Step 2: Create the Cron Job

1. In the left sidebar, click **SQL Editor**
2. Click **New query** to create a new SQL query
3. Copy and paste the following SQL code:

```sql
-- Run cleanup every day at 3 AM UTC
SELECT cron.schedule(
  'cleanup-old-wishlists',
  '0 3 * * *',
  $$SELECT cleanup_old_wishlists()$$
);
```

4. Click **Run** (or press Ctrl/Cmd + Enter)
5. You should see a success message with the job ID

#### Step 3: Verify the Cron Job

In the same SQL Editor, run this query to see all scheduled jobs:

```sql
SELECT * FROM cron.job;
```

You should see your `cleanup-old-wishlists` job listed with:
- `jobname`: cleanup-old-wishlists
- `schedule`: 0 3 * * *
- `command`: SELECT cleanup_old_wishlists()
- `active`: true

#### Managing Cron Jobs

**List all cron jobs:**
```sql
SELECT jobid, jobname, schedule, active
FROM cron.job
ORDER BY jobid;
```

**View cron job execution history:**
```sql
SELECT job_name, status, return_message, start_time, end_time
FROM cron.job_run_details
WHERE job_name = 'cleanup-old-wishlists'
ORDER BY start_time DESC
LIMIT 10;
```

**Disable a cron job (without deleting it):**
```sql
UPDATE cron.job
SET active = false
WHERE jobname = 'cleanup-old-wishlists';
```

**Delete a cron job:**
```sql
SELECT cron.unschedule('cleanup-old-wishlists');
```

**Re-enable a disabled job:**
```sql
UPDATE cron.job
SET active = true
WHERE jobname = 'cleanup-old-wishlists';
```

#### Alternatives (if pg_cron is not available)

**Option 1: Manual Cleanup**
Run this SQL query manually whenever you want to clean up old wishlists:
```sql
SELECT cleanup_old_wishlists();
```

**Option 2: External Scheduler**
Use a free service like:
- **GitHub Actions** (scheduled workflow)
- **Vercel Cron Jobs** (if deployed on Vercel)
- **Zapier/Make** (free tier with scheduled tasks)

Create a simple HTTP endpoint or serverless function that calls:
```typescript
const { data, error } = await supabase.rpc('cleanup_old_wishlists');
```

## Testing

Test that the timestamp updates correctly:

```sql
-- Get a wishlist ID
SELECT id, name, last_accessed_at FROM wishlists LIMIT 1;

-- Manually update last_accessed_at to 31 days ago
UPDATE wishlists
SET last_accessed_at = NOW() - INTERVAL '31 days'
WHERE id = 'YOUR_WISHLIST_ID';

-- Run cleanup
SELECT cleanup_old_wishlists();

-- Verify the old wishlist was deleted
SELECT COUNT(*) FROM wishlists WHERE id = 'YOUR_WISHLIST_ID';
-- Should return 0
```

## Troubleshooting

### "extension 'pg_cron' is not available"

This means `pg_cron` is not enabled on your Supabase tier. Solutions:
1. **Upgrade to a paid tier** that supports pg_cron
2. **Use manual cleanup** - Run `SELECT cleanup_old_wishlists();` periodically
3. **Use an external scheduler** (see Alternatives above)

### "permission denied for schema cron"

You may not have permissions to create cron jobs. Try:
1. Check your database role permissions
2. Make sure you're running the query as a database admin
3. Contact Supabase support if the issue persists

### Cron job not running

Check the execution history:
```sql
SELECT job_name, status, return_message, start_time, end_time
FROM cron.job_run_details
WHERE job_name = 'cleanup-old-wishlists'
ORDER BY start_time DESC
LIMIT 10;
```

If there are no entries:
- Wait until the scheduled time (3 AM UTC by default)
- Check that the job is active: `SELECT * FROM cron.job WHERE jobname = 'cleanup-old-wishlists';`
- The `active` column should be `true`

### Testing without waiting for 3 AM

Temporarily change the schedule to run every minute for testing:
```sql
-- Update to run every minute
UPDATE cron.job
SET schedule = '* * * * *'
WHERE jobname = 'cleanup-old-wishlists';

-- Wait 1-2 minutes, then check execution history
SELECT * FROM cron.job_run_details
WHERE job_name = 'cleanup-old-wishlists'
ORDER BY start_time DESC;

-- Change back to 3 AM daily
UPDATE cron.job
SET schedule = '0 3 * * *'
WHERE jobname = 'cleanup-old-wishlists';
```

## Rollback (if needed)

If you need to undo this migration:

```sql
-- Remove cron job (if created)
SELECT cron.unschedule('cleanup-old-wishlists');

-- Drop the function
DROP FUNCTION IF EXISTS cleanup_old_wishlists();

-- Drop the index
DROP INDEX IF EXISTS idx_wishlists_last_accessed;

-- Remove the column
ALTER TABLE wishlists DROP COLUMN IF EXISTS last_accessed_at;
```
