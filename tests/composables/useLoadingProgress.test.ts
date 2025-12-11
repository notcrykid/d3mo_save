import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLoadingProgress } from '~/composables/useLoadingProgress'

describe('useLoadingProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with progress 0', () => {
    const { progress } = useLoadingProgress()
    expect(progress.value).toBe(0)
  })

  it('should initialize with isComplete false', () => {
    const { isComplete } = useLoadingProgress()
    expect(isComplete.value).toBe(false)
  })

  it('should track progress when resources are available', () => {
    // Mock performance API with resources
    const mockResources = [
      { name: 'test.css', transferSize: 1000, duration: 100 },
      { name: 'test.js', transferSize: 2000, duration: 200 },
      { name: 'test.woff2', transferSize: 500, duration: 50 }
    ]

    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: vi.fn(() => mockResources)
      },
      writable: true,
      configurable: true
    })

    const { progress, trackProgress } = useLoadingProgress()
    trackProgress()
    
    // Progress should be calculated based on loaded resources
    expect(progress.value).toBeGreaterThan(0)
  })

  it('should mark as complete when all resources are loaded', async () => {
    const mockResources = [
      { name: 'test.css', transferSize: 1000, duration: 100 },
      { name: 'test.js', transferSize: 2000, duration: 200 }
    ]

    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: vi.fn(() => mockResources)
      },
      writable: true,
      configurable: true
    })

    // Mock document.readyState as 'complete' to trigger immediate completion path
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    })

    const { isComplete, startTracking } = useLoadingProgress()
    startTracking()
    
    // Wait for minimum duration (2.5 seconds) plus a small buffer
    await new Promise(resolve => setTimeout(resolve, 2600))
    
    // Should be complete if all resources have transferSize > 0 and minimum duration has passed
    expect(isComplete.value).toBe(true)
  })

  it('should handle missing performance API gracefully', async () => {
    // Remove performance API
    Object.defineProperty(window, 'performance', {
      value: undefined,
      writable: true,
      configurable: true
    })

    // Mock document.readyState as 'complete' to trigger immediate completion path
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
      configurable: true
    })

    const { progress, isComplete, startTracking } = useLoadingProgress()
    startTracking()
    
    // Wait for minimum duration (2.5 seconds) plus a small buffer
    await new Promise(resolve => setTimeout(resolve, 2600))
    
    // Should fallback to complete state after minimum duration
    expect(progress.value).toBe(100)
    expect(isComplete.value).toBe(true)
  })

  it('should reset progress and completion state', () => {
    const { progress, isComplete, reset, startTracking } = useLoadingProgress()
    
    // Start tracking to set some state
    startTracking()
    
    // Reset
    reset()
    
    expect(progress.value).toBe(0)
    expect(isComplete.value).toBe(false)
  })
})

