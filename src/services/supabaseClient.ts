import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config';

/**
 * Supabase client singleton
 */
class SupabaseService {
  private client: SupabaseClient | null = null;

  /**
   * Get or create Supabase client
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      this.client = createClient(
        supabaseConfig.url,
        supabaseConfig.anonKey,
        {
          auth: {
            persistSession: false, // Vi använder inte auth än
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        }
      );
    }
    return this.client;
  }

  /**
   * Check if Supabase is properly configured
   */
  isConfigured(): boolean {
    return (
      supabaseConfig.url !== 'YOUR_SUPABASE_URL' &&
      supabaseConfig.anonKey !== 'YOUR_SUPABASE_ANON_KEY'
    );
  }
}

// Export singleton instance
export const supabase = new SupabaseService().getClient();
export const supabaseService = new SupabaseService();
