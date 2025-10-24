import { vi } from 'vitest';

/**
 * Mock data store for testing
 */
export const mockData: {
  wishlists: any[];
  sublists: any[];
  items: any[];
  reset: () => void;
} = {
  wishlists: [] as any[],
  sublists: [] as any[],
  items: [] as any[],
  reset() {
    this.wishlists = [];
    this.sublists = [];
    this.items = [];
  },
};

/**
 * Mock channel for realtime subscriptions
 */
const createMockChannel = () => {
  const listeners: any[] = [];

  return {
    on: vi.fn((event: string, config: any, callback: any) => {
      listeners.push({ event, config, callback });
      return createMockChannel();
    }),
    subscribe: vi.fn((callback?: any) => {
      if (callback) callback('SUBSCRIBED');
      return createMockChannel();
    }),
    unsubscribe: vi.fn(),
  };
};

/**
 * Mock query builder
 */
const createQueryBuilder = (table: string) => {
  let query: any = {
    table,
    filters: {},
    selectFields: '*',
    orderFields: [],
    singleResult: false,
  };

  const builder: any = {
    select: vi.fn((fields = '*') => {
      query.selectFields = fields;
      return builder;
    }),

    insert: vi.fn((data: any) => {
      query.insertData = data;
      return builder;
    }),

    update: vi.fn((data: any) => {
      query.updateData = data;
      return builder;
    }),

    delete: vi.fn(() => {
      query.deleteAction = true;
      return builder;
    }),

    eq: vi.fn((column: string, value: any) => {
      query.filters[column] = value;
      return builder;
    }),

    order: vi.fn((column: string, options: any) => {
      query.orderFields.push({ column, ...options });
      return builder;
    }),

    single: vi.fn(() => {
      query.singleResult = true;
      return builder;
    }),

    // Execute the query
    then: vi.fn((resolve: any) => {
      let result: any = { data: null, error: null };

      // Handle SELECT
      if (!query.insertData && !query.updateData && !query.deleteAction) {
        const dataKey = table as keyof typeof mockData;
        const data = (mockData[dataKey] as any) || [];
        let filtered = (data as any[]).filter((item: any) => {
          for (const [key, value] of Object.entries(query.filters)) {
            if (item[key] !== value) return false;
          }
          return true;
        });

        result.data = query.singleResult ? filtered[0] || null : filtered;
      }

      // Handle INSERT
      if (query.insertData) {
        const newItem = {
          id: query.insertData.id || Math.random().toString(36).substr(2, 9),
          ...query.insertData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add default values for items table
        if (table === 'items') {
          newItem.claimed = newItem.claimed ?? false;
          newItem.claimed_by = newItem.claimed_by ?? null;
        }

        if (table === 'wishlists') mockData.wishlists.push(newItem);
        if (table === 'sublists') mockData.sublists.push(newItem);
        if (table === 'items') mockData.items.push(newItem);

        result.data = query.singleResult ? newItem : [newItem];
      }

      // Handle UPDATE
      if (query.updateData) {
        const dataArray = mockData[table as keyof typeof mockData] || [];
        (dataArray as any[]).forEach((item: any) => {
          let matches = true;
          for (const [key, value] of Object.entries(query.filters)) {
            if (item[key] !== value) matches = false;
          }
          if (matches) {
            Object.assign(item, query.updateData);
            item.updated_at = new Date().toISOString();
          }
        });
        result.data = null;
      }

      // Handle DELETE
      if (query.deleteAction) {
        const dataKey = table as keyof typeof mockData;
        const filtered = (mockData[dataKey] as any[]).filter((item: any) => {
          for (const [key, value] of Object.entries(query.filters)) {
            if (item[key] === value) return false;
          }
          return true;
        });
        (mockData[dataKey] as any) = filtered;
        result.data = null;
      }

      resolve(result);
      return Promise.resolve(result);
    }),
  };

  return builder;
};

/**
 * Mock Supabase client
 */
export const createMockSupabaseClient = () => ({
  from: vi.fn((table: string) => createQueryBuilder(table)),

  rpc: vi.fn((functionName: string, params?: any) => {
    // Mock cleanup function
    if (functionName === 'cleanup_old_wishlists') {
      const count = 0; // Can be customized in tests
      return Promise.resolve({ data: count, error: null });
    }
    return Promise.resolve({ data: null, error: null });
  }),

  channel: vi.fn((name: string) => createMockChannel()),

  removeChannel: vi.fn((channel: any) => Promise.resolve({ data: null, error: null })),
});

/**
 * Default mock Supabase client instance
 */
export const mockSupabase = createMockSupabaseClient();

/**
 * Mock for supabaseClient.ts
 */
export const supabase = mockSupabase;

/**
 * Mock for SupabaseService
 */
export class SupabaseService {
  getClient() {
    return mockSupabase;
  }

  isConfigured() {
    return true;
  }
}

export const supabaseService = new SupabaseService();
