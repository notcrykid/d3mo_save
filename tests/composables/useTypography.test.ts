import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useTypography } from '~/composables/useTypography'

describe('useTypography', () => {
  let mockMatchMedia: (query: string) => MediaQueryList

  beforeEach(() => {
    // Mock matchMedia for useBreakpoint
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

  it('should return desktop typography sizes on desktop breakpoint', () => {
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
        const { h1, h2, h3, body, caption, lineHeights } = useTypography()
        return { h1, h2, h3, body, caption, lineHeights }
      },
      template: '<div></div>'
    })

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any

    expect(vm.h1).toBe(48)
    expect(vm.h2).toBe(32)
    expect(vm.h3).toBe(24)
    expect(vm.body).toBe(17)
    expect(vm.caption).toBe(12)
    expect(vm.lineHeights.h1).toBe(1.1)
    expect(vm.lineHeights.body).toBe(1.6)
  })

  it('should return tablet typography sizes on tablet breakpoint', () => {
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
        const { h1, h2, h3, body, caption } = useTypography()
        return { h1, h2, h3, body, caption }
      },
      template: '<div></div>'
    })

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any

    // ~10% reduction from desktop
    expect(vm.h1).toBe(43)
    expect(vm.h2).toBe(29)
    expect(vm.h3).toBe(22)
    expect(vm.body).toBe(15)
    expect(vm.caption).toBe(11)
  })

  it('should return mobile typography sizes on mobile breakpoint', () => {
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
        const { h1, h2, h3, body, caption } = useTypography()
        return { h1, h2, h3, body, caption }
      },
      template: '<div></div>'
    })

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any

    // ~20% reduction from desktop, min 14px for body
    expect(vm.h1).toBe(38)
    expect(vm.h2).toBe(26)
    expect(vm.h3).toBe(19)
    expect(vm.body).toBe(14) // Minimum 14px
    expect(vm.caption).toBe(10)
  })

  it('should return line heights in valid range (1.1-1.6)', () => {
    const TestComponent = defineComponent({
      setup() {
        const { lineHeights } = useTypography()
        return { lineHeights }
      },
      template: '<div></div>'
    })

    const wrapper = mount(TestComponent)
    const vm = wrapper.vm as any

    expect(vm.lineHeights.h1).toBeGreaterThanOrEqual(1.1)
    expect(vm.lineHeights.h1).toBeLessThanOrEqual(1.6)
    expect(vm.lineHeights.h2).toBeGreaterThanOrEqual(1.1)
    expect(vm.lineHeights.h2).toBeLessThanOrEqual(1.6)
    expect(vm.lineHeights.h3).toBeGreaterThanOrEqual(1.1)
    expect(vm.lineHeights.h3).toBeLessThanOrEqual(1.6)
    expect(vm.lineHeights.body).toBeGreaterThanOrEqual(1.1)
    expect(vm.lineHeights.body).toBeLessThanOrEqual(1.6)
    expect(vm.lineHeights.caption).toBeGreaterThanOrEqual(1.1)
    expect(vm.lineHeights.caption).toBeLessThanOrEqual(1.6)
  })
})



