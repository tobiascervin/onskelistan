/**
 * Service for managing language (Swedish/English)
 */
export type Language = "sv" | "en";

export interface Translations {
  // Start view
  appTitle: string;
  listNamePlaceholder: string;
  createNew: string;
  load: string;

  // List view
  backButton: string;
  addPersonCategory: string;
  addButton: string;
  addWish: string;
  emptySublist: string;
  emptyState: string;

  // Claim dialogs
  claimPrompt: string;

  // Toolbar - Left
  listActions: string;
  saveJson: string;
  loadJson: string;
  shareUrl: string;
  copiedToClipboard: string;
  listWarning: string;
  continueRecentList: string;

  // Toolbar - Right
  settings: string;
  theme: string;
  lightTheme: string;
  darkTheme: string;
  language: string;
  swedish: string;
  english: string;

  // Errors
  errorPrefix: string;
  errorNoName: string;
  errorCreateFailed: string;
  errorNotFound: string;
  errorLoadFailed: string;
  errorClaimFailed: string;
  errorAddSublist: string;
  errorAddItem: string;
  errorNotConfigured: string;
}

const translations: Record<Language, Translations> = {
  sv: {
    // Start view
    appTitle: "Skapa en önskelista",
    listNamePlaceholder: "Namn på önskelistan...",
    createNew: "Skapa ny",
    load: "Ladda",

    // List view
    backButton: "Tillbaka",
    addPersonCategory: "Lägg till person/kategori...",
    addButton: "Lägg till",
    addWish: "Lägg till önskning...",
    emptySublist: "Inga önskningar ännu",
    emptyState: "Lägg till en person eller kategori för att börja",

    // Claim dialogs
    claimPrompt: "Vem paxar denna önskning?",

    // Toolbar - Left
    listActions: "Lista",
    saveJson: "💾 Spara JSON",
    loadJson: "📂 Ladda JSON",
    shareUrl: "🔗 Dela länk",
    copiedToClipboard: "Kopierat till urklipp!",
    listWarning: "⚠️ Kom ihåg att spara länken eller exportera som JSON för att komma åt listan senare",
    continueRecentList: "Fortsätt på senaste lista",

    // Toolbar - Right
    settings: "Inställningar",
    theme: "Tema",
    lightTheme: "☀️ Ljust",
    darkTheme: "🌙 Mörkt",
    language: "Språk",
    swedish: "🇸🇪 Svenska",
    english: "🇬🇧 Engelska",

    // Errors
    errorPrefix: "Fel",
    errorNoName: "Ange ett namn på önskelistan",
    errorCreateFailed: "Kunde inte skapa önskelista",
    errorNotFound: "Önskelistan hittades inte",
    errorLoadFailed: "Kunde inte ladda önskelistan",
    errorClaimFailed: "Kunde inte paxa/av-paxa önskning",
    errorAddSublist: "Kunde inte lägga till person/kategori",
    errorAddItem: "Kunde inte lägga till önskning",
    errorNotConfigured:
      "Supabase är inte konfigurerad. Se supabase/README.md för instruktioner.",
  },
  en: {
    // Start view
    appTitle: "Create a wishlist",
    listNamePlaceholder: "Wishlist name...",
    createNew: "Create new",
    load: "Load",

    // List view
    backButton: "Back",
    addPersonCategory: "Add person/category...",
    addButton: "Add",
    addWish: "Add wish...",
    emptySublist: "No wishes yet",
    emptyState: "Add a person or category to begin",

    // Claim dialogs
    claimPrompt: "Who is claiming this wish?",

    // Toolbar - Left
    listActions: "List",
    saveJson: "💾 Save JSON",
    loadJson: "📂 Load JSON",
    shareUrl: "🔗 Share link",
    copiedToClipboard: "Copied to clipboard!",
    listWarning: "⚠️ Remember to save the URL or export as JSON to access your list later",
    continueRecentList: "Continue with recent list",

    // Toolbar - Right
    settings: "Settings",
    theme: "Theme",
    lightTheme: "☀️ Light",
    darkTheme: "🌙 Dark",
    language: "Language",
    swedish: "🇸🇪 Swedish",
    english: "🇬🇧 English",

    // Errors
    errorPrefix: "Error",
    errorNoName: "Please enter a wishlist name",
    errorCreateFailed: "Could not create wishlist",
    errorNotFound: "Wishlist not found",
    errorLoadFailed: "Could not load wishlist",
    errorClaimFailed: "Could not claim/unclaim wish",
    errorAddSublist: "Could not add person/category",
    errorAddItem: "Could not add wish",
    errorNotConfigured:
      "Supabase is not configured. See supabase/README.md for instructions.",
  },
};

export class LanguageService {
  private currentLanguage: Language = "sv";
  private readonly STORAGE_KEY = "wishlist-language";
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadLanguage();
  }

  /**
   * Load language from localStorage
   */
  private loadLanguage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Language | null;
    if (stored && (stored === "sv" || stored === "en")) {
      this.currentLanguage = stored;
    }
  }

  /**
   * Set language
   */
  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem(this.STORAGE_KEY, language);
    this.notifyListeners();
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Get translations for current language
   */
  getTranslations(): Translations {
    return translations[this.currentLanguage];
  }

  /**
   * Get specific translation
   */
  t(key: keyof Translations): string {
    return translations[this.currentLanguage][key];
  }

  /**
   * Add listener for language changes
   */
  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * Notify all listeners of language change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

// Export singleton
export const languageService = new LanguageService();
