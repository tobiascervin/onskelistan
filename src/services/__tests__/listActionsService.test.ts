import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListActionsService } from '../listActionsService';
import { createFullMockWishlist } from '../../__tests__/helpers';

describe('ListActionsService', () => {
  let listActionsService: ListActionsService;

  beforeEach(() => {
    listActionsService = new ListActionsService();
    vi.clearAllMocks();
  });

  describe('saveAsJson', () => {
    it('should create and download JSON file', () => {
      const wishlist = createFullMockWishlist();

      // Mock document methods
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      // Mock URL methods
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      listActionsService.saveAsJson(wishlist);

      // Verify createElement was called to create anchor
      expect(createElementSpy).toHaveBeenCalledWith('a');

      // Verify blob URL was created
      expect(createObjectURLSpy).toHaveBeenCalled();

      // Verify anchor was added and removed
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();

      // Verify URL was revoked
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

      // Restore spies
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should generate correct filename with date', () => {
      const wishlist = createFullMockWishlist({ wishlist: { name: 'My List' } });

      const createElementSpy = vi.spyOn(document, 'createElement');
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      listActionsService.saveAsJson(wishlist);

      const anchor = createElementSpy.mock.results[0]?.value as HTMLAnchorElement;
      expect(anchor.download).toMatch(/^wishlist-My List-\d{4}-\d{2}-\d{2}\.json$/);

      vi.restoreAllMocks();
    });
  });

  describe('loadFromJson', () => {
    it('should read and parse JSON file', async () => {
      const mockWishlist = createFullMockWishlist();
      const jsonString = JSON.stringify(mockWishlist);

      // Mock file input
      const mockFile = new File([jsonString], 'test.json', { type: 'application/json' });

      // Create a mock input element
      const mockInput = document.createElement('input');
      mockInput.type = 'file';

      vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

      // Trigger file selection after a short delay
      setTimeout(() => {
        Object.defineProperty(mockInput, 'files', {
          value: [mockFile],
          writable: false,
        });

        mockInput.dispatchEvent(new Event('change'));
      }, 10);

      const resultPromise = listActionsService.loadFromJson();

      // Wait for the promise to resolve
      const result = await resultPromise;

      expect(result.id).toBe(mockWishlist.id);
      expect(result.name).toBe(mockWishlist.name);

      vi.restoreAllMocks();
    });

    it('should reject with error for invalid JSON', async () => {
      const invalidJson = 'not valid json';
      const mockFile = new File([invalidJson], 'test.json', { type: 'application/json' });

      const mockInput = document.createElement('input');
      mockInput.type = 'file';

      vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

      setTimeout(() => {
        Object.defineProperty(mockInput, 'files', {
          value: [mockFile],
          writable: false,
        });

        mockInput.dispatchEvent(new Event('change'));
      }, 10);

      await expect(listActionsService.loadFromJson()).rejects.toThrow('Invalid JSON file');

      vi.restoreAllMocks();
    });

    it('should reject with error when no file is selected', async () => {
      const mockInput = document.createElement('input');
      mockInput.type = 'file';

      vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

      setTimeout(() => {
        Object.defineProperty(mockInput, 'files', {
          value: [],
          writable: false,
        });

        mockInput.dispatchEvent(new Event('change'));
      }, 10);

      await expect(listActionsService.loadFromJson()).rejects.toThrow('No file selected');

      vi.restoreAllMocks();
    });
  });

  describe('copyUrlToClipboard', () => {
    it('should copy current URL to clipboard', async () => {
      window.location.href = 'http://localhost:3000/test-uuid';

      await listActionsService.copyUrlToClipboard();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/test-uuid');
    });

    it('should use fallback method if clipboard API fails', async () => {
      // Mock clipboard.writeText to reject
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Not allowed'));

      // Mock document methods for fallback
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      window.location.href = 'http://localhost:3000/test';

      await listActionsService.copyUrlToClipboard();

      // Verify fallback was used
      expect(createElementSpy).toHaveBeenCalledWith('input');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(removeChildSpy).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe('getShareableUrl', () => {
    it('should return full URL for wishlist ID', () => {
      // Update location mock
      (window.location as any) = { ...window.location, origin: 'http://localhost:3000' };
      const testId = '123e4567-e89b-12d3-a456-426614174000';

      const url = listActionsService.getShareableUrl(testId);

      expect(url).toBe(`http://localhost:3000/${testId}`);
    });
  });
});
