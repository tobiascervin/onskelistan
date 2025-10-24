/**
 * Database types för Supabase
 *
 * GENERATE THESE TYPES:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/services/database.types.ts
 *
 * För nu använder vi manuella typer
 */

export interface Database {
  public: {
    Tables: {
      wishlists: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sublists: {
        Row: {
          id: number;
          wishlist_id: string;
          name: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          wishlist_id: string;
          name: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          wishlist_id?: string;
          name?: string;
          order?: number;
          created_at?: string;
        };
      };
      items: {
        Row: {
          id: number;
          sublist_id: number;
          text: string;
          claimed: boolean;
          claimed_by: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          sublist_id: number;
          text: string;
          claimed?: boolean;
          claimed_by?: string | null;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          sublist_id?: number;
          text?: string;
          claimed?: boolean;
          claimed_by?: string | null;
          order?: number;
          created_at?: string;
        };
      };
    };
  };
}
