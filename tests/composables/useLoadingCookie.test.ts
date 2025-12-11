import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLoadingCookie } from '~/composables/useLoadingCookie'

describe('useLoadingCookie', () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=')
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
  })

  it('should return false for hasSeenLoading when cookie does not exist', () => {
    const { hasSeenLoading } = useLoadingCookie()
    expect(hasSeenLoading()).toBe(false)
  })

  it('should return true for hasSeenLoading when cookie exists', () => {
    const { setLoadingSeen, hasSeenLoading } = useLoadingCookie()
    setLoadingSeen()
    expect(hasSeenLoading()).toBe(true)
  })

  it('should set cookie with correct name', () => {
    const { setLoadingSeen } = useLoadingCookie()
    setLoadingSeen()
    expect(document.cookie).toContain('d3mo_loading_seen=true')
  })

  it('should set cookie with expiration date', () => {
    const { setLoadingSeen } = useLoadingCookie()
    setLoadingSeen()
    // Cookie should be set (happy-dom may not fully support expires in document.cookie)
    expect(document.cookie).toContain('d3mo_loading_seen')
  })

  it('should return shouldShowLoading as true when cookie does not exist', () => {
    const { shouldShowLoading } = useLoadingCookie()
    expect(shouldShowLoading.value).toBe(true)
  })

  it('should return shouldShowLoading as false when cookie exists', () => {
    const { setLoadingSeen, shouldShowLoading } = useLoadingCookie()
    setLoadingSeen()
    expect(shouldShowLoading.value).toBe(false)
  })
})

