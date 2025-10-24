/**
 * Supabase Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://app.supabase.com
 * 2. Create a new project (free tier)
 * 3. Go to Project Settings > API
 * 4. Copy the Project URL and anon/public key
 * 5. Replace the values below
 */

const SUPABASE_URL: string = "https://wznqavchccxgmcdnwktl.supabase.co";
const SUPABASE_ANON_KEY: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6bnFhdmNoY2N4Z21jZG53a3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTI3NzgsImV4cCI6MjA3Njg4ODc3OH0.bkeRyJRloa59sDrBcPuERyyEPOiad-DqjJ-rK1l8_ek";

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

// Validate configuration
const isNotConfigured =
  SUPABASE_URL === "YOUR_SUPABASE_URL" ||
  SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY";

if (isNotConfigured) {
  console.warn(
    "⚠️  Supabase is not configured! Please update src/config/supabase.config.ts with your project credentials."
  );
}
