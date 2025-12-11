import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useBreakpoint } from '~/composables/useBreakpoint'

describe('useBreakpoint', () => {
  let mockMatchMedia: (query: string) => MediaQueryList

  beforeEach(() => {
    // Mock matchMedia
    mockMatchMedia = vi.fn((query: string) => {
      const matches = {
        '(max-width: 767px)': false,
        '(min-width: 768px) and (max-width: 1023px)': false,
        '(min-width: 1024px)': false
      }[query] ?? false

      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      } as MediaQueryList
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    })
  })

  it('should detect mobile breakpoint (< 768px)', () => {
    mockMatchMedia = vi.fn((query: string) => {
      const matches = query === '(max-width: 767px)'
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      } as MediaQueryList
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    })

    const TestComponent = defineComponent({
      setup() {
        const { isMobile, isTablet, isDesktop } = useBreakpoint()
        return { isMobile, isTablet, isDesktop }
      },
      template: '<div></div>'
    })

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any

    expect(vm.isMobile).toBe(true)
    expect(vm.isTablet).toBe(false)
    expect(vm.isDesktop).toBe(false)
  })

  it('should detect tablet breakpoint (768-1023px)', () => {
    mockMatchMedia = vi.fn((query: string) => {
      const matches = query === '(min-width: 768px) and (max-width: 1023px)'
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      } as MediaQueryList
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    })

    const TestComponent = defineComponent({
      setup() {
        const { isMobile, isTablet, isDesktop } = useBreakpoint()
        return { isMobile, isTablet, isDesktop }
      },
      template: '<div></div>'
    })

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any

    expect(vm.isMobile).toBe(false)
    expect(vm.isTablet).toBe(true)
    expect(vm.isDesktop).toBe(false)
  })

  it('should detect desktop breakpoint (>= 1024px)', () => {
    mockMatchMedia = vi.fn((query: string) => {
      const matches = query === '(min-width: 1024px)'
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      } as MediaQueryList
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    })

    const TestComponent = defineComponent({
      setup() {
        const { isMobile, isTablet, isDesktop } = useBreakpoint()
        return { isMobile, isTablet, isDesktop }
      },
      template: '<div></div>'
    })

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any

    expect(vm.isMobile).toBe(false)
    expect(vm.isTablet).toBe(false)
    expect(vm.isDesktop).toBe(true)
  })

  it('should return computed refs', () => {
    const TestComponent = defineComponent({
      setup() {
        const { isMobile, isTablet, isDesktop } = useBreakpoint()
        return { isMobile, isTablet, isDesktop }
      },
      template: '<div></div>'
    })

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any

    expect(vm.isMobile).toBeDefined()
    expect(vm.isTablet).toBeDefined()
    expect(vm.isDesktop).toBeDefined()
    expect(typeof vm.isMobile).toBe('boolean')
    expect(typeof vm.isTablet).toBe('boolean')
    expect(typeof vm.isDesktop).toBe('boolean')
  })
})



