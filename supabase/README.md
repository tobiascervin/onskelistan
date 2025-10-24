# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Name: `gift-share` (or your choice)
   - Database Password: (generate a strong one)
   - Region: Choose closest to you
   - Pricing Plan: **Free**
4. Click "Create new project" (takes ~2 minutes)

## 2. Run Database Migration

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click "Run" (bottom right)
5. You should see "Success. No rows returned"

## 3. Get API Credentials

1. Go to **Project Settings** → **API** (gear icon in sidebar)
2. Find these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

## 4. Configure Your App

### Option A: For Development (Quick)
Edit `src/config/supabase.config.ts`:
```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### Option B: For Production (Recommended)
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 5. Verify Setup

1. Rebuild TypeScript: `npm run build`
2. Open `index.html` in browser
3. Open DevTools Console - you should NOT see the warning about unconfigured Supabase
4. Create a wishlist - it should save to Supabase!

## 6. View Your Data

Go to **Table Editor** in Supabase dashboard to see your data:
- `wishlists` table
- `sublists` table
- `items` table

## Realtime

Realtime is automatically enabled! When one user updates a wishlist, all other users viewing the same UUID will see the changes instantly.

## Troubleshooting

**"Row Level Security policy violation"**
- Make sure you ran the entire migration SQL
- Check that RLS policies are created

**"Invalid API key"**
- Double-check you copied the **anon/public** key (not service_role key)
- Make sure there are no extra spaces

**Data not syncing**
- Check browser console for errors
- Verify Realtime is enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE wishlists;`
