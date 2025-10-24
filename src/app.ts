import { wishlistService, type FullWishlist } from './services/wishlistService';
import { realtimeService } from './services/realtimeService';
import { router } from './services/router';
import { supabaseService } from './services/supabaseClient';
import { themeService } from './services/themeService';
import { languageService } from './services/languageService';
import { listActionsService } from './services/listActionsService';
import { localStorageService } from './services/localStorageService';

/**
 * Huvudapplikationen för önskelista med Supabase-integration
 */
class WishListApp {
  private currentWishlist: FullWishlist | null = null;
  private currentWishlistId: string | null = null;
  private isLoading: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Check if Supabase is configured
    if (!supabaseService.isConfigured()) {
      this.showError(languageService.t('errorNotConfigured'));
      return;
    }

    // Setup theme and language
    this.setupThemeAndLanguage();

    // Setup routing
    this.setupRouter();

    // Setup event listeners
    this.setupEventListeners();

    // Setup toolbar event listeners
    this.setupToolbarListeners();

    // Update UI texts
    this.updateUITexts();

    // Start router
    router.start();
  }

  /**
   * Setup theme and language services
   */
  private setupThemeAndLanguage(): void {
    // Theme is already applied by themeService constructor

    // Listen for language changes
    languageService.addListener(() => {
      this.updateUITexts();
    });

    // Update theme button states
    this.updateThemeButtons();
    this.updateLanguageButtons();
  }

  /**
   * Update all UI texts based on current language
   */
  private updateUITexts(): void {
    const t = languageService.getTranslations();

    // Start view
    const startTitle = document.querySelector('#startView h1');
    if (startTitle) startTitle.textContent = t.appTitle;

    const listNameInput = document.getElementById('listNameInput') as HTMLInputElement;
    if (listNameInput) listNameInput.placeholder = t.listNamePlaceholder;

    const createButton = document.querySelector('#startView .button-primary');
    if (createButton) createButton.textContent = t.createNew;

    const loadButton = document.querySelector('#startView .button-secondary');
    if (loadButton) loadButton.textContent = t.load;

    // List view
    const backButton = document.querySelector('.back-button');
    if (backButton) backButton.textContent = t.backButton;

    const newSublistInput = document.getElementById('newSublistInput') as HTMLInputElement;
    if (newSublistInput) newSublistInput.placeholder = t.addPersonCategory;

    const addSublistButton = document.querySelector('#listView .add-item button');
    if (addSublistButton) addSublistButton.textContent = t.addButton;

    // Toolbars
    const toolbarLeftTitle = document.getElementById('toolbarLeftTitle');
    if (toolbarLeftTitle) toolbarLeftTitle.textContent = t.listActions;

    const toolbarRightTitle = document.getElementById('toolbarRightTitle');
    if (toolbarRightTitle) toolbarRightTitle.textContent = t.settings;

    // Left toolbar buttons
    const saveJsonText = document.getElementById('saveJsonText');
    if (saveJsonText) saveJsonText.textContent = t.saveJson.replace('💾 ', '');

    const loadJsonText = document.getElementById('loadJsonText');
    if (loadJsonText) loadJsonText.textContent = t.loadJson.replace('📂 ', '');

    const shareUrlText = document.getElementById('shareUrlText');
    if (shareUrlText) shareUrlText.textContent = t.shareUrl.replace('🔗 ', '');

    // Right toolbar labels
    const themeLabel = document.getElementById('themeLabel');
    if (themeLabel) themeLabel.textContent = t.theme;

    const languageLabel = document.getElementById('languageLabel');
    if (languageLabel) languageLabel.textContent = t.language;

    const lightThemeText = document.getElementById('lightThemeText');
    if (lightThemeText) lightThemeText.textContent = t.lightTheme.replace('☀️ ', '');

    const darkThemeText = document.getElementById('darkThemeText');
    if (darkThemeText) darkThemeText.textContent = t.darkTheme.replace('🌙 ', '');

    const swedishText = document.getElementById('swedishText');
    if (swedishText) swedishText.textContent = t.swedish.replace('🇸🇪 ', '');

    const englishText = document.getElementById('englishText');
    if (englishText) englishText.textContent = t.english.replace('🇬🇧 ', '');

    // Warning box
    const listWarning = document.getElementById('listWarning');
    if (listWarning) listWarning.textContent = t.listWarning;

    // Continue recent button
    const continueRecentText = document.getElementById('continueRecentText');
    if (continueRecentText) continueRecentText.textContent = t.continueRecentList;

    // Re-render if we have a current wishlist
    if (this.currentWishlist) {
      this.render();
    }
  }

  /**
   * Update theme button states
   */
  private updateThemeButtons(): void {
    const currentTheme = themeService.getTheme();
    const lightBtn = document.getElementById('lightThemeBtn');
    const darkBtn = document.getElementById('darkThemeBtn');

    if (lightBtn) {
      if (currentTheme === 'light') {
        lightBtn.classList.add('active');
      } else {
        lightBtn.classList.remove('active');
      }
    }

    if (darkBtn) {
      if (currentTheme === 'dark') {
        darkBtn.classList.add('active');
      } else {
        darkBtn.classList.remove('active');
      }
    }
  }

  /**
   * Update language button states
   */
  private updateLanguageButtons(): void {
    const currentLang = languageService.getLanguage();
    const svBtn = document.getElementById('swedishBtn');
    const enBtn = document.getElementById('englishBtn');

    if (svBtn) {
      if (currentLang === 'sv') {
        svBtn.classList.add('active');
      } else {
        svBtn.classList.remove('active');
      }
    }

    if (enBtn) {
      if (currentLang === 'en') {
        enBtn.classList.add('active');
      } else {
        enBtn.classList.remove('active');
      }
    }
  }

  private setupRouter(): void {
    // Home route - show start view
    router.on('/', () => {
      this.showStartView();
    });

    // UUID route - load and show wishlist
    router.on('/:uuid', async ({ uuid }) => {
      if (uuid) {
        await this.loadWishlist(uuid);
      }
    });

    // 404 - go to home
    router.notFound(() => {
      router.navigate('/');
    });
  }

  private setupEventListeners(): void {
    // Knapp för att skapa ny lista
    const createButton = document.querySelector(
      '#startView .button-primary'
    ) as HTMLButtonElement;
    createButton?.addEventListener('click', () => this.createNewWishlist());

    // Knapp för att ladda lista från JSON
    const loadButton = document.querySelector(
      '#startView .button-secondary'
    ) as HTMLButtonElement;
    if (loadButton) {
      loadButton.disabled = false; // Enable the button
      loadButton.addEventListener('click', () => this.loadAndImportJson());
    }

    // Knapp för att fortsätta med senaste lista
    const continueRecentBtn = document.getElementById('continueRecentBtn');
    continueRecentBtn?.addEventListener('click', () => this.continueWithRecentList());

    // Enter-tangent för att skapa ny lista
    const listNameInput = document.getElementById('listNameInput') as HTMLInputElement;
    listNameInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.createNewWishlist();
      }
    });

    // Knapp för att gå tillbaka
    const backButton = document.querySelector('.back-button') as HTMLButtonElement;
    backButton?.addEventListener('click', () => {
      // Unsubscribe from realtime before leaving
      realtimeService.unsubscribeAll();
      router.navigate('/');
    });

    // Knapp för att lägga till sublista
    const addSublistButton = document.querySelector(
      '#listView .add-item button'
    ) as HTMLButtonElement;
    addSublistButton?.addEventListener('click', () => this.addSublist());

    // Enter-tangent för att lägga till sublista
    const newSublistInput = document.getElementById('newSublistInput') as HTMLInputElement;
    newSublistInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addSublist();
      }
    });
  }

  /**
   * Setup toolbar event listeners
   */
  private setupToolbarListeners(): void {
    // Theme buttons
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');

    lightThemeBtn?.addEventListener('click', () => {
      themeService.setTheme('light');
      this.updateThemeButtons();
    });

    darkThemeBtn?.addEventListener('click', () => {
      themeService.setTheme('dark');
      this.updateThemeButtons();
    });

    // Language buttons
    const swedishBtn = document.getElementById('swedishBtn');
    const englishBtn = document.getElementById('englishBtn');

    swedishBtn?.addEventListener('click', () => {
      languageService.setLanguage('sv');
      this.updateLanguageButtons();
    });

    englishBtn?.addEventListener('click', () => {
      languageService.setLanguage('en');
      this.updateLanguageButtons();
    });

    // List action buttons
    const saveJsonBtn = document.getElementById('saveJsonBtn');
    const loadJsonBtn = document.getElementById('loadJsonBtn');
    const shareUrlBtn = document.getElementById('shareUrlBtn');

    saveJsonBtn?.addEventListener('click', () => this.saveAsJson());
    loadJsonBtn?.addEventListener('click', () => this.loadFromJson());
    shareUrlBtn?.addEventListener('click', () => this.shareUrl());
  }

  private showView(viewId: string): void {
    document.querySelectorAll('.view').forEach((view) => {
      view.classList.remove('active');
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Show/hide left toolbar based on view
    const toolbarLeft = document.getElementById('toolbarLeft');
    if (toolbarLeft) {
      if (viewId === 'listView') {
        toolbarLeft.style.display = 'block';
      } else {
        toolbarLeft.style.display = 'none';
      }
    }
  }

  private showStartView(): void {
    this.currentWishlist = null;
    this.currentWishlistId = null;
    realtimeService.unsubscribeAll();
    this.showView('startView');

    // Show/hide continue recent button
    const continueRecentBtn = document.getElementById('continueRecentBtn');
    if (continueRecentBtn) {
      if (localStorageService.hasRecentList()) {
        continueRecentBtn.style.display = 'block';
      } else {
        continueRecentBtn.style.display = 'none';
      }
    }

    // Clear input
    const input = document.getElementById('listNameInput') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  private showError(message: string): void {
    const t = languageService.getTranslations();
    alert(`${t.errorPrefix}: ${message}`);
    console.error(message);
  }

  private showMessage(message: string): void {
    alert(message);
    console.log(message);
  }

  /**
   * Save current wishlist as JSON
   */
  private saveAsJson(): void {
    if (!this.currentWishlist) return;
    try {
      listActionsService.saveAsJson(this.currentWishlist);
    } catch (error) {
      this.showError(
        error instanceof Error ? error.message : 'Could not save JSON'
      );
    }
  }

  /**
   * Load wishlist from JSON file (only for toolbar in list view - saves to current wishlist)
   */
  private async loadFromJson(): Promise<void> {
    try {
      const data = await listActionsService.loadFromJson();
      console.log('Loaded wishlist from JSON:', data);
      // Note: This just loads the data, doesn't save to database
      // You could extend this to import the data to Supabase
      this.showMessage('JSON loaded (not yet implemented to import to database)');
    } catch (error) {
      this.showError(
        error instanceof Error ? error.message : 'Could not load JSON'
      );
    }
  }

  /**
   * Load and import wishlist from JSON file (from start view - creates new wishlist in database)
   */
  public async loadAndImportJson(): Promise<void> {
    if (this.isLoading) return;

    try {
      const data = await listActionsService.loadFromJson();
      console.log('Importing wishlist from JSON:', data);

      this.isLoading = true;

      // Import to database
      const { data: wishlist, error } = await wishlistService.importFromJson(data);

      if (error || !wishlist) {
        throw new Error(error?.message || 'Could not import wishlist');
      }

      // Navigate to the new wishlist
      this.isLoading = false;
      router.navigate(`/${wishlist.id}`);
    } catch (error) {
      this.isLoading = false;
      if (error instanceof Error && error.message === 'No file selected') {
        // User cancelled, don't show error
        return;
      }
      this.showError(
        error instanceof Error ? error.message : 'Could not import wishlist'
      );
    }
  }

  /**
   * Continue with the most recently visited wishlist
   */
  private continueWithRecentList(): void {
    const recentList = localStorageService.getRecentList();
    if (recentList) {
      router.navigate(`/${recentList.uuid}`);
    }
  }

  /**
   * Share current URL
   */
  private async shareUrl(): Promise<void> {
    try {
      await listActionsService.copyUrlToClipboard();
      const t = languageService.getTranslations();
      this.showMessage(t.copiedToClipboard);
    } catch (error) {
      this.showError(
        error instanceof Error ? error.message : 'Could not copy URL'
      );
    }
  }

  /**
   * Create a new wishlist and navigate to it
   */
  public async createNewWishlist(): Promise<void> {
    if (this.isLoading) return;

    const input = document.getElementById('listNameInput') as HTMLInputElement;
    const name = input.value.trim();

    if (!name) {
      this.showError(languageService.t('errorNoName'));
      return;
    }

    this.isLoading = true;

    try {
      const { data, error } = await wishlistService.createWishlist(name);

      if (error || !data) {
        throw new Error(error?.message || languageService.t('errorCreateFailed'));
      }

      // Reset loading state before navigating so loadWishlist can run
      this.isLoading = false;

      // Navigate to the new wishlist
      router.navigate(`/${data.id}`);
    } catch (error) {
      this.showError(
        error instanceof Error ? error.message : languageService.t('errorCreateFailed')
      );
      this.isLoading = false;
    }
  }

  /**
   * Load a wishlist by UUID
   */
  public async loadWishlist(id: string): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.currentWishlistId = id;

    try {
      const { data, error } = await wishlistService.getWishlist(id);

      if (error || !data) {
        throw new Error(error?.message || languageService.t('errorNotFound'));
      }

      this.currentWishlist = data;

      // Save to localStorage cache
      localStorageService.saveRecentList(id, data.name);

      // Update last_accessed_at timestamp (fire and forget)
      wishlistService.updateLastAccessed(id).catch(err =>
        console.error('Failed to update last accessed:', err)
      );

      // Update UI
      const listTitle = document.getElementById('listTitle') as HTMLHeadingElement;
      if (listTitle) {
        listTitle.textContent = data.name;
      }

      // Subscribe to realtime updates
      this.subscribeToRealtimeUpdates(id);

      // Render and show
      this.render();
      this.showView('listView');

      // Focus on sublist input
      setTimeout(() => {
        const sublistInput = document.getElementById('newSublistInput') as HTMLInputElement;
        sublistInput?.focus();
      }, 100);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      this.showError(
        error instanceof Error ? error.message : languageService.t('errorLoadFailed')
      );
      router.navigate('/');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Subscribe to realtime updates for current wishlist
   */
  private subscribeToRealtimeUpdates(wishlistId: string): void {
    realtimeService.subscribeToWishlist(wishlistId, {
      onWishlistChange: (payload) => {
        // Reload wishlist on any change
        if (payload.eventType === 'UPDATE' && this.currentWishlistId === wishlistId) {
          this.reloadCurrentWishlist();
        }
      },
      onSublistChange: () => {
        // Reload on sublist changes
        this.reloadCurrentWishlist();
      },
      onItemChange: () => {
        // Reload on item changes
        this.reloadCurrentWishlist();
      },
    });
  }

  /**
   * Reload the current wishlist from database
   */
  private async reloadCurrentWishlist(): Promise<void> {
    if (!this.currentWishlistId || this.isLoading) return;

    try {
      const { data, error } = await wishlistService.getWishlist(this.currentWishlistId);

      if (error || !data) {
        console.error('Failed to reload wishlist:', error);
        return;
      }

      this.currentWishlist = data;
      this.render();
    } catch (error) {
      console.error('Error reloading wishlist:', error);
    }
  }

  /**
   * Add a new sublist
   */
  public async addSublist(): Promise<void> {
    if (!this.currentWishlistId || this.isLoading) return;

    const input = document.getElementById('newSublistInput') as HTMLInputElement;
    const name = input.value.trim();

    if (!name) return;

    this.isLoading = true;

    try {
      const order = this.currentWishlist?.sublists.length || 0;
      const { error } = await wishlistService.createSublist(this.currentWishlistId, name, order);

      if (error) {
        throw new Error(error.message);
      }

      input.value = '';

      // Realtime will trigger reload
    } catch (error) {
      this.showError(
        error instanceof Error ? error.message : languageService.t('errorAddSublist')
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Add an item to a sublist
   */
  public async addItem(sublistId: number): Promise<void> {
    if (this.isLoading) return;

    const input = document.getElementById(`item-input-${sublistId}`) as HTMLInputElement;
    const text = input.value.trim();

    if (!text) return;

    this.isLoading = true;

    try {
      const sublist = this.currentWishlist?.sublists.find((s) => s.id === sublistId);
      const order = sublist?.items.length || 0;

      const { error } = await wishlistService.createItem(sublistId, text, order);

      if (error) {
        throw new Error(error.message);
      }

      input.value = '';

      // Realtime will trigger reload
    } catch (error) {
      this.showError(error instanceof Error ? error.message : languageService.t('errorAddItem'));
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Toggle claim status on an item
   */
  public async toggleClaim(itemId: number): Promise<void> {
    if (this.isLoading) return;

    // Find the item
    let item = null;
    for (const sublist of this.currentWishlist?.sublists || []) {
      item = sublist.items.find((i) => i.id === itemId);
      if (item) break;
    }

    if (!item) return;

    this.isLoading = true;

    try {
      if (!item.claimed) {
        const name = prompt(languageService.t('claimPrompt'));
        if (name && name.trim()) {
          const { error } = await wishlistService.claimItem(itemId, name.trim());
          if (error) throw new Error(error.message);
        }
      } else {
        const { error } = await wishlistService.unclaimItem(itemId);
        if (error) throw new Error(error.message);
      }

      // Realtime will trigger reload
    } catch (error) {
      this.showError(error instanceof Error ? error.message : languageService.t('errorClaimFailed'));
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render the wishlist UI
   */
  private render(): void {
    if (!this.currentWishlist) return;

    const container = document.getElementById('sublistsContainer');
    if (!container) return;

    const t = languageService.getTranslations();

    if (this.currentWishlist.sublists.length === 0) {
      container.innerHTML = `<div class="empty-state">${t.emptyState}</div>`;
      return;
    }

    container.innerHTML = this.currentWishlist.sublists
      .map(
        (sublist) => `
      <div class="sublist-section">
        <div class="sublist-header">
          <h2>${this.escapeHtml(sublist.name)}</h2>
        </div>
        <div class="sublist-add-item">
          <input
            type="text"
            id="item-input-${sublist.id}"
            placeholder="${t.addWish}"
            autocomplete="off"
          >
          <button data-sublist-id="${sublist.id}" class="add-item-btn">${t.addButton}</button>
        </div>
        <div class="sublist-items">
          ${sublist.items.length === 0 ? `<div class="empty-state">${t.emptySublist}</div>` : ''}
          ${sublist.items
            .map(
              (item) => `
            <div class="list-item ${item.claimed ? 'claimed' : ''}" data-item-id="${item.id}">
              <div class="checkbox"></div>
              <div class="item-content">
                <span class="item-text">${this.escapeHtml(item.text)}</span>
                ${item.claimed && item.claimed_by ? `<span class="tag">${this.escapeHtml(item.claimed_by)}</span>` : ''}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('');

    // Add event listeners
    this.attachDynamicEventListeners();
  }

  /**
   * Attach event listeners to dynamically created elements
   */
  private attachDynamicEventListeners(): void {
    const container = document.getElementById('sublistsContainer');
    if (!container || !this.currentWishlist) return;

    // Add event listeners for each sublist
    this.currentWishlist.sublists.forEach((sublist) => {
      // Input for Enter key
      const input = document.getElementById(`item-input-${sublist.id}`) as HTMLInputElement;
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.addItem(sublist.id);
          }
        });
      }

      // Button for adding item
      const button = container.querySelector(
        `button[data-sublist-id="${sublist.id}"]`
      ) as HTMLButtonElement;
      if (button) {
        button.addEventListener('click', () => {
          this.addItem(sublist.id);
        });
      }

      // Items for toggling claim
      sublist.items.forEach((item) => {
        const itemEl = container.querySelector(`[data-item-id="${item.id}"]`) as HTMLElement;
        if (itemEl) {
          itemEl.addEventListener('click', () => {
            this.toggleClaim(item.id);
          });
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initiera appen direkt (module scripts laddas efter DOM)
const app = new WishListApp();
(window as any).app = app;
