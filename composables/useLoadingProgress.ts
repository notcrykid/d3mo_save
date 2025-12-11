import { ref, computed } from 'vue'

/**
 * Composable for tracking real asset loading progress
 * 
 * Uses browser Resource Timing API to track actual asset loading progress.
 * Updates progress bar in real-time as assets load.
 * 
 * @returns {Object} Progress tracking functions and state
 */
export const useLoadingProgress = () => {
  const progress = ref(0)
  const isComplete = ref(false)
  const startTime = ref<number | null>(null)
  const MIN_PROGRESS_DURATION = 2500 // Minimum 2.5 seconds for progress animation

  /**
   * Track loading progress using Resource Timing API
   */
  const trackProgress = (): void => {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      // Fallback: simulate progress over minimum duration
      if (!startTime.value) {
        startTime.value = Date.now()
      }
      const elapsed = Date.now() - startTime.value
      if (elapsed < MIN_PROGRESS_DURATION) {
        progress.value = Math.min(90, Math.round((elapsed / MIN_PROGRESS_DURATION) * 90))
        return
      }
      progress.value = 100
      isComplete.value = true
      return
    }

    // Get all resource entries
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    // Critical assets to track
    const criticalAssets = resources.filter(resource => {
      const name = resource.name.toLowerCase()
      return (
        name.includes('.css') ||
        name.includes('.js') ||
        name.includes('.woff') ||
        name.includes('.woff2') ||
        name.includes('.ttf') ||
        name.includes('.png') ||
        name.includes('.jpg') ||
        name.includes('.jpeg') ||
        name.includes('.svg') ||
        name.includes('.webp')
      )
    })

    // Record start time if not set
    if (!startTime.value) {
      startTime.value = Date.now()
    }

    const elapsed = Date.now() - startTime.value

    if (criticalAssets.length === 0) {
      // No resources to track - simulate progress over minimum duration
      if (elapsed < MIN_PROGRESS_DURATION) {
        // Animate from 0 to 90% over minimum duration
        progress.value = Math.min(90, Math.round((elapsed / MIN_PROGRESS_DURATION) * 90))
        return
      }
      // After minimum duration, set progress to 100
      // Completion will be handled by startTracking's timeout/load handler
      progress.value = 100
      return
    }

    // Calculate progress based on loaded resources
    const loadedCount = criticalAssets.filter(resource => {
      // Resource is loaded if transferSize > 0 or duration > 0
      return resource.transferSize > 0 || resource.duration > 0
    }).length

    // Calculate base progress from loaded resources
    const baseProgress = Math.min(90, Math.round((loadedCount / criticalAssets.length) * 90))
    
    // Ensure minimum duration - if elapsed time is less than minimum, 
    // scale progress based on time, not just loaded resources
    if (elapsed < MIN_PROGRESS_DURATION) {
      const timeBasedProgress = Math.round((elapsed / MIN_PROGRESS_DURATION) * 90)
      // Use the maximum of time-based and resource-based progress
      progress.value = Math.max(timeBasedProgress, baseProgress)
    } else {
      // After minimum duration, use actual resource progress
      progress.value = baseProgress
    }

    // Check if all critical assets are loaded
    const allLoaded = criticalAssets.every(resource => {
      return resource.transferSize > 0 || resource.duration > 0
    })

    // Update progress to 100% if all loaded, but completion is handled by startTracking
    // to ensure minimum duration is respected
    if (allLoaded) {
      progress.value = 100
      // Note: isComplete will be set by the load event handler or timeout in startTracking
      // after minimum duration has passed
    }
  }

  /**
   * Start tracking progress
   */
  const startTracking = (): void => {
    progress.value = 0
    isComplete.value = false
    startTime.value = Date.now()

    // Initial check
    trackProgress()

    let interval: ReturnType<typeof setInterval> | null = null

    // Fallback: ensure completion after maximum time (3 seconds)
    const maxDurationTimeout = setTimeout(() => {
      if (!isComplete.value) {
        progress.value = 100
        isComplete.value = true
        if (interval) {
          clearInterval(interval)
        }
      }
    }, 3000)

    // Poll for updates (Resource Timing API may not have all entries immediately)
    interval = setInterval(() => {
      trackProgress()
      
      // Check if we should complete: progress is 100% and minimum duration has passed
      if (progress.value >= 100 && startTime.value) {
        const elapsed = Date.now() - startTime.value
        if (elapsed >= MIN_PROGRESS_DURATION && !isComplete.value) {
          isComplete.value = true
          clearInterval(interval!)
          clearTimeout(maxDurationTimeout)
        }
      }
      
      if (isComplete.value) {
        clearInterval(interval!)
        clearTimeout(maxDurationTimeout)
      }
    }, 50) // Check every 50ms for smoother updates

    // Also listen for load event
    if (typeof window !== 'undefined') {
      // Check if page is already loaded
      if (document.readyState === 'complete') {
        // Page already loaded, handle immediately
        trackProgress()
        setTimeout(() => {
          if (startTime.value) {
            const elapsed = Date.now() - startTime.value
            if (elapsed < MIN_PROGRESS_DURATION) {
              // Wait for remaining time
              setTimeout(() => {
                progress.value = 100
                isComplete.value = true
                if (interval) {
                  clearInterval(interval)
                }
                clearTimeout(maxDurationTimeout)
              }, MIN_PROGRESS_DURATION - elapsed)
              return
            }
          }
          progress.value = 100
          isComplete.value = true
          if (interval) {
            clearInterval(interval)
          }
          clearTimeout(maxDurationTimeout)
        }, 200)
      } else {
        // Page still loading, wait for load event
        window.addEventListener('load', () => {
          trackProgress()
          // Give a small delay to ensure all resources are recorded
          setTimeout(() => {
            // Ensure minimum duration has passed
            if (startTime.value) {
              const elapsed = Date.now() - startTime.value
              if (elapsed < MIN_PROGRESS_DURATION) {
                // Wait for remaining time
                setTimeout(() => {
                  progress.value = 100
                  isComplete.value = true
                  if (interval) {
                    clearInterval(interval)
                  }
                  clearTimeout(maxDurationTimeout)
                }, MIN_PROGRESS_DURATION - elapsed)
                return
              }
            }
            progress.value = 100
            isComplete.value = true
            if (interval) {
              clearInterval(interval)
            }
            clearTimeout(maxDurationTimeout)
          }, 200)
        }, { once: true })
      }
    }
  }

  /**
   * Reset progress tracking
   */
  const reset = (): void => {
    progress.value = 0
    isComplete.value = false
    startTime.value = null
  }

  return {
    progress: computed(() => progress.value),
    isComplete: computed(() => isComplete.value),
    startTracking,
    trackProgress,
    reset
  }
}
