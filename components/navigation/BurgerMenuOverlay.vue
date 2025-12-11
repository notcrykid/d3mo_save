<template>
  <Teleport to="body">
    <Transition name="burger-menu">
      <div 
        v-if="isOpen"
        class="burger-menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        ref="overlayRef"
      >
        <!-- Backdrop layer per gestire il click fuori dal contenuto -->
        <div 
          class="burger-menu-overlay__backdrop"
          @click="handleBackdropClick"
          @mousedown.stop
        ></div>

        <!-- Search Bar at Top - Aligned with Sign In button -->
        <div class="burger-menu-overlay__search-container">
          <div class="burger-menu-overlay__search-wrapper">
            <BurgerSearchBar
              v-model="searchQuery"
              placeholder="Search products..."
              :autofocus="true"
              @search="handleSearch"
              ref="searchBarRef"
            />
          </div>
        </div>

        <!-- Menu Content Container -->
        <div class="burger-menu-overlay__content" ref="menuContentRef">
          <!-- Desktop/Tablet: Multi-column layout -->
          <div class="burger-menu-overlay__columns">
            <!-- Column 1: Primary Navigation -->
            <nav class="burger-menu-overlay__column burger-menu-overlay__column--primary" aria-label="Primary navigation">
              <h3 class="burger-menu-overlay__column-title">Shop</h3>
              <ul class="burger-menu-overlay__nav-list">
                <li 
                  v-for="(item, index) in primaryNavItems" 
                  :key="item.label"
                  class="burger-menu-overlay__nav-item"
                  :style="{ animationDelay: `${80 + index * 50}ms` }"
                >
                  <a 
                    :href="item.href"
                    class="burger-menu-overlay__nav-link"
                    @click.prevent="handleNavClick(item)"
                  >
                    {{ item.label }}
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Column 2: User Area -->
            <nav class="burger-menu-overlay__column burger-menu-overlay__column--user" aria-label="Account navigation">
              <h3 class="burger-menu-overlay__column-title">Account</h3>
              <ul class="burger-menu-overlay__nav-list">
                <li 
                  v-for="(item, index) in userAreaItems" 
                  :key="item.label"
                  class="burger-menu-overlay__nav-item"
                  :style="{ animationDelay: `${180 + index * 50}ms` }"
                >
                  <a 
                    :href="item.href"
                    class="burger-menu-overlay__nav-link"
                    @click.prevent="handleNavClick(item)"
                  >
                    {{ item.label }}
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Column 3: Utilities -->
            <div class="burger-menu-overlay__column burger-menu-overlay__column--utilities" aria-label="Settings">
              <h3 class="burger-menu-overlay__column-title">Settings</h3>
              
              <!-- Language Selector -->
              <div class="burger-menu-overlay__utility-group">
                <span class="burger-menu-overlay__utility-label">Language</span>
                <div class="burger-menu-overlay__selector">
                  <button 
                    v-for="lang in languages"
                    :key="lang.code"
                    type="button"
                    class="burger-menu-overlay__selector-option"
                    :class="{ 'burger-menu-overlay__selector-option--active': selectedLanguage === lang.code }"
                    @click="selectLanguage(lang.code)"
                    :aria-pressed="selectedLanguage === lang.code"
                  >
                    {{ lang.label }}
                  </button>
                </div>
              </div>

              <!-- Currency Selector -->
              <div class="burger-menu-overlay__utility-group">
                <span class="burger-menu-overlay__utility-label">Currency</span>
                <div class="burger-menu-overlay__selector">
                  <button 
                    v-for="currency in currencies"
                    :key="currency.code"
                    type="button"
                    class="burger-menu-overlay__selector-option"
                    :class="{ 'burger-menu-overlay__selector-option--active': selectedCurrency === currency.code }"
                    @click="selectCurrency(currency.code)"
                    :aria-pressed="selectedCurrency === currency.code"
                  >
                    {{ currency.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: Keyboard hints -->
        <div class="burger-menu-overlay__footer">
          <span class="burger-menu-overlay__hint">ESC to close · Tab to navigate</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import BurgerSearchBar from './BurgerSearchBar.vue'

// Interfaces
interface NavItem {
  label: string
  href: string
  action?: () => void
  group?: 'primary' | 'user' | 'utilities'
}

interface LanguageOption {
  code: string
  label: string
}

interface CurrencyOption {
  code: string
  label: string
}

// Props
interface BurgerMenuOverlayProps {
  isOpen: boolean
}

const props = defineProps<BurgerMenuOverlayProps>()

// Emits
const emit = defineEmits<{
  close: []
  'nav-click': [item: NavItem]
  search: [query: string]
  'language-change': [code: string]
  'currency-change': [code: string]
}>()

// Refs
const overlayRef = ref<HTMLElement | null>(null)
const menuContentRef = ref<HTMLElement | null>(null)
const searchBarRef = ref<InstanceType<typeof BurgerSearchBar> | null>(null)
const searchQuery = ref('')
const previousActiveElement = ref<HTMLElement | null>(null)

// Selectors state
const selectedLanguage = ref('EN')
const selectedCurrency = ref('EUR')

// Primary Navigation Items (Column 1)
const primaryNavItems: NavItem[] = [
  { label: 'HOMEPAGE', href: '/', group: 'primary' },
  { label: 'COLLECTION', href: '/collection', group: 'primary' },
  { label: 'BRANDS', href: '/brands', group: 'primary' },
  { label: 'OFFERS / SPECIALS', href: '/offers', group: 'primary' },
  { label: 'HELP / FAQ', href: '/help', group: 'primary' }
]

// User Area Items (Column 2)
const userAreaItems: NavItem[] = [
  { label: 'ACCOUNT', href: '/account', group: 'user' },
  { label: 'ORDERS', href: '/orders', group: 'user' },
  { label: 'RETURNS', href: '/returns', group: 'user' },
  { label: 'SUPPORT / CONTACT', href: '/support', group: 'user' }
]

// Language options
const languages: LanguageOption[] = [
  { code: 'EN', label: 'EN' },
  { code: 'IT', label: 'IT' }
]

// Currency options
const currencies: CurrencyOption[] = [
  { code: 'EUR', label: 'EUR' },
  { code: 'USD', label: 'USD' }
]

// Handlers
const handleClose = (): void => {
  emit('close')
}

const handleBackdropClick = (event: MouseEvent): void => {
  // Chiudi solo se il click è avvenuto sul backdrop stesso
  // (non sui suoi figli, cioè il contenuto)
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const handleNavClick = (item: NavItem): void => {
  if (item.action) {
    item.action()
  }
  emit('nav-click', item)
  emit('close')
}

const handleSearch = (query: string): void => {
  emit('search', query)
}

const selectLanguage = (code: string): void => {
  selectedLanguage.value = code
  emit('language-change', code)
}

const selectCurrency = (code: string): void => {
  selectedCurrency.value = code
  emit('currency-change', code)
}

// Focus trap implementation
const getFocusableElements = (): HTMLElement[] => {
  if (!overlayRef.value) return []
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]
  
  return Array.from(
    overlayRef.value.querySelectorAll(focusableSelectors.join(', '))
  ) as HTMLElement[]
}

const trapFocus = (e: KeyboardEvent): void => {
  if (!props.isOpen) return
  
  // Handle ESC key
  if (e.key === 'Escape') {
    e.preventDefault()
    handleClose()
    return
  }
  
  // Handle Tab key for focus trap
  if (e.key !== 'Tab') return
  
  const focusableElements = getFocusableElements()
  if (focusableElements.length === 0) return
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  if (e.shiftKey) {
    // Shift + Tab: go to last element if on first
    if (document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    }
  } else {
    // Tab: go to first element if on last
    if (document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }
}

const handleKeyDown = (e: KeyboardEvent): void => {
  trapFocus(e)
}

// Watch for menu open/close to manage focus and body scroll
watch(() => props.isOpen, (newValue) => {
  if (typeof document === 'undefined') return
  
  if (newValue) {
    // Save current active element for focus restoration
    previousActiveElement.value = document.activeElement as HTMLElement
    
    // Lock body scroll when menu opens
    document.body.style.overflow = 'hidden'
    
    // Focus search bar after transition
    nextTick(() => {
      if (searchBarRef.value) {
        searchBarRef.value.focus()
      }
    })
  } else {
    // Unlock body scroll when menu closes
    document.body.style.overflow = ''
    
    // Restore focus to previously focused element
    if (previousActiveElement.value) {
      previousActiveElement.value.focus()
      previousActiveElement.value = null
    }
  }
})

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeyDown)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeyDown)
    // Ensure body scroll is unlocked
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.burger-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: var(--color-bg-base);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Backdrop layer per gestire il click fuori dal contenuto */
.burger-menu-overlay__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background-color: transparent;
  pointer-events: auto;
}

