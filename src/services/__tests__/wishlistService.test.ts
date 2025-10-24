import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WishlistService } from '../wishlistService';
import { mockData } from '../../__mocks__/supabase';
import { createMockWishlist, createFullMockWishlist } from '../../__tests__/helpers';

// Mock the supabase client - must use factory function to avoid hoisting issues
vi.mock('../supabaseClient', async () => {
  const { mockSupabase } = await import('../../__mocks__/supabase');
  return {
    supabase: mockSupabase,
  };
});

describe('WishlistService', () => {
  let wishlistService: WishlistService;

  beforeEach(() => {
    mockData.reset();
    vi.clearAllMocks();
    wishlistService = new WishlistService();
  });

  describe('createWishlist', () => {
    it('should create a new wishlist', async () => {
      const { data, error } = await wishlistService.createWishlist('Test Wishlist');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.name).toBe('Test Wishlist');
      expect(data?.id).toBeDefined();
    });

    it('should add wishlist to database', async () => {
      await wishlistService.createWishlist('Test');
      expect(mockData.wishlists).toHaveLength(1);
      expect(mockData.wishlists[0].name).toBe('Test');
    });
  });

  describe('getWishlist', () => {
    it('should get wishlist by ID', async () => {
      const wishlist = createMockWishlist();
      mockData.wishlists.push(wishlist);

      const { data, error } = await wishlistService.getWishlist(wishlist.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(wishlist.id);
    });

    it('should return null for non-existent wishlist', async () => {
      const { data, error } = await wishlistService.getWishlist('non-existent-id');

      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('updateWishlistName', () => {
    it('should update wishlist name', async () => {
      const wishlist = createMockWishlist({ name: 'Old Name' });
      mockData.wishlists.push(wishlist);

      const { error } = await wishlistService.updateWishlistName(wishlist.id, 'New Name');

      expect(error).toBeNull();
      expect(mockData.wishlists[0].name).toBe('New Name');
    });
  });

  describe('deleteWishlist', () => {
    it('should delete wishlist', async () => {
      const wishlist = createMockWishlist();
      mockData.wishlists.push(wishlist);

      const { error } = await wishlistService.deleteWishlist(wishlist.id);

      expect(error).toBeNull();
      expect(mockData.wishlists).toHaveLength(0);
    });
  });

  describe('createSublist', () => {
    it('should create a new sublist', async () => {
      const wishlist = createMockWishlist();
      mockData.wishlists.push(wishlist);

      const { data, error } = await wishlistService.createSublist(wishlist.id, 'Test Person', 0);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.name).toBe('Test Person');
      expect(data?.wishlist_id).toBe(wishlist.id);
      expect(data?.order).toBe(0);
    });

    it('should add sublist to database', async () => {
      const wishlist = createMockWishlist();
      mockData.wishlists.push(wishlist);

      await wishlistService.createSublist(wishlist.id, 'Test', 0);

      expect(mockData.sublists).toHaveLength(1);
      expect(mockData.sublists[0].name).toBe('Test');
    });
  });

  describe('updateSublistName', () => {
    it('should update sublist name', async () => {
      mockData.sublists.push({ id: 1, name: 'Old', wishlist_id: 'test', order: 0 } as any);

      const { error } = await wishlistService.updateSublistName(1, 'New');

      expect(error).toBeNull();
      expect(mockData.sublists[0].name).toBe('New');
    });
  });

  describe('deleteSublist', () => {
    it('should delete sublist', async () => {
      mockData.sublists.push({ id: 1, name: 'Test', wishlist_id: 'test', order: 0 } as any);

      const { error } = await wishlistService.deleteSublist(1);

      expect(error).toBeNull();
      expect(mockData.sublists).toHaveLength(0);
    });
  });

  describe('createItem', () => {
    it('should create a new item', async () => {
      const { data, error } = await wishlistService.createItem(1, 'Test Item', 0);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.text).toBe('Test Item');
      expect(data?.sublist_id).toBe(1);
      expect(data?.claimed).toBe(false);
      expect(data?.claimed_by).toBeNull();
    });

    it('should add item to database', async () => {
      await wishlistService.createItem(1, 'Test', 0);

      expect(mockData.items).toHaveLength(1);
      expect(mockData.items[0].text).toBe('Test');
    });
  });

  describe('updateItem', () => {
    it('should update item properties', async () => {
      mockData.items.push({
        id: 1,
        sublist_id: 1,
        text: 'Old',
        claimed: false,
        claimed_by: null,
        order: 0,
      } as any);

      const { data, error } = await wishlistService.updateItem(1, {
        text: 'New',
        claimed: true,
        claimed_by: 'John',
      });

      expect(error).toBeNull();
      expect(mockData.items[0].text).toBe('New');
      expect(mockData.items[0].claimed).toBe(true);
      expect(mockData.items[0].claimed_by).toBe('John');
    });
  });

  describe('claimItem', () => {
    it('should claim an item', async () => {
      mockData.items.push({
        id: 1,
        sublist_id: 1,
        text: 'Test',
        claimed: false,
        claimed_by: null,
        order: 0,
      } as any);

      const { error } = await wishlistService.claimItem(1, 'John');

      expect(error).toBeNull();
      expect(mockData.items[0].claimed).toBe(true);
      expect(mockData.items[0].claimed_by).toBe('John');
    });
  });

  describe('unclaimItem', () => {
    it('should unclaim an item', async () => {
      mockData.items.push({
        id: 1,
        sublist_id: 1,
        text: 'Test',
        claimed: true,
        claimed_by: 'John',
        order: 0,
      } as any);

      const { error } = await wishlistService.unclaimItem(1);

      expect(error).toBeNull();
      expect(mockData.items[0].claimed).toBe(false);
      expect(mockData.items[0].claimed_by).toBeNull();
    });
  });

  describe('deleteItem', () => {
    it('should delete item', async () => {
      mockData.items.push({ id: 1, sublist_id: 1, text: 'Test', order: 0 } as any);

      const { error } = await wishlistService.deleteItem(1);

      expect(error).toBeNull();
      expect(mockData.items).toHaveLength(0);
    });
  });

  describe('wishlistExists', () => {
    it('should return true if wishlist exists', async () => {
      const wishlist = createMockWishlist();
      mockData.wishlists.push(wishlist);

      const exists = await wishlistService.wishlistExists(wishlist.id);
      expect(exists).toBe(true);
    });

    it('should return false if wishlist does not exist', async () => {
      const exists = await wishlistService.wishlistExists('non-existent');
      expect(exists).toBe(false);
    });
  });

  describe('updateLastAccessed', () => {
    it('should update last_accessed_at timestamp', async () => {
      const wishlist = createMockWishlist();
      mockData.wishlists.push(wishlist);

      const { error } = await wishlistService.updateLastAccessed(wishlist.id);

      expect(error).toBeNull();
      // The timestamp should be updated in the mock
    });
  });

  describe('importFromJson', () => {
    it('should return existing wishlist if it already exists', async () => {
      const existingWishlist = createMockWishlist();
      mockData.wishlists.push(existingWishlist);

      const jsonData = createFullMockWishlist({ wishlist: existingWishlist });

      const { data, error } = await wishlistService.importFromJson(jsonData);

      expect(error).toBeNull();
      expect(data?.id).toBe(existingWishlist.id);
      // Should not create new sublists/items
      expect(mockData.sublists).toHaveLength(0);
    });

    it('should create new wishlist if it does not exist', async () => {
      const jsonData = createFullMockWishlist({
        wishlist: { id: 'new-uuid-123' },
        sublistCount: 2,
        itemsPerSublist: 3,
      });

      const { data, error } = await wishlistService.importFromJson(jsonData);

      expect(error).toBeNull();
      expect(data?.id).toBe('new-uuid-123');
      expect(mockData.wishlists).toHaveLength(1);
      expect(mockData.sublists).toHaveLength(2);
      expect(mockData.items).toHaveLength(6); // 2 sublists * 3 items
    });

    it('should import sublists and items', async () => {
      const jsonData = createFullMockWishlist({
        wishlist: { id: 'new-uuid' },
        sublistCount: 1,
        itemsPerSublist: 2,
      });

      await wishlistService.importFromJson(jsonData);

      expect(mockData.sublists[0].name).toBeDefined();
      expect(mockData.items[0].text).toBeDefined();
      expect(mockData.items[1].text).toBeDefined();
    });

    it('should handle claimed items during import', async () => {
      const jsonData = createFullMockWishlist();
      // Mark first item as claimed
      jsonData.sublists[0].items[0].claimed = true;
      jsonData.sublists[0].items[0].claimed_by = 'John';

      await wishlistService.importFromJson(jsonData);

      const claimedItem = mockData.items.find((item) => item.claimed);
      expect(claimedItem).toBeDefined();
      expect(claimedItem?.claimed_by).toBe('John');
    });
  });

  describe('cleanupOldWishlists', () => {
    it('should call cleanup RPC function', async () => {
      const { mockSupabase } = await import('../../__mocks__/supabase');
      const { deletedCount, error } = await wishlistService.cleanupOldWishlists();

      expect(error).toBeNull();
      expect(deletedCount).toBe(0); // Mock returns 0
      expect(mockSupabase.rpc).toHaveBeenCalledWith('cleanup_old_wishlists');
    });
  });
});
