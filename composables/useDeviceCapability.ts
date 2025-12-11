import { ref, computed, onMounted } from 'vue'
import { useBreakpoint } from './useBreakpoint'

/**
 * Composable for device capability detection
 * 
 * Detects device capabilities for performance optimization:
 * - Low-end device detection (based on hardware concurrency, device memory)
 * - prefers-reduced-motion preference
 * - FPS estimation for performance gating
 * 
 * Used to gate heavy animations and effects on low-end devices.
 * 
 * @returns {Object} Device capability state
 */
export const useDeviceCapability = () => {
  const { isMobile } = useBreakpoint()
  
  const isLowEnd = ref(false)
  const prefersReducedMotion = ref(false)
  const fps = ref(60) // Default to 60 FPS

  /**
   * Detect if device is low-end based on hardware capabilities
   */
  const detectLowEndDevice = (): boolean => {
    if (typeof navigator === 'undefined') {
      return false
    }

    // Check hardware concurrency (CPU cores)
    const cores = (navigator as any).hardwareConcurrency || 4
    const isLowCores = cores < 4

    // Check device memory (if available)
    const memory = (navigator as any).deviceMemory
    const isLowMemory = memory !== undefined && memory < 4

    // Check connection (if available)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.saveData === true
    )

    // Mobile devices with low specs are considered low-end
    // Desktop devices need multiple indicators to be low-end
    if (isMobile.value) {
      return isLowCores || isLowMemory || isSlowConnection
    } else {
      return (isLowCores && isLowMemory) || isSlowConnection
    }
  }

  /**
   * Detect prefers-reduced-motion preference
   */
  const detectReducedMotion = (): boolean => {
    if (typeof window === 'undefined') {
      return false
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    return mediaQuery.matches
  }

  /**
   * Estimate FPS using requestAnimationFrame
   */
  const estimateFPS = (): void => {
    if (typeof window === 'undefined') {
      return
    }

    let lastTime = performance.now()
    let frameCount = 0
    let totalTime = 0
    const sampleDuration = 1000 // Sample for 1 second

    const measureFrame = (currentTime: number) => {
      frameCount++
      totalTime = currentTime - lastTime

      if (totalTime >= sampleDuration) {
        const averageFPS = Math.round((frameCount * 1000) / totalTime)
        fps.value = Math.min(60, Math.max(30, averageFPS)) // Clamp between 30-60
        return
      }

      requestAnimationFrame(measureFrame)
    }

    requestAnimationFrame(measureFrame)
  }

  onMounted(() => {
    isLowEnd.value = detectLowEndDevice()
    prefersReducedMotion.value = detectReducedMotion()

    // Estimate FPS after a short delay to allow page to settle
    setTimeout(() => {
      estimateFPS()
    }, 500)

    // Listen for reduced motion changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const handleChange = (e: MediaQueryListEvent) => {
        prefersReducedMotion.value = e.matches
      }

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        mediaQuery.addListener(handleChange)
      }
    }
  })

  return {
    isLowEnd: computed(() => isLowEnd.value),
    prefersReducedMotion: computed(() => prefersReducedMotion.value),
    fps: computed(() => fps.value)
  }
}



