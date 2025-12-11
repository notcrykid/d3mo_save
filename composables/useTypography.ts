import { computed } from 'vue'
import { useBreakpoint } from './useBreakpoint'

/**
 * Composable for responsive typography scale
 * 
 * Provides reactive typography sizes based on current breakpoint.
 * Uses CSS custom properties from styles/variables.css as base values.
 * 
 * Typography scale:
 * - Desktop: h1 48px, h2 32px, h3 24px, body 17px
 * - Tablet: ~10% reduction from desktop
 * - Mobile: ~20% reduction from desktop (min 14px for body)
 * 
 * @returns {Object} Reactive typography sizes
 */
export const useTypography = () => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  // Base desktop sizes (from CSS custom properties)
  const desktopSizes = {
    h1: 48,
    h2: 32,
    h3: 24,
    body: 17,
    caption: 12
  }

  // Calculate responsive sizes
  const h1 = computed(() => {
    if (isMobile.value) {
      // ~20% reduction: 48 * 0.8 = 38.4px
      return 38
    } else if (isTablet.value) {
      // ~10% reduction: 48 * 0.9 = 43.2px
      return 43
    }
    return desktopSizes.h1
  })

  const h2 = computed(() => {
    if (isMobile.value) {
      // ~20% reduction: 32 * 0.8 = 25.6px
      return 26
    } else if (isTablet.value) {
      // ~10% reduction: 32 * 0.9 = 28.8px
      return 29
    }
    return desktopSizes.h2
  })

  const h3 = computed(() => {
    if (isMobile.value) {
      // ~20% reduction: 24 * 0.8 = 19.2px
      return 19
    } else if (isTablet.value) {
      // ~10% reduction: 24 * 0.9 = 21.6px
      return 22
    }
    return desktopSizes.h3
  })

  const body = computed(() => {
    if (isMobile.value) {
      // ~20% reduction: 17 * 0.8 = 13.6px, but min 14px
      return 14
    } else if (isTablet.value) {
      // ~10% reduction: 17 * 0.9 = 15.3px
      return 15
    }
    return desktopSizes.body
  })

  const caption = computed(() => {
    if (isMobile.value) {
      // ~20% reduction: 12 * 0.8 = 9.6px
      return 10
    } else if (isTablet.value) {
      // ~10% reduction: 12 * 0.9 = 10.8px
      return 11
    }
    return desktopSizes.caption
  })

  // Line heights (from CSS custom properties, range 1.1-1.6)
  const lineHeights = {
    h1: 1.1,
    h2: 1.2,
    h3: 1.3,
    body: 1.6,
    caption: 1.4
  }

  return {
    h1,
    h2,
    h3,
    body,
    caption,
    lineHeights
  }
}



