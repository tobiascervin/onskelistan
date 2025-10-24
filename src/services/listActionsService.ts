import type { FullWishlist } from './wishlistService';

/**
 * Service for list actions (save JSON, load JSON, share URL)
 */
export class ListActionsService {
  /**
   * Save wishlist as JSON file
   */
  saveAsJson(wishlist: FullWishlist): void {
    const json = JSON.stringify(wishlist, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wishlist-${wishlist.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Load wishlist from JSON file
   * Returns a promise that resolves with the parsed wishlist data
   */
  loadFromJson(): Promise<FullWishlist> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string;
            const data = JSON.parse(json) as FullWishlist;
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };

      input.click();
    });
  }

  /**
   * Copy current URL to clipboard
   */
  async copyUrlToClipboard(): Promise<void> {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
  }

  /**
   * Get shareable URL for a wishlist
   */
  getShareableUrl(wishlistId: string): string {
    return `${window.location.origin}/${wishlistId}`;
  }
}

// Export singleton
export const listActionsService = new ListActionsService();
