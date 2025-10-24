import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageService } from '../languageService';

describe('LanguageService', () => {
  let languageService: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    languageService = new LanguageService();
  });

  describe('initialization', () => {
    it('should default to Swedish', () => {
      expect(languageService.getLanguage()).toBe('sv');
    });

    it('should load language from localStorage if available', () => {
      localStorage.setItem('wishlist-language', 'en');
      const service = new LanguageService();
      expect(service.getLanguage()).toBe('en');
    });

    it('should ignore invalid language in localStorage', () => {
      localStorage.setItem('wishlist-language', 'invalid');
      const service = new LanguageService();
      expect(service.getLanguage()).toBe('sv');
    });
  });

  describe('setLanguage', () => {
    it('should change language to English', () => {
      languageService.setLanguage('en');
      expect(languageService.getLanguage()).toBe('en');
    });

    it('should change language to Swedish', () => {
      languageService.setLanguage('en');
      languageService.setLanguage('sv');
      expect(languageService.getLanguage()).toBe('sv');
    });

    it('should persist language to localStorage', () => {
      languageService.setLanguage('en');
      expect(localStorage.getItem('wishlist-language')).toBe('en');

      languageService.setLanguage('sv');
      expect(localStorage.getItem('wishlist-language')).toBe('sv');
    });

    it('should notify listeners on language change', () => {
      const listener = vi.fn();
      languageService.addListener(listener);

      languageService.setLanguage('en');
      expect(listener).toHaveBeenCalledTimes(1);

      languageService.setLanguage('sv');
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe('getLanguage', () => {
    it('should return current language', () => {
      expect(languageService.getLanguage()).toBe('sv');

      languageService.setLanguage('en');
      expect(languageService.getLanguage()).toBe('en');
    });
  });

  describe('getTranslations', () => {
    it('should return Swedish translations by default', () => {
      const translations = languageService.getTranslations();
      expect(translations.appTitle).toBe('Skapa en önskelista');
      expect(translations.createNew).toBe('Skapa ny');
    });

    it('should return English translations when language is English', () => {
      languageService.setLanguage('en');
      const translations = languageService.getTranslations();
      expect(translations.appTitle).toBe('Create a wishlist');
      expect(translations.createNew).toBe('Create new');
    });

    it('should contain all required translation keys', () => {
      const translations = languageService.getTranslations();

      // Check for presence of key translation strings
      expect(translations.appTitle).toBeDefined();
      expect(translations.listNamePlaceholder).toBeDefined();
      expect(translations.createNew).toBeDefined();
      expect(translations.load).toBeDefined();
      expect(translations.backButton).toBeDefined();
      expect(translations.addPersonCategory).toBeDefined();
      expect(translations.addButton).toBeDefined();
      expect(translations.addWish).toBeDefined();
      expect(translations.emptySublist).toBeDefined();
      expect(translations.emptyState).toBeDefined();
      expect(translations.claimPrompt).toBeDefined();
      expect(translations.listActions).toBeDefined();
      expect(translations.saveJson).toBeDefined();
      expect(translations.loadJson).toBeDefined();
      expect(translations.shareUrl).toBeDefined();
      expect(translations.copiedToClipboard).toBeDefined();
      expect(translations.settings).toBeDefined();
      expect(translations.theme).toBeDefined();
      expect(translations.lightTheme).toBeDefined();
      expect(translations.darkTheme).toBeDefined();
      expect(translations.language).toBeDefined();
      expect(translations.swedish).toBeDefined();
      expect(translations.english).toBeDefined();
      expect(translations.errorPrefix).toBeDefined();
      expect(translations.errorNoName).toBeDefined();
      expect(translations.errorCreateFailed).toBeDefined();
      expect(translations.errorNotFound).toBeDefined();
      expect(translations.errorLoadFailed).toBeDefined();
      expect(translations.errorClaimFailed).toBeDefined();
      expect(translations.errorAddSublist).toBeDefined();
      expect(translations.errorAddItem).toBeDefined();
      expect(translations.errorNotConfigured).toBeDefined();
    });
  });

  describe('t', () => {
    it('should return translation for given key in Swedish', () => {
      expect(languageService.t('appTitle')).toBe('Skapa en önskelista');
      expect(languageService.t('createNew')).toBe('Skapa ny');
    });

    it('should return translation for given key in English', () => {
      languageService.setLanguage('en');
      expect(languageService.t('appTitle')).toBe('Create a wishlist');
      expect(languageService.t('createNew')).toBe('Create new');
    });
  });

  describe('listeners', () => {
    it('should add a listener', () => {
      const listener = vi.fn();
      languageService.addListener(listener);

      languageService.setLanguage('en');
      expect(listener).toHaveBeenCalled();
    });

    it('should remove a listener', () => {
      const listener = vi.fn();
      languageService.addListener(listener);
      languageService.removeListener(listener);

      languageService.setLanguage('en');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should notify multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      languageService.addListener(listener1);
      languageService.addListener(listener2);

      languageService.setLanguage('en');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should not notify removed listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      languageService.addListener(listener1);
      languageService.addListener(listener2);
      languageService.removeListener(listener1);

      languageService.setLanguage('en');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });
});
