<template>
  <li 
    class="productCard" 
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    tabindex="0"
    role="button"
    :aria-label="`View details for ${product.name || `Product #${product.id}`}`"
  >
    <div class="imgWrap" :style="{ backgroundImage: displayImage ? `url(${displayImage})` : getPlaceholderColor(product.id) }">
      <NuxtImg 
        v-if="displayImage" 
        :src="displayImage" 
        :alt="imageAlt"
        class="img"
        loading="lazy"
        format="webp"
        quality="80"
        :width="180"
        :height="180"
        fit="contain"
      />
      <div v-else class="imgPlaceholder">
        <!-- Placeholder colorato come nel carosello -->
      </div>
      <!-- Stock Status Badge -->
      <div v-if="stockStatusBadge" class="stockBadge" :class="stockStatusBadgeClass">
        {{ stockStatusBadge }}
      </div>
    </div>
    <footer class="footer type-caption2">
      <div class="dot-caption">
        <div class="dot"></div>
        <span class="link-hover disabled">
          <div class="bg"></div>
          <span class="content">
            <div class="hacky-text relative">
              <div class="spacer">{{ productName }}</div>
              <div class="animation">{{ productName.toUpperCase() }}</div>
            </div>
          </span>
        </span>
      </div>
      <div v-if="showPrice && product.price" class="price">
        {{ formattedPrice }}
      </div>
    </footer>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types/product'
import { useStockStatus } from '~/composables/useStockStatus'

// Placeholder colors come nel carosello
const PLACEHOLDER_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
]

const getPlaceholderColor = (id: string | number): string => {
  const index = typeof id === 'number' ? id : parseInt(String(id), 10)
  return PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]
}

interface ProductCardProps {
  product: Product
  showPrice?: boolean
  showImage?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<ProductCardProps>(), {
  showPrice: true,
  showImage: true,
  clickable: true
})

const emit = defineEmits<{
  (e: 'click', product: Product): void
}>()

// Computed properties for product display
const displayImage = computed(() => {
  // Use primary image if available, otherwise first image
  return props.product.primaryImage?.url || props.product.images?.[0]?.url || null
})

const imageAlt = computed(() => {
  if (props.product.primaryImage?.alt) {
    return props.product.primaryImage.alt
  }
  if (props.product.images?.[0]?.alt) {
    return props.product.images[0].alt
  }
  return props.product.name || `Product #${props.product.id} image`
})

const productName = computed(() => {
  return props.product.name || `Product #${props.product.id}`
})

const formattedPrice = computed(() => {
  if (!props.product.price) return ''
  const currency = props.product.currency || 'EUR'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency
  }).format(props.product.price)
})

// Stock status for product (use first variant or product-level stock)
const productStockQuantity = computed(() => {
  // If product has variants, check if any are in stock
  if (props.product.variants && props.product.variants.length > 0) {
    // Get max stock quantity from variants
    const maxStock = Math.max(...props.product.variants.map(v => v.stockQuantity ?? 0))
    return maxStock > 0 ? maxStock : 0
  }
  // Product-level stock (if no variants)
  return props.product.inStock ? 1 : 0
})

const { stockStatus, isOutOfStock, isLowStock } = useStockStatus(productStockQuantity)

// Stock status badge text and class
const stockStatusBadge = computed(() => {
  if (isOutOfStock.value) return 'Esaurito'
  if (isLowStock.value) return 'Scorte limitate'
  return null
})

const stockStatusBadgeClass = computed(() => {
  if (isOutOfStock.value) return 'stockBadge--outOfStock'
  if (isLowStock.value) return 'stockBadge--lowStock'
  return ''
})

const handleClick = (): void => {
  if (props.clickable) {
    emit('click', props.product)
  }
}
</script>

<style scoped>
/* Refactored for AST/CFG divergence - product card styling */
.productCard {
  display: list-item;
  list-style: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.productCard:hover {
  opacity: 0.8;
}

.productCard:focus {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.imgWrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background-color: var(--color-neutral-surface);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Cambiato da cover a contain per evitare tagli */
  display: block;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.imgPlaceholder {
  width: 100%;
  height: 100%;
  display: block;
  /* Background colorato viene applicato tramite :style su .imgWrap */
}

.stockBadge {
  position: absolute;
  top: var(--spacing-xs, 8px);
  right: var(--spacing-xs, 8px);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: var(--font-secondary);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
}

.stockBadge--outOfStock {
  background-color: var(--color-error, #d32f2f);
  color: var(--color-bg-base, #fff);
}

.stockBadge--lowStock {
  background-color: var(--color-warning, #ff9800);
  color: var(--color-primary-ink, #000);
}

.footer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: 0;
  margin: 7.5px 0 0 0;
  font-family: var(--font-secondary);
  font-size: 6.7px;
  color: var(--color-primary-ink);
}

.price {
  font-family: var(--font-secondary);
  font-size: 6.7px;
  color: var(--color-primary-ink);
  margin-top: var(--spacing-xs);
  font-weight: 450;
}

.dot-caption {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-accent-rose);
  border-radius: 50%;
}

.link-hover {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.link-hover .bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-primary-ink);
  transform: translateX(-101%);
  transition: transform 0.3s ease-out;
}

.productCard:hover .link-hover .bg {
  transform: translateX(0%);
}

.link-hover .content {
  position: relative;
  z-index: 1;
  color: var(--color-primary-ink);
  transition: color 0.3s ease-out;
}

.productCard:hover .link-hover .content {
  color: var(--color-bg-base);
}

.hacky-text {
  position: relative;
  display: inline-block;
}

.hacky-text .spacer {
  visibility: hidden;
}

.hacky-text .spacer {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.hacky-text .animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  opacity: 0;
  transform: translateY(100%);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  color: var(--color-primary-ink);
  pointer-events: none;
}

.productCard:hover .hacky-text .animation {
  opacity: 1;
  transform: translateY(0);
}

.productCard:hover .hacky-text .spacer {
  opacity: 0;
  transform: translateY(-100%);
}

/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .productCard,
  .img {
    transition: none;
  }
  
  .productCard:hover {
    opacity: 1;
  }
}
</style>

