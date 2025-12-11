import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable for reactive breakpoint detection
 * 
 * Provides reactive refs for mobile, tablet, and desktop breakpoints.
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768-1023px
 * - Desktop: >= 1024px
 * 
 * @returns {Object} Reactive breakpoint state
 */
export const useBreakpoint = () => {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)

  // Media query strings matching CSS breakpoints
  const mobileQuery = '(max-width: 767px)'
  const tabletQuery = '(min-width: 768px) and (max-width: 1023px)'
  const desktopQuery = '(min-width: 1024px)'

  let mobileMediaQuery: MediaQueryList | null = null
  let tabletMediaQuery: MediaQueryList | null = null
  let desktopMediaQuery: MediaQueryList | null = null

  /**
   * Update breakpoint state based on media query matches
   */
  const updateBreakpoints = (): void => {
    if (typeof window === 'undefined') {
      // SSR: default to desktop
      isMobile.value = false
      isTablet.value = false
      isDesktop.value = true
      return
    }

    isMobile.value = mobileMediaQuery?.matches ?? false
    isTablet.value = tabletMediaQuery?.matches ?? false
    isDesktop.value = desktopMediaQuery?.matches ?? false
  }

  /**
   * Handler for media query changes
   */
  const handleMediaChange = (): void => {
    updateBreakpoints()
  }

  onMounted(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Create media query lists
    mobileMediaQuery = window.matchMedia(mobileQuery)
    tabletMediaQuery = window.matchMedia(tabletQuery)
    desktopMediaQuery = window.matchMedia(desktopQuery)

    // Initial update
    updateBreakpoints()

    // Listen for changes (modern browsers)
    if (mobileMediaQuery.addEventListener) {
      mobileMediaQuery.addEventListener('change', handleMediaChange)
      tabletMediaQuery.addEventListener('change', handleMediaChange)
      desktopMediaQuery.addEventListener('change', handleMediaChange)
    } else {
      // Fallback for older browsers
      mobileMediaQuery.addListener(handleMediaChange)
      tabletMediaQuery.addListener(handleMediaChange)
      desktopMediaQuery.addListener(handleMediaChange)
    }
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Clean up listeners
    if (mobileMediaQuery) {
      if (mobileMediaQuery.removeEventListener) {
        mobileMediaQuery.removeEventListener('change', handleMediaChange)
      } else {
        mobileMediaQuery.removeListener(handleMediaChange)
      }
    }
    if (tabletMediaQuery) {
      if (tabletMediaQuery.removeEventListener) {
        tabletMediaQuery.removeEventListener('change', handleMediaChange)
      } else {
        tabletMediaQuery.removeListener(handleMediaChange)
      }
    }
    if (desktopMediaQuery) {
      if (desktopMediaQuery.removeEventListener) {
        desktopMediaQuery.removeEventListener('change', handleMediaChange)
      } else {
        desktopMediaQuery.removeListener(handleMediaChange)
      }
    }
  })

  return {
    isMobile: computed(() => isMobile.value),
    isTablet: computed(() => isTablet.value),
    isDesktop: computed(() => isDesktop.value)
  }
}



