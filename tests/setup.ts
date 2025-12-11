import { vi } from 'vitest'

// Mock window.performance for tests
Object.defineProperty(window, 'performance', {
  value: {
    getEntriesByType: vi.fn(() => []),
    now: vi.fn(() => Date.now())
  },
  writable: true
})

// Mock matchMedia for prefers-reduced-motion tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock Nuxt app config for component tests
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useRuntimeConfig: () => ({
      public: {
        baseURL: '/',
        lowStockThreshold: 10,
        strapiUrl: 'http://localhost:1337'
      }
    }),
    useAppConfig: () => ({
      cdnURL: '',
      buildAssetsDir: '/_nuxt/'
    })
  }
})