/* Search Container - Top of overlay */
.burger-menu-overlay__search-container {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-neutral-surface);
  max-width: 100%;
  pointer-events: none;
}

.burger-menu-overlay__search-container * {
  pointer-events: auto;
}

.burger-menu-overlay__search-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  max-width: 100%;
}

/* Menu Content */
.burger-menu-overlay__content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
}

.burger-menu-overlay__content * {
  pointer-events: auto;
}

/* Columns Container */
.burger-menu-overlay__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
  max-width: 1200px;
  width: 100%;
}

/* Individual Column */
.burger-menu-overlay__column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.burger-menu-overlay__column-title {
  font-family: var(--font-secondary);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-primary-ink);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.6;
  margin: 0 0 var(--spacing-sm) 0;
}

/* Navigation List */
.burger-menu-overlay__nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Navigation Item */
.burger-menu-overlay__nav-item {
  opacity: 0;
  animation: itemFadeIn 400ms cubic-bezier(0.33, 0, 0.2, 1) forwards;
}

@keyframes itemFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Navigation Link */
.burger-menu-overlay__nav-link {
  display: block;
  font-family: var(--font-secondary);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-primary-ink);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: var(--spacing-xs) 0;
  transition: opacity 0.2s ease, color 0.2s ease;
  position: relative;
}

