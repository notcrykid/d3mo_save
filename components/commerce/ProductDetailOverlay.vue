<template>
  <Teleport to="body">
    <Transition name="product-detail-overlay">
      <div
        v-if="isOpen"
        class="product-detail-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`product-detail-title-${product?.id || 'unknown'}`"
        ref="overlayRef"
        @click.self="handleBackdropClick"
      >
        <!-- Close Button -->
        <button
          class="product-detail-overlay__close"
          @click="handleClose"
          aria-label="Close product details"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Scrollable Container -->
        <div class="product-detail-overlay__container" ref="containerRef">
          <div class="product-detail-overlay__content">
            <!-- Left Column: Images -->
            <div class="product-detail-overlay__image-column">
              <div class="product-detail-overlay__images-container">
                <!-- Thumbnails -->
                <div class="product-detail-overlay__thumbnails" v-if="productImages.length > 1">
                  <button
                    v-for="(image, index) in productImages"
                    :key="index"
                    :class="['product-detail-overlay__thumbnail', { 'product-detail-overlay__thumbnail--active': index === selectedImageIndex }]"
                    @click="selectImage(index)"
                    :aria-label="`View image ${index + 1}`"
                    type="button"
                  >
                    <img
                      v-if="image && hasImage"
                      :src="image"
                      :alt="`Thumbnail ${index + 1}`"
                      class="product-detail-overlay__thumbnail-image"
                    />
                    <div
                      v-else
                      class="product-detail-overlay__thumbnail-placeholder"
                      :style="{ backgroundImage: getPlaceholderColor(product?.id || 0, index) }"
                    ></div>
                  </button>
                </div>

                <!-- Main Image -->
                <div class="product-detail-overlay__main-image-wrapper">
                  <Transition name="image-fade">
                    <img
                      v-if="selectedImage && hasImage"
                      :key="selectedImage"
                      :src="selectedImage"
                      :alt="`${product?.name || 'Product'} - Image ${selectedImageIndex + 1}`"
                      class="product-detail-overlay__main-image"
                      @load="handleImageLoad"
                    />
                    <div
                      v-else
                      :key="`placeholder-${selectedImageIndex}`"
                      class="product-detail-overlay__main-image-placeholder"
                      :style="{ backgroundImage: getPlaceholderColor(product?.id || 0, selectedImageIndex) }"
                    ></div>
                  </Transition>
                  <div v-if="imageLoading && hasImage" class="product-detail-overlay__image-loading">
                    <span class="product-detail-overlay__loading-spinner"></span>
                  </div>
                </div>
              </div>

              <!-- Accordion Sections -->
              <div class="product-detail-overlay__accordions">
                <Accordion
                  id="description"
                  label="DESCRIPTION"
                  :default-open="false"
                >
                  <p>{{ productDescription || 'No description available.' }}</p>
                </Accordion>

                <Accordion
                  id="delivery-returns"
                  label="DELIVERY & RETURNS"
                  :default-open="false"
                >
                  <p>Free shipping on orders over €50. Standard delivery takes 3-5 business days. Express delivery available. 30-day return policy. Carbon neutral shipping.</p>
                </Accordion>

                <Accordion
                  id="ingredients"
                  label="INGREDIENTS"
                  :default-open="false"
                >
                  <p>Ingredients information will be displayed here. Please refer to product packaging for complete ingredient list.</p>
                </Accordion>
              </div>
            </div>

            <!-- Right Column: Product Information -->
            <div class="product-detail-overlay__info-column">
              <!-- Title -->
              <h2
                :id="`product-detail-title-${product?.id || 'unknown'}`"
                class="product-detail-overlay__title"
              >
                {{ product?.name || 'Product' }}
              </h2>

              <!-- Meta Info -->
              <div class="product-detail-overlay__meta" v-if="product?.scentFamily || product?.brand">
                <span v-if="product?.scentFamily" class="product-detail-overlay__meta-item">{{ product.scentFamily }}</span>
                <span v-if="product?.brand" class="product-detail-overlay__meta-item">{{ product.brand }}</span>
              </div>

              <!-- Rating -->
              <div class="product-detail-overlay__rating" v-if="productRating > 0">
                <div class="product-detail-overlay__stars" aria-label="Rating: {{ productRating }} out of 5">
                  <span
                    v-for="i in 5"
                    :key="i"
                    :class="['product-detail-overlay__star', { 'product-detail-overlay__star--filled': i <= productRating }]"
                    aria-hidden="true"
                  >
                    ★
                  </span>
                </div>
                <span class="product-detail-overlay__rating-count">({{ reviewCount }})</span>
              </div>

              <!-- Action Buttons Row -->
              <div class="product-detail-overlay__actions">
                <!-- Wishlist Button -->
                <button
                  :class="['product-detail-overlay__action-button', { 'product-detail-overlay__action-button--active': isInWishlist(product?.id) }]"
                  @click="handleWishlistToggle"
                  :aria-label="isInWishlist(product?.id) ? 'Remove from wishlist' : 'Add to wishlist'"
                  :aria-pressed="isInWishlist(product?.id)"
                  type="button"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      :fill="isInWishlist(product?.id) ? 'currentColor' : 'none'"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                <!-- Share Button -->
                <button
                  class="product-detail-overlay__action-button"
                  @click="handleShare"
                  aria-label="Share product"
                  type="button"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
                    <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>

              <!-- Price -->
              <div class="product-detail-overlay__price" v-if="product?.price">
                {{ formatPrice(product.price) }}
              </div>

              <!-- Add to Cart Button -->
              <button
                class="product-detail-overlay__add-to-cart"
                @click="handleAddToCart"
                :disabled="!product?.inStock"
                type="button"
              >
                {{ product?.inStock ? 'ADD TO CART' : 'OUT OF STOCK' }}
              </button>

              <!-- About Product -->
              <div class="product-detail-overlay__about" v-if="productDescription">
                <h3 class="product-detail-overlay__about-title">About Product</h3>
                <p class="product-detail-overlay__about-text">{{ productDescription }}</p>
              </div>

              <!-- Premium Info Bar -->
              <div class="product-detail-overlay__premium-info">
                <div class="product-detail-overlay__premium-item">
                  <span>Free shipping on orders over €50</span>
                </div>
                <div class="product-detail-overlay__premium-item">
                  <span>30 day returns</span>
                </div>
                <div class="product-detail-overlay__premium-item">
                  <span>Carbon neutral Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Product } from '~/components/commerce/ProductCard.vue'
