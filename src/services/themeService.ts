/**
 * Service for managing theme (light/dark mode)
 */
export type Theme = 'light' | 'dark';

export class ThemeService {
  private currentTheme: Theme = 'light';
  private readonly STORAGE_KEY = 'wishlist-theme';

  constructor() {
    this.loadTheme();
  }

  /**
   * Load theme from localStorage or system preference
   */
  private loadTheme(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;

    if (stored) {
      this.currentTheme = stored;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }

    this.applyTheme();
  }

  /**
   * Apply theme to document
   */
  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme();
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Toggle between light and dark
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}

// Export singleton
export const themeService = new ThemeService();
