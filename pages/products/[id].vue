<template>
  <div class="productDetailPage">
    <!-- Loading State -->
    <div v-if="pending" class="loadingState">
      <div class="loadingSpinner"></div>
      <p class="loadingText">Loading product...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="errorState">
      <p class="errorText">Error loading product: {{ error.message }}</p>
      <button @click="refresh" class="errorButton">Retry</button>
    </div>

    <!-- Product Content -->
    <div v-else-if="productData" class="productContent">
      <!-- Product Images -->
      <div class="productImages">
        <div v-if="productData.primaryImage" class="primaryImage">
          <NuxtImg
            :src="productData.primaryImage.url"
            :alt="productData.primaryImage.alt || productData.name"
            :width="600"
            :height="600"
            format="webp"
            quality="90"
            fit="contain"
            loading="eager"
            class="mainImage"
          />
        </div>
        <div v-else-if="productData.images && productData.images.length > 0" class="primaryImage">
          <NuxtImg
            :src="productData.images[0].url"
            :alt="productData.images[0].alt || productData.name"
            :width="600"
            :height="600"
            format="webp"
            quality="90"
            fit="contain"
            loading="eager"
            class="mainImage"
          />
        </div>
        
        <!-- Image Gallery -->
        <div v-if="productData.images && productData.images.length > 1" class="imageGallery">
          <NuxtImg
            v-for="(image, index) in productData.images.slice(1)"
            :key="image.id"
            :src="image.url"
            :alt="image.alt || `${productData.name} - Image ${index + 2}`"
            :width="120"
            :height="120"
            format="webp"
            quality="80"
            fit="contain"
            loading="lazy"
            class="galleryImage"
            @click="selectedImage = image"
          />
        </div>
      </div>

      <!-- Product Information -->
      <div class="productInfo">
        <h1 class="productName">{{ productData.name }}</h1>
        
        <div v-if="productData.description" class="productDescription">
          <p>{{ productData.description }}</p>
        </div>

        <div class="productPrice">
          <span class="priceLabel">Price:</span>
          <span class="priceValue">{{ formattedPrice }}</span>
        </div>

        <!-- Product Variants -->
        <div v-if="productData.variants && productData.variants.length > 0" class="productVariants">
          <h3 class="variantsTitle">Variants</h3>
          <div class="variantsList">
            <div
              v-for="variant in productData.variants"
              :key="variant.id"
              class="variantItem"
              :class="{ 'variantItem--outOfStock': variant.stockStatus === 'out_of_stock' }"
            >
              <span class="variantType">{{ variant.type }}:</span>
              <span class="variantValue">{{ variant.value }}</span>
              <span v-if="variant.price" class="variantPrice">
                {{ formatPrice(variant.price, variant.currency || productData.currency) }}
              </span>
              <div class="variantStockInfo">
                <span 
                  v-if="variant.stockStatus" 
                  class="variantStockBadge" 
                  :class="`variantStockBadge--${variant.stockStatus}`"
                >
                  {{ getStockStatusLabel(variant.stockStatus) }}
                </span>
                <span v-if="variant.stockQuantity !== undefined && variant.stockQuantity !== null" class="variantStockQuantity">
                  ({{ variant.stockQuantity }} disponibili)
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="productDetails">
          <div v-if="productData.category" class="detailItem">
            <span class="detailLabel">Category:</span>
            <span class="detailValue">{{ productData.category.name }}</span>
          </div>
          <div v-if="productData.brand" class="detailItem">
            <span class="detailLabel">Brand:</span>
            <span class="detailValue">{{ productData.brand }}</span>
          </div>
          <div v-if="productData.sku" class="detailItem">
            <span class="detailLabel">SKU:</span>
            <span class="detailValue">{{ productData.sku }}</span>
          </div>
          <div v-if="productData.inStock !== undefined" class="detailItem">
            <span class="detailLabel">Availability:</span>
            <span class="detailValue" :class="{ 'inStock': productData.inStock, 'outOfStock': !productData.inStock }">
              {{ productData.inStock ? 'In Stock' : 'Out of Stock' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProduct } from '~/composables/useProduct'
import { useStockStatus } from '~/composables/useStockStatus'
import type { Product } from '~/types/product'

const route = useRoute()
const productId = computed(() => route.params.id as string)

// Fetch product data
const { product, pending, error, refresh } = useProduct(productId.value, {
  locale: 'it' // Default to Italian, can be made dynamic later
})

const productData = computed(() => product.value)

// Format price
const formattedPrice = computed(() => {
  if (!productData.value?.price) return ''
  return formatPrice(productData.value.price, productData.value.currency || 'EUR')
})

function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency
  }).format(price)
}