import { useBreakpoint } from '~/composables/useBreakpoint'
import { useCart } from '~/composables/useCart'
import { useWishlist } from '~/composables/useWishlist'
import Accordion from '~/components/ui/Accordion.vue'

interface ProductDetailOverlayProps {
  isOpen: boolean
  product: Product | null
}

const props = defineProps<ProductDetailOverlayProps>()

const emit = defineEmits<{
  close: []
}>()

// Refs
const overlayRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const previousActiveElement = ref<HTMLElement | null>(null)
const selectedImageIndex = ref(0)
const imageLoading = ref(false)

// Composables
const { isMobile, isTablet, isDesktop } = useBreakpoint()
const { addToCart } = useCart()
const { toggleWishlist, isInWishlist } = useWishlist()

// Placeholder colors come nel carosello
const PLACEHOLDER_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
]

const getPlaceholderColor = (productId: string | number, imageIndex: number = 0): string => {
  const idIndex = typeof productId === 'number' ? productId : parseInt(String(productId), 10)
  const colorIndex = (idIndex + imageIndex) % PLACEHOLDER_COLORS.length
  return PLACEHOLDER_COLORS[colorIndex]
}

// Check if product has image
const hasImage = computed(() => {
  return !!props.product?.image
})

// Product images - use product.image or null for placeholder
const productImages = computed(() => {
  if (!props.product) return []
  
  // Generate multiple images for gallery (3 images)
  const imageCount = 3
  return Array.from({ length: imageCount }, (_, i) => 
    props.product?.image 
      ? `${props.product.image}?v=${i}` // Add version param for demo
      : null // null means use placeholder
  )
})

const selectedImage = computed(() => {
  return productImages.value[selectedImageIndex.value] || productImages.value[0]
})

// Product data
const productRating = computed(() => {
  // Mock rating - will be replaced with real data
  return 5
})

const reviewCount = computed(() => {
  // Mock review count - will be replaced with real data
  return 48
})

const productDescription = computed(() => {
  if (!props.product) return ''
  return `A mixture of fragrant essential oils or aroma compounds, fixatives and solvents, used to give the human body, animals, food, objects, and living spaces an agreeable scent.`
})

// Handlers
const handleClose = (): void => {
  emit('close')
}

const handleBackdropClick = (event: MouseEvent): void => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const selectImage = (index: number): void => {
  if (index >= 0 && index < productImages.value.length) {
    if (hasImage.value) {
      imageLoading.value = true
    }
    selectedImageIndex.value = index
  }
}

