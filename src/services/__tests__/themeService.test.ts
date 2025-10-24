import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeService } from '../themeService';

describe('ThemeService', () => {
  let themeService: ThemeService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear document.documentElement attributes
    document.documentElement.removeAttribute('data-theme');
    // Create a fresh instance
    themeService = new ThemeService();
  });

  describe('initialization', () => {
    it('should default to light theme', () => {
      expect(themeService.getTheme()).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should load theme from localStorage if available', () => {
      localStorage.setItem('wishlist-theme', 'dark');
      const service = new ThemeService();
      expect(service.getTheme()).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should respect system preference if no stored theme', () => {
      // Mock matchMedia to return dark preference
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const service = new ThemeService();
      expect(service.getTheme()).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('should change theme to dark', () => {
      themeService.setTheme('dark');
      expect(themeService.getTheme()).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should change theme to light', () => {
      themeService.setTheme('dark');
      themeService.setTheme('light');
      expect(themeService.getTheme()).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should persist theme to localStorage', () => {
      themeService.setTheme('dark');
      expect(localStorage.getItem('wishlist-theme')).toBe('dark');

      themeService.setTheme('light');
      expect(localStorage.getItem('wishlist-theme')).toBe('light');
    });

    it('should update document attribute', () => {
      themeService.setTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      themeService.setTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      expect(themeService.getTheme()).toBe('light');
      themeService.toggleTheme();
      expect(themeService.getTheme()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      themeService.setTheme('dark');
      themeService.toggleTheme();
      expect(themeService.getTheme()).toBe('light');
    });

    it('should persist toggled theme', () => {
      themeService.toggleTheme();
      expect(localStorage.getItem('wishlist-theme')).toBe('dark');

      themeService.toggleTheme();
      expect(localStorage.getItem('wishlist-theme')).toBe('light');
    });
  });

  describe('getTheme', () => {
    it('should return current theme', () => {
      expect(themeService.getTheme()).toBe('light');

      themeService.setTheme('dark');
      expect(themeService.getTheme()).toBe('dark');
    });
  });
});
