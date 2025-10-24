import { vi, beforeEach, afterEach } from 'vitest';
import { mockData } from '../__mocks__/supabase';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock as any;

// Mock window.location
delete (window as any).location;
window.location = {
  href: 'http://localhost:3000/',
  pathname: '/',
  search: '',
  hash: '',
  origin: 'http://localhost:3000',
} as any;

// Mock window.history
window.history.pushState = vi.fn();
window.history.replaceState = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock document.execCommand
document.execCommand = vi.fn();

// Mock alert and prompt
window.alert = vi.fn();
window.prompt = vi.fn();

// Reset mocks before each test
beforeEach(() => {
  mockData.reset();
  localStorageMock.clear();
  vi.clearAllMocks();

  // Reset matchMedia to default (light theme preference)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});