const handleImageLoad = (): void => {
  imageLoading.value = false
}

const handleAddToCart = (): void => {
  if (props.product && props.product.inStock) {
    addToCart(props.product, 1)
    // Could emit event or show toast notification here
  }
}

const handleWishlistToggle = (): void => {
  if (props.product) {
    toggleWishlist(props.product)
  }
}

const handleShare = async (): Promise<void> => {
  if (typeof navigator !== 'undefined' && navigator.share && props.product) {
    try {
      await navigator.share({
        title: props.product.name || 'Product',
        text: `Check out this product: ${props.product.name}`,
        url: window.location.href
      })
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed')
    }
  } else {
    // Fallback: copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      console.log('Link copied to clipboard')
    }
  }
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
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

// Watch for overlay open/close to manage focus and body scroll
watch(() => props.isOpen, (newValue) => {
  if (typeof document === 'undefined') return
  
  if (newValue) {
    // Save current active element for focus restoration
    previousActiveElement.value = document.activeElement as HTMLElement
    
    // Lock body scroll when overlay opens
    document.body.style.overflow = 'hidden'
    
    // Reset image selection
    selectedImageIndex.value = 0
    if (hasImage.value) {
      imageLoading.value = true
    }
    
    // Focus first focusable element after transition
    nextTick(() => {
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    })
  } else {
    // Unlock body scroll when overlay closes
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
.product-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background-color: var(--color-bg-base);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.product-detail-overlay__close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 10001;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-neutral-surface);
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-primary-ink);
  transition: all 0.2s ease;
}

.product-detail-overlay__close:hover {
  background-color: var(--color-neutral-surface);
  border-color: var(--color-primary-ink);
}

.product-detail-overlay__close:focus-visible {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.product-detail-overlay__container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-xl);
  min-height: 0; /* Allow flex child to shrink below content size */
  max-height: 100vh; /* Ensure it doesn't exceed viewport */
}

.product-detail-overlay__content {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: flex-start;
  min-height: min-content; /* Allow content to determine minimum height */
}

/* Left Column: Images */
.product-detail-overlay__image-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  position: sticky;
  top: var(--spacing-xl);
  align-self: flex-start;
  min-width: 0; /* Prevent overflow */
  /* Content will scroll with parent container, sticky keeps it visible */
}

.product-detail-overlay__images-container {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.product-detail-overlay__main-image-wrapper {
  position: relative;
  flex: 1;
  aspect-ratio: 1 / 1;
  min-width: 0;
  background-color: var(--color-neutral-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-detail-overlay__main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.product-detail-overlay__main-image-placeholder {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: block;
}

.product-detail-overlay__image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-detail-overlay__loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-neutral-surface);
  border-top-color: var(--color-primary-ink);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.product-detail-overlay__thumbnails {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex-shrink: 0;
  align-items: flex-start;
}

.product-detail-overlay__thumbnail {
  width: 100px;
  height: 100px;
  padding: 0;
  background: transparent;
  border: 2px solid var(--color-neutral-surface);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-detail-overlay__thumbnail:hover {
  border-color: var(--color-primary-ink);
}

.product-detail-overlay__thumbnail:focus-visible {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.product-detail-overlay__thumbnail--active {
  border-color: var(--color-primary-ink);
}

.product-detail-overlay__thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.product-detail-overlay__thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: block;
}

/* Right Column: Product Information */
.product-detail-overlay__info-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.product-detail-overlay__title {
  font-family: var(--font-primary);
  font-size: calc(var(--font-size-h1) * 0.9); /* 90% of h1 */
  line-height: var(--line-height-h1);
  color: var(--color-primary-ink);
  margin: 0;
  font-weight: 400;
}

.product-detail-overlay__meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-family: var(--font-secondary);
  font-size: calc(var(--font-size-body) * 0.9); /* 90% of body */
  color: var(--color-primary-ink);
  opacity: 0.7;
}

.product-detail-overlay__meta-item {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.product-detail-overlay__rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.product-detail-overlay__stars {
  display: flex;
  gap: 2px;
}

.product-detail-overlay__star {
  font-size: 16px; /* Reduced from 18px */
  color: var(--color-neutral-surface);
  line-height: 1;
}

.product-detail-overlay__star--filled {
  color: var(--color-primary-ink);
}

.product-detail-overlay__rating-count {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  opacity: 0.7;
}

.product-detail-overlay__actions {
  display: flex;
  gap: var(--spacing-md);
}

.product-detail-overlay__action-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-neutral-surface);
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-primary-ink);
  transition: all 0.2s ease;
  padding: 0;
}

