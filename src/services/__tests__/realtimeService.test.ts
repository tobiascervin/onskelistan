import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealtimeService } from '../realtimeService';

// Mock the supabase client - must use factory function to avoid hoisting issues
vi.mock('../supabaseClient', async () => {
  const { mockSupabase } = await import('../../__mocks__/supabase');
  return {
    supabase: mockSupabase,
  };
});

describe('RealtimeService', () => {
  let realtimeService: RealtimeService;

  beforeEach(() => {
    vi.clearAllMocks();
    realtimeService = new RealtimeService();
  });

  describe('subscribeToWishlist', () => {
    it('should create a channel for wishlist', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      const wishlistId = 'test-uuid-123';
      const callbacks = {
        onWishlistChange: vi.fn(),
        onSublistChange: vi.fn(),
        onItemChange: vi.fn(),
      };

      realtimeService.subscribeToWishlist(wishlistId, callbacks);

      expect(mockSupabase.channel).toHaveBeenCalledWith(`wishlist:${wishlistId}`);
    });

    it('should return channel name', () => {
      const wishlistId = 'test-uuid';
      const channelName = realtimeService.subscribeToWishlist(wishlistId, {});

      expect(channelName).toBe(`wishlist:${wishlistId}`);
    });

    it('should unsubscribe from existing channel before creating new one', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      const wishlistId = 'test-uuid';

      // Subscribe twice
      realtimeService.subscribeToWishlist(wishlistId, {});
      realtimeService.subscribeToWishlist(wishlistId, {});

      // Should have created two channels (second one after removing first)
      expect(mockSupabase.channel).toHaveBeenCalledTimes(2);
    });

    it('should register wishlist change callback', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      const wishlistId = 'test-uuid';
      const onWishlistChange = vi.fn();

      realtimeService.subscribeToWishlist(wishlistId, { onWishlistChange });

      // Get the actual channel that was created (from the last call to channel())
      const channelSpy = mockSupabase.channel as any;
      const mockChannel = channelSpy.mock.results[channelSpy.mock.results.length - 1].value;

      expect(mockChannel.on).toHaveBeenCalled();
    });

    it('should register sublist change callback', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      const wishlistId = 'test-uuid';
      const onSublistChange = vi.fn();

      realtimeService.subscribeToWishlist(wishlistId, { onSublistChange });

      // Get the actual channel that was created
      const channelSpy = mockSupabase.channel as any;
      const mockChannel = channelSpy.mock.results[channelSpy.mock.results.length - 1].value;

      expect(mockChannel.on).toHaveBeenCalled();
    });

    it('should register item change callback', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      const wishlistId = 'test-uuid';
      const onItemChange = vi.fn();

      realtimeService.subscribeToWishlist(wishlistId, { onItemChange });

      // Get the actual channel that was created
      const channelSpy = mockSupabase.channel as any;
      const mockChannel = channelSpy.mock.results[channelSpy.mock.results.length - 1].value;

      expect(mockChannel.on).toHaveBeenCalled();
    });

    it('should call subscribe on channel', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      const wishlistId = 'test-uuid';

      realtimeService.subscribeToWishlist(wishlistId, {});

      // Get the actual channel that was created
      const channelSpy = mockSupabase.channel as any;
      const mockChannel = channelSpy.mock.results[channelSpy.mock.results.length - 1].value;

      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should remove channel from Supabase', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      const wishlistId = 'test-uuid';

      // First subscribe
      const channelName = realtimeService.subscribeToWishlist(wishlistId, {});

      // Then unsubscribe
      await realtimeService.unsubscribe(channelName);

      expect(mockSupabase.removeChannel).toHaveBeenCalled();
    });

    it('should remove channel from internal map', async () => {
      const wishlistId = 'test-uuid';

      const channelName = realtimeService.subscribeToWishlist(wishlistId, {});
      expect(realtimeService.getActiveChannels()).toContain(channelName);

      await realtimeService.unsubscribe(channelName);
      expect(realtimeService.getActiveChannels()).not.toContain(channelName);
    });

    it('should do nothing if channel does not exist', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      await realtimeService.unsubscribe('non-existent-channel');

      expect(mockSupabase.removeChannel).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribeAll', () => {
    it('should unsubscribe from all channels', async () => {
      // Subscribe to multiple wishlists
      realtimeService.subscribeToWishlist('uuid-1', {});
      realtimeService.subscribeToWishlist('uuid-2', {});

      expect(realtimeService.getActiveChannels()).toHaveLength(2);

      await realtimeService.unsubscribeAll();

      expect(realtimeService.getActiveChannels()).toHaveLength(0);
    });

    it('should call removeChannel for each channel', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      realtimeService.subscribeToWishlist('uuid-1', {});
      realtimeService.subscribeToWishlist('uuid-2', {});

      await realtimeService.unsubscribeAll();

      expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(2);
    });
  });

  describe('getActiveChannels', () => {
    it('should return empty array initially', () => {
      expect(realtimeService.getActiveChannels()).toEqual([]);
    });

    it('should return list of active channel names', () => {
      realtimeService.subscribeToWishlist('uuid-1', {});
      realtimeService.subscribeToWishlist('uuid-2', {});

      const channels = realtimeService.getActiveChannels();

      expect(channels).toContain('wishlist:uuid-1');
      expect(channels).toContain('wishlist:uuid-2');
      expect(channels).toHaveLength(2);
    });

    it('should update after unsubscribing', async () => {
      realtimeService.subscribeToWishlist('uuid-1', {});
      realtimeService.subscribeToWishlist('uuid-2', {});

      await realtimeService.unsubscribe('wishlist:uuid-1');

      const channels = realtimeService.getActiveChannels();
      expect(channels).not.toContain('wishlist:uuid-1');
      expect(channels).toContain('wishlist:uuid-2');
      expect(channels).toHaveLength(1);
    });
  });
});
