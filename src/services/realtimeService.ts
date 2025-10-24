import { supabase } from './supabaseClient';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { WishlistRow, SublistRow, ItemRow } from './wishlistService';

/**
 * Callback types for realtime updates
 */
export type WishlistChangeCallback = (
  payload: RealtimePostgresChangesPayload<WishlistRow>
) => void;

export type SublistChangeCallback = (
  payload: RealtimePostgresChangesPayload<SublistRow>
) => void;

export type ItemChangeCallback = (
  payload: RealtimePostgresChangesPayload<ItemRow>
) => void;

/**
 * Service for managing realtime subscriptions
 */
export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to changes on a specific wishlist (all tables)
   */
  subscribeToWishlist(
    wishlistId: string,
    callbacks: {
      onWishlistChange?: WishlistChangeCallback;
      onSublistChange?: SublistChangeCallback;
      onItemChange?: ItemChangeCallback;
    }
  ): string {
    const channelName = `wishlist:${wishlistId}`;

    // Unsubscribe from existing channel if present
    this.unsubscribe(channelName);

    // Create new channel
    const channel = supabase.channel(channelName);

    // Subscribe to wishlist changes
    if (callbacks.onWishlistChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlists',
          filter: `id=eq.${wishlistId}`,
        },
        callbacks.onWishlistChange
      );
    }

    // Subscribe to sublist changes
    if (callbacks.onSublistChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sublists',
          filter: `wishlist_id=eq.${wishlistId}`,
        },
        callbacks.onSublistChange
      );
    }

    // Subscribe to item changes
    // Note: We need to get items via sublist_id, but we filter by wishlist
    // This is a bit tricky - we listen to ALL items and filter in callback
    if (callbacks.onItemChange) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
        },
        callbacks.onItemChange
      );
    }

    // Start subscription
    channel.subscribe();

    this.channels.set(channelName, channel);
    return channelName;
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll(): Promise<void> {
    const promises = Array.from(this.channels.keys()).map((name) =>
      this.unsubscribe(name)
    );
    await Promise.all(promises);
  }

  /**
   * Get active channel names
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Export singleton
export const realtimeService = new RealtimeService();
