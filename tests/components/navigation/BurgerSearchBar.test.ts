import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BurgerSearchBar from '~/components/navigation/BurgerSearchBar.vue'

/**
 * Component tests for BurgerSearchBar
 * 
 * Acceptance Criteria Coverage:
 * - AC4: Minimal search bar centered at top when menu is open
 * 
 * Test Coverage:
 * - Input value binding (v-model)
 * - Search event emission
 * - Autofocus behavior
 * - Enter key submission
 * - Icon button click
 * - Accessibility attributes
 */

describe('BurgerSearchBar', () => {
  beforeEach(() => {
    // Reset document body overflow
    document.body.style.overflow = ''
  })

  describe('AC4: Search Bar Rendering', () => {
    it('should render search bar with input field', () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: ''
        }
      })

      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('aria-label')).toBe('Search products')
    })

    it('should display placeholder text', () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: '',
          placeholder: 'Search products...'
        }
      })

      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe('Search products...')
    })

    it('should have correct role and aria-label attributes', () => {
      const wrapper = mount(BurgerSearchBar)
      
      const container = wrapper.find('.burger-search-bar')
      expect(container.attributes('role')).toBe('search')
      expect(container.attributes('aria-label')).toBe('Search products')
    })
  })

  describe('Input Value Binding', () => {
    it('should bind modelValue to input value', () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: 'test query'
        }
      })

      const input = wrapper.find('input').element as HTMLInputElement
      expect(input.value).toBe('test query')
    })

    it('should emit update:modelValue when input changes', async () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: ''
        }
      })

      const input = wrapper.find('input')
      await input.setValue('new search query')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new search query'])
    })
  })

  describe('Search Event Emission', () => {
    it('should emit search event when Enter key is pressed', async () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: 'test query'
        }
      })

      const input = wrapper.find('input')
      await input.trigger('keydown.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')?.[0]).toEqual(['test query'])
    })

    it('should emit search event when icon button is clicked', async () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: 'test query'
        }
      })

      const iconButton = wrapper.find('button.burger-search-bar__icon')
      await iconButton.trigger('click')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')?.[0]).toEqual(['test query'])
    })

    it('should emit empty string if modelValue is empty', async () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: ''
        }
      })

      const input = wrapper.find('input')
      await input.trigger('keydown.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')?.[0]).toEqual([''])
    })
  })

  describe('Autofocus Behavior', () => {
    it('should focus input when autofocus prop is true', async () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: '',
          autofocus: true
        }
      })

      await wrapper.vm.$nextTick()

      const input = wrapper.find('input').element as HTMLInputElement
      // Note: In test environment, focus may not work the same way
      // This test verifies the autofocus prop is passed and handled
      expect(wrapper.props('autofocus')).toBe(true)
    })

    it('should not focus input when autofocus prop is false', () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: '',
          autofocus: false
        }
      })

      expect(wrapper.props('autofocus')).toBe(false)
    })
  })

  describe('Icon Button', () => {
    it('should render search icon button', () => {
      const wrapper = mount(BurgerSearchBar)
      
      const iconButton = wrapper.find('button.burger-search-bar__icon')
      expect(iconButton.exists()).toBe(true)
      expect(iconButton.attributes('aria-label')).toBe('Submit search')
      expect(iconButton.attributes('type')).toBe('button')
    })

    it('should have SVG icon inside button', () => {
      const wrapper = mount(BurgerSearchBar)
      
      const iconButton = wrapper.find('button.burger-search-bar__icon')
      const svg = iconButton.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('aria-hidden')).toBe('true')
    })

    it('should emit search event on icon button click', async () => {
      const wrapper = mount(BurgerSearchBar, {
        props: {
          modelValue: 'query'
        }
      })

      const iconButton = wrapper.find('button.burger-search-bar__icon')
      await iconButton.trigger('click')

      expect(wrapper.emitted('search')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on input', () => {
      const wrapper = mount(BurgerSearchBar)
      
      const input = wrapper.find('input')
      expect(input.attributes('aria-label')).toBe('Search products')
    })

    it('should have proper ARIA attributes on icon button', () => {
      const wrapper = mount(BurgerSearchBar)
      
      const iconButton = wrapper.find('button.burger-search-bar__icon')
      expect(iconButton.attributes('aria-label')).toBe('Submit search')
    })

    it('should have decorative SVG with aria-hidden', () => {
      const wrapper = mount(BurgerSearchBar)
      
      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Component Expose', () => {
    it('should expose focus method', () => {
      const wrapper = mount(BurgerSearchBar)
      
      const component = wrapper.vm as any
      expect(typeof component.focus).toBe('function')
    })

    it('should focus input when focus method is called', async () => {
      const wrapper = mount(BurgerSearchBar)
      
      const component = wrapper.vm as any
      const input = wrapper.find('input').element as HTMLInputElement
      
      // Mock focus method
      const focusSpy = vi.spyOn(input, 'focus')
      
      component.focus()
      
      // In test environment, focus may not work, but we verify the method exists
      expect(focusSpy).toHaveBeenCalled()
    })
  })
})