.burger-menu-overlay__nav-link:hover {
  opacity: 0.7;
}

.burger-menu-overlay__nav-link:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: 4px;
}

/* Utilities Column */
.burger-menu-overlay__utility-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.burger-menu-overlay__utility-label {
  font-family: var(--font-secondary);
  font-size: 11px;
  color: var(--color-primary-ink);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.6;
}

.burger-menu-overlay__selector {
  display: flex;
  gap: var(--spacing-sm);
}

.burger-menu-overlay__selector-option {
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-secondary);
  font-size: 13px;
  color: var(--color-primary-ink);
  background: transparent;
  border: 1px solid var(--color-neutral-surface);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.burger-menu-overlay__selector-option:hover {
  border-color: var(--color-primary-ink);
}

.burger-menu-overlay__selector-option:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: 2px;
}

.burger-menu-overlay__selector-option--active {
  background-color: var(--color-primary-ink);
  color: var(--color-bg-base);
  border-color: var(--color-primary-ink);
}

/* Footer */
.burger-menu-overlay__footer {
  position: relative;
  z-index: 1;
  padding: var(--spacing-md) var(--spacing-xl);
  border-top: 1px solid var(--color-neutral-surface);
  text-align: center;
  pointer-events: none;
}

.burger-menu-overlay__footer * {
  pointer-events: auto;
}

.burger-menu-overlay__hint {
  font-family: var(--font-secondary);
  font-size: 11px;
  color: var(--color-primary-ink);
  opacity: 0.5;
  letter-spacing: 0.05em;
}

/* Transition: Overlay open/close */
.burger-menu-enter-active {
  transition: opacity 400ms cubic-bezier(0.33, 0, 0.2, 1),
              transform 400ms cubic-bezier(0.33, 0, 0.2, 1);
}

.burger-menu-leave-active {
  transition: opacity 300ms cubic-bezier(0.33, 0, 0.2, 1),
              transform 300ms cubic-bezier(0.33, 0, 0.2, 1);
}

.burger-menu-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.burger-menu-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Responsive: Tablet (768-1023px) - 2 columns */
@media (min-width: 768px) and (max-width: 1023px) {
  .burger-menu-overlay__columns {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }

  .burger-menu-overlay__column--utilities {
    grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-neutral-surface);
    margin-top: var(--spacing-md);
  }

  .burger-menu-overlay__column--utilities .burger-menu-overlay__column-title {
    width: 100%;
  }

  .burger-menu-overlay__utility-group {
    margin-bottom: 0;
  }
}

/* Responsive: Mobile (<768px) - 1 column */
@media (max-width: 767px) {
  .burger-menu-overlay__search-container {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }

  .burger-menu-overlay__search-wrapper {
    width: 100%;
  }

  .burger-menu-overlay__content {
    padding: var(--spacing-lg) var(--spacing-md);
    align-items: flex-start;
  }

  .burger-menu-overlay__columns {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .burger-menu-overlay__column {
    gap: var(--spacing-md);
  }

  .burger-menu-overlay__nav-list {
    gap: var(--spacing-sm);
  }

  .burger-menu-overlay__nav-link {
    font-size: 13px;
    padding: var(--spacing-sm) 0;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .burger-menu-overlay__column--utilities {
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-neutral-surface);
    margin-top: var(--spacing-md);
  }

  .burger-menu-overlay__footer {
    padding: var(--spacing-md);
  }

  .burger-menu-overlay__hint {
    font-size: 10px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .burger-menu-enter-active,
  .burger-menu-leave-active {
    transition: opacity 200ms ease;
    transform: none;
  }

  .burger-menu-enter-from,
  .burger-menu-leave-to {
    transform: none;
  }

  .burger-menu-overlay__nav-item {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .burger-menu-overlay__nav-link,
  .burger-menu-overlay__selector-option {
    transition: none;
  }
}
</style>

