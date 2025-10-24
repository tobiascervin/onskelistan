/**
 * Service for managing localStorage cache for recent wishlists
 */
export interface RecentList {
  uuid: string;
  timestamp: number;
  listName?: string;
}

export class LocalStorageService {
  private readonly RECENT_LIST_KEY = 'wishlist-recent-list';
  private readonly MAX_AGE_DAYS = 30; // Cache expires after 30 days

  /**
   * Save a recently visited wishlist
   */
  saveRecentList(uuid: string, listName?: string): void {
    try {
      const recentList: RecentList = {
        uuid,
        timestamp: Date.now(),
        listName,
      };
      localStorage.setItem(this.RECENT_LIST_KEY, JSON.stringify(recentList));
    } catch (error) {
      console.error('Failed to save recent list to localStorage:', error);
    }
  }

  /**
   * Get the most recently visited wishlist (if not expired)
   */
  getRecentList(): RecentList | null {
    try {
      const stored = localStorage.getItem(this.RECENT_LIST_KEY);
      if (!stored) return null;

      const recentList: RecentList = JSON.parse(stored);

      // Check if cache has expired
      const ageInDays = (Date.now() - recentList.timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays > this.MAX_AGE_DAYS) {
        this.clearRecentList();
        return null;
      }

      return recentList;
    } catch (error) {
      console.error('Failed to get recent list from localStorage:', error);
      return null;
    }
  }

  /**
   * Check if there is a valid recent list
   */
  hasRecentList(): boolean {
    return this.getRecentList() !== null;
  }

  /**
   * Clear the recent list cache
   */
  clearRecentList(): void {
    try {
      localStorage.removeItem(this.RECENT_LIST_KEY);
    } catch (error) {
      console.error('Failed to clear recent list from localStorage:', error);
    }
  }
}

// Export singleton
export const localStorageService = new LocalStorageService();
