import { supabase } from './supabaseClient';

/**
 * Database row types
 */
export interface WishlistRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SublistRow {
  id: number;
  wishlist_id: string;
  name: string;
  order: number;
  created_at: string;
}

export interface ItemRow {
  id: number;
  sublist_id: number;
  text: string;
  claimed: boolean;
  claimed_by: string | null;
  order: number;
  created_at: string;
}

/**
 * Full wishlist with all nested data
 */
export interface FullWishlist extends WishlistRow {
  sublists: (SublistRow & {
    items: ItemRow[];
  })[];
}

/**
 * Service for interacting with wishlists in Supabase
 */
export class WishlistService {
  /**
   * Create a new wishlist
   */
  async createWishlist(name: string): Promise<{ data: WishlistRow | null; error: any }> {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({ name })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get a wishlist by UUID with all sublists and items
   */
  async getWishlist(id: string): Promise<{ data: FullWishlist | null; error: any }> {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        sublists (
          *,
          items (*)
        )
      `)
      .eq('id', id)
      .order('order', { foreignTable: 'sublists', ascending: true })
      .order('order', { foreignTable: 'sublists.items', ascending: true })
      .single();

    return { data: data as FullWishlist | null, error };
  }

  /**
   * Update wishlist name
   */
  async updateWishlistName(id: string, name: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('wishlists')
      .update({ name })
      .eq('id', id);

    return { error };
  }

  /**
   * Delete a wishlist (cascade deletes sublists and items)
   */
  async deleteWishlist(id: string): Promise<{ error: any }> {
    const { error } = await supabase.from('wishlists').delete().eq('id', id);
    return { error };
  }

  /**
   * Create a new sublist
   */
  async createSublist(
    wishlistId: string,
    name: string,
    order: number = 0
  ): Promise<{ data: SublistRow | null; error: any }> {
    const { data, error } = await supabase
      .from('sublists')
      .insert({
        wishlist_id: wishlistId,
        name,
        order,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Update sublist name
   */
  async updateSublistName(id: number, name: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('sublists')
      .update({ name })
      .eq('id', id);

    return { error };
  }

  /**
   * Delete a sublist
   */
  async deleteSublist(id: number): Promise<{ error: any }> {
    const { error } = await supabase.from('sublists').delete().eq('id', id);
    return { error };
  }

  /**
   * Create a new item
   */
  async createItem(
    sublistId: number,
    text: string,
    order: number = 0
  ): Promise<{ data: ItemRow | null; error: any }> {
    const { data, error } = await supabase
      .from('items')
      .insert({
        sublist_id: sublistId,
        text,
        order,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Update item (claim/unclaim or change text)
   */
  async updateItem(
    id: number,
    updates: Partial<Omit<ItemRow, 'id' | 'created_at'>>
  ): Promise<{ data: ItemRow | null; error: any }> {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Claim an item
   */
  async claimItem(id: number, claimedBy: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('items')
      .update({ claimed: true, claimed_by: claimedBy })
      .eq('id', id);

    return { error };
  }

  /**
   * Unclaim an item
   */
  async unclaimItem(id: number): Promise<{ error: any }> {
    const { error } = await supabase
      .from('items')
      .update({ claimed: false, claimed_by: null })
      .eq('id', id);

    return { error };
  }

  /**
   * Delete an item
   */
  async deleteItem(id: number): Promise<{ error: any }> {
    const { error } = await supabase.from('items').delete().eq('id', id);
    return { error };
  }

  /**
   * Check if a wishlist exists
   */
  async wishlistExists(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('id', id)
      .single();

    return !error && !!data;
  }

  /**
   * Update last_accessed_at timestamp for a wishlist
   */
  async updateLastAccessed(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('wishlists')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', id);

    return { error };
  }

  /**
   * Import wishlist from JSON data
   * If wishlist UUID already exists in database, returns existing wishlist
   * Otherwise creates a new wishlist with the same UUID from JSON
   */
  async importFromJson(jsonData: FullWishlist): Promise<{ data: WishlistRow | null; error: any }> {
    try {
      // Check if wishlist already exists in database
      const exists = await this.wishlistExists(jsonData.id);

      if (exists) {
        // Return existing wishlist (user will navigate to it and see latest version)
        return {
          data: {
            id: jsonData.id,
            name: jsonData.name,
            created_at: jsonData.created_at,
            updated_at: jsonData.updated_at
          },
          error: null
        };
      }

      // Wishlist doesn't exist - recreate it with the same UUID
      const { data: wishlist, error: wishlistError } = await supabase
        .from('wishlists')
        .insert({
          id: jsonData.id,  // Use UUID from JSON
          name: jsonData.name
        })
        .select()
        .single();

      if (wishlistError || !wishlist) {
        return { data: null, error: wishlistError };
      }

      // Create sublists and items
      for (const sublist of jsonData.sublists) {
        const { data: newSublist, error: sublistError } = await this.createSublist(
          wishlist.id,
          sublist.name,
          sublist.order
        );

        if (sublistError || !newSublist) {
          console.error('Error creating sublist:', sublistError);
          continue;
        }

        // Create items for this sublist
        for (const item of sublist.items) {
          const { data: newItem, error: itemError } = await this.createItem(
            newSublist.id,
            item.text,
            item.order
          );

          if (itemError || !newItem) {
            console.error('Error creating item:', itemError);
            continue;
          }

          // If item was claimed, update it
          if (item.claimed && item.claimed_by) {
            await this.claimItem(newItem.id, item.claimed_by);
          }
        }
      }

      return { data: wishlist, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Cleanup old wishlists (manually call this or set up a scheduled job)
   */
  async cleanupOldWishlists(): Promise<{ deletedCount: number; error: any }> {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_wishlists');
      return { deletedCount: data || 0, error };
    } catch (error) {
      return { deletedCount: 0, error };
    }
  }
}

// Export singleton instance
export const wishlistService = new WishlistService();
