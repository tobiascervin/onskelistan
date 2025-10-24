import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '../router';

describe('Router', () => {
  let router: Router;

  beforeEach(() => {
    // Reset window.location
    window.location.pathname = '/';
    // Clear history spy
    vi.clearAllMocks();
    // Create fresh router instance
    router = new Router();
  });

  describe('route registration', () => {
    it('should register a route handler', () => {
      const handler = vi.fn();
      router.on('/', handler);

      router.start();
      expect(handler).toHaveBeenCalled();
    });

    it('should register multiple routes', () => {
      const homeHandler = vi.fn();
      const uuidHandler = vi.fn();

      router.on('/', homeHandler);
      router.on('/:uuid', uuidHandler);

      router.start();
      expect(homeHandler).toHaveBeenCalled();
      expect(uuidHandler).not.toHaveBeenCalled();
    });

    it('should support method chaining', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const result = router.on('/', handler1).on('/test', handler2);
      expect(result).toBe(router);
    });
  });

  describe('route matching', () => {
    it('should match home route /', () => {
      const handler = vi.fn();
      router.on('/', handler);

      window.location.pathname = '/';
      router.start();

      expect(handler).toHaveBeenCalled();
    });

    it('should match UUID route with valid UUID', () => {
      const handler = vi.fn();
      router.on('/:uuid', handler);

      window.location.pathname = '/123e4567-e89b-12d3-a456-426614174000';
      router.start();

      expect(handler).toHaveBeenCalledWith({
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should pass UUID parameter to handler', () => {
      const handler = vi.fn();
      const testUuid = 'abc12345-1234-5678-9abc-123456789def';

      router.on('/:uuid', handler);
      window.location.pathname = `/${testUuid}`;
      router.start();

      expect(handler).toHaveBeenCalledWith({ uuid: testUuid });
    });

    it('should handle index.html path as home', () => {
      const handler = vi.fn();
      router.on('/', handler);

      window.location.pathname = '/index.html';
      router.start();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('404 handler', () => {
    it('should call 404 handler for unmatched routes', () => {
      const notFoundHandler = vi.fn();
      router.notFound(notFoundHandler);

      window.location.pathname = '/unknown';
      router.start();

      expect(notFoundHandler).toHaveBeenCalled();
    });

    it('should not call 404 handler for matched routes', () => {
      const homeHandler = vi.fn();
      const notFoundHandler = vi.fn();

      router.on('/', homeHandler);
      router.notFound(notFoundHandler);

      window.location.pathname = '/';
      router.start();

      expect(homeHandler).toHaveBeenCalled();
      expect(notFoundHandler).not.toHaveBeenCalled();
    });

    it('should log warning if no 404 handler is set', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      window.location.pathname = '/unknown';
      router.start();

      expect(consoleSpy).toHaveBeenCalledWith('No handler for route: /unknown');
      consoleSpy.mockRestore();
    });
  });

  describe('navigate', () => {
    it('should change URL and trigger route handler', () => {
      const handler = vi.fn();
      router.on('/test', handler);

      window.location.pathname = '/test';
      router.navigate('/test');

      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/test');
    });

    it('should handle UUID navigation', () => {
      const handler = vi.fn();
      const testUuid = '123e4567-e89b-12d3-a456-426614174000';

      router.on('/:uuid', handler);
      window.location.pathname = `/${testUuid}`;
      router.navigate(`/${testUuid}`);

      expect(window.history.pushState).toHaveBeenCalledWith({}, '', `/${testUuid}`);
    });
  });

  describe('replace', () => {
    it('should replace current URL without adding to history', () => {
      const handler = vi.fn();
      router.on('/test', handler);

      window.location.pathname = '/test';
      router.replace('/test');

      expect(window.history.replaceState).toHaveBeenCalledWith({}, '', '/test');
    });
  });

  describe('getCurrentPath', () => {
    it('should return current pathname', () => {
      window.location.pathname = '/test';
      expect(router.getCurrentPath()).toBe('/test');

      window.location.pathname = '/';
      expect(router.getCurrentPath()).toBe('/');
    });
  });

  describe('getCurrentUUID', () => {
    it('should return UUID from current path', () => {
      const testUuid = '123e4567-e89b-12d3-a456-426614174000';
      window.location.pathname = `/${testUuid}`;

      expect(router.getCurrentUUID()).toBe(testUuid);
    });

    it('should return null if path is not a UUID', () => {
      window.location.pathname = '/';
      expect(router.getCurrentUUID()).toBeNull();

      window.location.pathname = '/not-a-uuid';
      expect(router.getCurrentUUID()).toBeNull();
    });

    it('should handle invalid UUID format', () => {
      window.location.pathname = '/invalid-uuid-format';
      expect(router.getCurrentUUID()).toBeNull();
    });
  });

  describe('popstate event', () => {
    it('should handle browser back/forward buttons', () => {
      const handler = vi.fn();
      router.on('/', handler);

      // Simulate popstate event
      const popStateEvent = new PopStateEvent('popstate', { state: {} });
      window.dispatchEvent(popStateEvent);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('async route handlers', () => {
    it('should support async handlers', async () => {
      const asyncHandler = vi.fn().mockResolvedValue(undefined);
      router.on('/:uuid', asyncHandler);

      window.location.pathname = '/123e4567-e89b-12d3-a456-426614174000';
      router.start();

      // Wait for async handler to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(asyncHandler).toHaveBeenCalled();
    });
  });
});