// Stock status label helper
function getStockStatusLabel(status: string): string {
  switch (status) {
    case 'out_of_stock':
      return 'Esaurito'
    case 'low_stock':
      return 'Scorte limitate'
    case 'in_stock':
      return 'Disponibile'
    default:
      return ''
  }
}

// Selected image for gallery
const selectedImage = ref<Product['images'] extends Array<infer U> ? U : never | null>(null)

// SEO
useSeoMeta({
  title: productData.value ? `${productData.value.name} - d3mo` : 'Product - d3mo',
  description: productData.value?.description || 'Product details',
  ogImage: productData.value?.primaryImage?.url || productData.value?.images?.[0]?.url
})
</script>

<style scoped>
.productDetailPage {
  min-height: calc(100vh - 68px);
  padding: var(--spacing-xl, 40px);
  margin-top: 68px;
}

.loadingState,
.errorState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 40px);
  min-height: 400px;
  text-align: center;
}

.loadingSpinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-neutral-surface, #f5f5f5);
  border-top-color: var(--color-primary-ink, #000);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md, 20px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loadingText,
.errorText {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
  margin: 0;
}

.errorButton {
  margin-top: var(--spacing-md, 20px);
  padding: var(--spacing-sm, 10px) var(--spacing-md, 20px);
  background-color: var(--color-primary-ink, #000);
  color: var(--color-bg-base, #fff);
  border: none;
  cursor: pointer;
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  transition: opacity 0.2s ease;
}

.errorButton:hover {
  opacity: 0.8;
}

.productContent {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl, 40px);
  max-width: 1200px;
  margin: 0 auto;
}

.productImages {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 20px);
}

.primaryImage {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: var(--color-neutral-surface, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mainImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.imageGallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-sm, 10px);
}

.galleryImage {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s ease;
  background-color: var(--color-neutral-surface, #f5f5f5);
}

.galleryImage:hover {
  opacity: 0.8;
}

.productInfo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 30px);
}

.productName {
  font-family: var(--font-primary);
  font-size: var(--font-size-h1, 32px);
  color: var(--color-primary-ink, #000);
  margin: 0;
}

.productDescription {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
  line-height: 1.6;
}

.productPrice {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm, 10px);
}

.priceLabel {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
}

.priceValue {
  font-family: var(--font-primary);
  font-size: var(--font-size-h2, 24px);
  color: var(--color-primary-ink, #000);
  font-weight: 700;
}

.productVariants {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 20px);
}

.variantsTitle {
  font-family: var(--font-secondary);
  font-size: var(--font-size-h3, 18px);
  color: var(--color-primary-ink, #000);
  margin: 0;
}

.variantsList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 10px);
}

.variantItem {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 10px);
  padding: var(--spacing-sm, 10px);
  border: 1px solid var(--color-neutral-surface, #f5f5f5);
}

.variantType {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
  font-weight: 500;
  text-transform: capitalize;
}

.variantValue {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
}

.variantPrice {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
  margin-left: auto;
}

.variantItem--outOfStock {
  opacity: 0.6;
  pointer-events: none;
}

.variantStockInfo {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  margin-left: auto;
}

.variantStockBadge {
  padding: 4px 8px;
  border-radius: 4px;
  font-family: var(--font-secondary);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.variantStockBadge--out_of_stock {
  background-color: var(--color-error, #d32f2f);
  color: var(--color-bg-base, #fff);
}

.variantStockBadge--low_stock {
  background-color: var(--color-warning, #ff9800);
  color: var(--color-primary-ink, #000);
}

.variantStockBadge--in_stock {
  background-color: var(--color-success, #2e7d32);
  color: var(--color-bg-base, #fff);
}

.variantStockQuantity {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
  font-style: italic;
}

.productDetails {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 10px);
}

.detailItem {
  display: flex;
  gap: var(--spacing-sm, 10px);
}

.detailLabel {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
  font-weight: 500;
}

.detailValue {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body, 14px);
  color: var(--color-primary-ink, #000);
}

.detailValue.inStock {
  color: var(--color-success, #2e7d32);
}

.detailValue.outOfStock {
  color: var(--color-error, #d32f2f);
}

/* Responsive */
@media (max-width: 767px) {
  .productContent {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg, 30px);
  }
}
</style>

