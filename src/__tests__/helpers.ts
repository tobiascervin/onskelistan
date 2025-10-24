import type { FullWishlist, WishlistRow, SublistRow, ItemRow } from '../services/wishlistService';

/**
 * Create a mock wishlist for testing
 */
export function createMockWishlist(overrides?: Partial<WishlistRow>): WishlistRow {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Wishlist',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create a mock sublist for testing
 */
export function createMockSublist(overrides?: Partial<SublistRow>): SublistRow {
  return {
    id: 1,
    wishlist_id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Person',
    order: 0,
    created_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create a mock item for testing
 */
export function createMockItem(overrides?: Partial<ItemRow>): ItemRow {
  return {
    id: 1,
    sublist_id: 1,
    text: 'Test Item',
    claimed: false,
    claimed_by: null,
    order: 0,
    created_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create a full mock wishlist with sublists and items
 */
export function createFullMockWishlist(options?: {
  wishlist?: Partial<WishlistRow>;
  sublistCount?: number;
  itemsPerSublist?: number;
}): FullWishlist {
  const { wishlist = {}, sublistCount = 2, itemsPerSublist = 3 } = options || {};

  const mockWishlist = createMockWishlist(wishlist);
  const sublists = [];

  for (let i = 0; i < sublistCount; i++) {
    const sublist: any = {
      ...createMockSublist({ id: i + 1, order: i }),
      items: [],
    };

    for (let j = 0; j < itemsPerSublist; j++) {
      sublist.items.push(
        createMockItem({
          id: i * itemsPerSublist + j + 1,
          sublist_id: i + 1,
          order: j,
          text: `Item ${j + 1}`,
        })
      );
    }

    sublists.push(sublist);
  }

  return {
    ...mockWishlist,
    sublists,
  };
}

/**
 * Wait for async operations to complete
 */
export function waitFor(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulate user interaction delay
 */
export async function simulateUserAction(action: () => void | Promise<void>): Promise<void> {
  await action();
  await waitFor(10);
}
