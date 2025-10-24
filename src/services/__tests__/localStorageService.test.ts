import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageService } from '../localStorageService';

describe('LocalStorageService', () => {
  let localStorageService: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    localStorageService = new LocalStorageService();
    vi.clearAllMocks();
  });

  describe('saveRecentList', () => {
    it('should save recent list to localStorage', () => {
      const uuid = 'test-uuid-123';
      const listName = 'My Test List';

      localStorageService.saveRecentList(uuid, listName);

      const stored = localStorage.getItem('wishlist-recent-list');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.uuid).toBe(uuid);
      expect(parsed.listName).toBe(listName);
      expect(parsed.timestamp).toBeDefined();
    });

    it('should save recent list without list name', () => {
      const uuid = 'test-uuid-456';

      localStorageService.saveRecentList(uuid);

      const stored = localStorage.getItem('wishlist-recent-list');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.uuid).toBe(uuid);
      expect(parsed.listName).toBeUndefined();
    });

    it('should overwrite previous recent list', () => {
      localStorageService.saveRecentList('uuid-1', 'List 1');
      localStorageService.saveRecentList('uuid-2', 'List 2');

      const stored = localStorage.getItem('wishlist-recent-list');
      const parsed = JSON.parse(stored!);

      expect(parsed.uuid).toBe('uuid-2');
      expect(parsed.listName).toBe('List 2');
    });
  });

  describe('getRecentList', () => {
    it('should return recent list if exists', () => {
      const uuid = 'test-uuid';
      const listName = 'Test List';

      localStorageService.saveRecentList(uuid, listName);

      const result = localStorageService.getRecentList();

      expect(result).toBeDefined();
      expect(result?.uuid).toBe(uuid);
      expect(result?.listName).toBe(listName);
    });

    it('should return null if no recent list exists', () => {
      const result = localStorageService.getRecentList();
      expect(result).toBeNull();
    });

    it('should return null if recent list is expired (older than 30 days)', () => {
      const uuid = 'expired-uuid';
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago

      localStorage.setItem(
        'wishlist-recent-list',
        JSON.stringify({ uuid, timestamp: oldTimestamp })
      );

      const result = localStorageService.getRecentList();
      expect(result).toBeNull();
    });

    it('should clear expired recent list', () => {
      const uuid = 'expired-uuid';
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);

      localStorage.setItem(
        'wishlist-recent-list',
        JSON.stringify({ uuid, timestamp: oldTimestamp })
      );

      localStorageService.getRecentList();

      const stored = localStorage.getItem('wishlist-recent-list');
      expect(stored).toBeNull();
    });

    it('should return recent list if within 30 days', () => {
      const uuid = 'recent-uuid';
      const recentTimestamp = Date.now() - (29 * 24 * 60 * 60 * 1000); // 29 days ago

      localStorage.setItem(
        'wishlist-recent-list',
        JSON.stringify({ uuid, timestamp: recentTimestamp })
      );

      const result = localStorageService.getRecentList();

      expect(result).toBeDefined();
      expect(result?.uuid).toBe(uuid);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('wishlist-recent-list', 'invalid json');

      const result = localStorageService.getRecentList();
      expect(result).toBeNull();
    });
  });

  describe('hasRecentList', () => {
    it('should return true if valid recent list exists', () => {
      localStorageService.saveRecentList('test-uuid');
      expect(localStorageService.hasRecentList()).toBe(true);
    });

    it('should return false if no recent list exists', () => {
      expect(localStorageService.hasRecentList()).toBe(false);
    });

    it('should return false if recent list is expired', () => {
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);
      localStorage.setItem(
        'wishlist-recent-list',
        JSON.stringify({ uuid: 'test', timestamp: oldTimestamp })
      );

      expect(localStorageService.hasRecentList()).toBe(false);
    });
  });

  describe('clearRecentList', () => {
    it('should remove recent list from localStorage', () => {
      localStorageService.saveRecentList('test-uuid');
      expect(localStorage.getItem('wishlist-recent-list')).toBeDefined();

      localStorageService.clearRecentList();
      expect(localStorage.getItem('wishlist-recent-list')).toBeNull();
    });

    it('should not throw error if no recent list exists', () => {
      expect(() => localStorageService.clearRecentList()).not.toThrow();
    });
  });
});
