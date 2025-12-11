import { computed } from 'vue'

/**
 * Composable for managing loading sequence cookie
 * 
 * Manages cookie-based skip functionality for the loading sequence.
 * Cookie is set after first visit to skip loading on subsequent visits.
 * 
 * @returns {Object} Cookie management functions and state
 */
export const useLoadingCookie = () => {
  const cookieName = 'd3mo_loading_seen'
  const cookieExpirationDays = 30

  /**
   * Check if cookie exists (user has seen loading before)
   */
  const hasSeenLoading = (): boolean => {
    if (typeof document === 'undefined') return false
    
    const cookies = document.cookie.split(';')
    return cookies.some(cookie => {
      const [name] = cookie.trim().split('=')
      return name === cookieName
    })
  }

  /**
   * Set cookie to mark that user has seen loading
   */
  const setLoadingSeen = (): void => {
    if (typeof document === 'undefined') return

    const expirationDate = new Date()
    expirationDate.setTime(expirationDate.getTime() + (cookieExpirationDays * 24 * 60 * 60 * 1000))

    // Secure, HttpOnly, SameSite=Lax for security
    // Note: HttpOnly cannot be set from client-side JavaScript
    // This is a limitation - in production, cookie should be set server-side
    const cookieValue = `${cookieName}=true; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    
    document.cookie = cookieValue
  }

  /**
   * Determine if loading should be shown
   * Returns false if cookie exists (user has seen loading before)
   */
  const shouldShowLoading = computed(() => {
    return !hasSeenLoading()
  })

  return {
    hasSeenLoading,
    setLoadingSeen,
    shouldShowLoading
  }
}