.product-detail-overlay__action-button:hover {
  background-color: var(--color-neutral-surface);
  border-color: var(--color-primary-ink);
}

.product-detail-overlay__action-button:focus-visible {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.product-detail-overlay__action-button--active {
  color: var(--color-accent-rose);
  border-color: var(--color-accent-rose);
}

.product-detail-overlay__price {
  font-family: var(--font-primary);
  font-size: calc(var(--font-size-h2) * 0.9); /* 90% of h2 */
  line-height: var(--line-height-h2);
  color: var(--color-primary-ink);
  font-weight: 400;
}

.product-detail-overlay__add-to-cart {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  font-family: var(--font-secondary);
  font-size: calc(var(--font-size-body) * 0.9); /* 90% of body */
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background-color: var(--color-primary-ink);
  color: var(--color-bg-base);
  border: 1px solid var(--color-primary-ink);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.product-detail-overlay__add-to-cart:hover:not(:disabled) {
  background-color: var(--color-primary-ink-hover);
  border-color: var(--color-primary-ink-hover);
}

.product-detail-overlay__add-to-cart:focus-visible {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.product-detail-overlay__add-to-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-detail-overlay__about {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.product-detail-overlay__about-title {
  font-family: var(--font-primary);
  font-size: calc(var(--font-size-h2) * 0.9); /* 90% of h2 */
  line-height: var(--line-height-h2);
  color: var(--color-primary-ink);
  margin: 0;
  font-weight: 400;
}

.product-detail-overlay__about-text {
  font-family: var(--font-primary);
  font-size: calc(var(--font-size-body) * 0.9); /* 90% of body */
  line-height: var(--line-height-body);
  color: var(--color-primary-ink);
  margin: 0;
}

.product-detail-overlay__premium-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-neutral-surface);
  border-radius: 4px;
}

.product-detail-overlay__premium-item {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-detail-overlay__accordions {
  display: flex;
  flex-direction: column;
  gap: 0; /* Remove gap between accordions */
  margin-top: var(--spacing-lg);
  margin-left: calc(100px + var(--spacing-lg)); /* Thumbnail width + gap */
  /* Width will be constrained by parent container, matching main image width */
  max-width: calc(100% - 100px - var(--spacing-lg)); /* Prevent overflow into right column */
}

/* Reduce spacing in accordion triggers within overlay */
.product-detail-overlay__accordions :deep(.accordion__trigger) {
  padding: var(--spacing-sm) 0; /* Reduced from var(--spacing-md) */
}

/* Transitions */
.product-detail-overlay-enter-active {
  transition: opacity 300ms cubic-bezier(0.33, 0, 0.2, 1);
}

.product-detail-overlay-leave-active {
  transition: opacity 300ms cubic-bezier(0.33, 0, 0.2, 1);
}

.product-detail-overlay-enter-from,
.product-detail-overlay-leave-to {
  opacity: 0;
}

.image-fade-enter-active {
  transition: opacity 0.3s ease;
}

.image-fade-leave-active {
  transition: opacity 0.2s ease;
}

.image-fade-enter-from,
.image-fade-leave-to {
  opacity: 0;
}

/* Responsive: Tablet/Mobile - Single Column */
@media (max-width: 1023px) {
  .product-detail-overlay__content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .product-detail-overlay__image-column {
    position: static;
  }

  .product-detail-overlay__images-container {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .product-detail-overlay__thumbnails {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    gap: var(--spacing-sm);
    padding-bottom: var(--spacing-xs);
  }

  .product-detail-overlay__thumbnail {
    width: 80px;
    height: 80px;
    min-width: 80px;
    flex-shrink: 0;
  }

  .product-detail-overlay__accordions {
    margin-left: 0; /* Reset margin on mobile/tablet */
  }
}

/* Responsive: Mobile */
@media (max-width: 767px) {
  .product-detail-overlay__container {
    padding: var(--spacing-md);
  }

  .product-detail-overlay__content {
    gap: var(--spacing-lg);
  }

  .product-detail-overlay__title {
    font-size: var(--font-size-h2);
  }

  .product-detail-overlay__close {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .product-detail-overlay-enter-active,
  .product-detail-overlay-leave-active,
  .image-fade-enter-active,
  .image-fade-leave-active {
    transition: opacity 200ms ease;
  }
}
</style>

