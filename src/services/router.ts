/**
 * Simple client-side router for handling UUID-based URLs
 */

export type RouteParams = {
  uuid?: string;
};

export type RouteHandler = (params: RouteParams) => void | Promise<void>;

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private notFoundHandler: RouteHandler | null = null;

  constructor() {
    // Listen to popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
  }

  /**
   * Register a route handler
   */
  on(path: string, handler: RouteHandler): this {
    this.routes.set(path, handler);
    return this;
  }

  /**
   * Register 404 handler
   */
  notFound(handler: RouteHandler): this {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Navigate to a path
   */
  navigate(path: string): void {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  /**
   * Replace current path without adding to history
   */
  replace(path: string): void {
    window.history.replaceState({}, '', path);
    this.handleRoute();
  }

  /**
   * Get current path
   */
  getCurrentPath(): string {
    return window.location.pathname;
  }

  /**
   * Parse current path and execute handler
   */
  private handleRoute(): void {
    const path = this.getCurrentPath();

    // Home route
    if (path === '/' || path === '/index.html') {
      const handler = this.routes.get('/');
      if (handler) {
        handler({});
        return;
      }
    }

    // UUID route (/{uuid})
    const uuidMatch = path.match(/^\/([a-f0-9-]{36})$/i);
    if (uuidMatch) {
      const uuid = uuidMatch[1];
      const handler = this.routes.get('/:uuid');
      if (handler) {
        handler({ uuid });
        return;
      }
    }

    // No match - call 404 handler
    if (this.notFoundHandler) {
      this.notFoundHandler({});
    } else {
      console.warn(`No handler for route: ${path}`);
    }
  }

  /**
   * Start the router (call on page load)
   */
  start(): void {
    this.handleRoute();
  }

  /**
   * Extract UUID from current URL if present
   */
  getCurrentUUID(): string | null {
    const path = this.getCurrentPath();
    const match = path.match(/^\/([a-f0-9-]{36})$/i);
    return match ? match[1] : null;
  }
}

// Export singleton
export const router = new Router();
