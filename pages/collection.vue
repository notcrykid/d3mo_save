<template>
  <HomePageLayout 
    :center-nav-items="centerNavItems"
    @sign-in-click="handleSignInClick"
    @nav-click="handleNavClick"
  >
    <!-- Barra separatrice fissa tra top navigation e gallery -->
    <div class="gallery-separator"></div>
    
    <div class="productCatalog isInteractive">
      <div class="frame-container-first over-only">
        <div class="filterPanel"></div>
        <div class="contentArea">
          <div class="productGrid type-gallery">
            <!-- Mobile Header -->
            <header class="mobileHeader">
              <div class="mobileHeader__filter" @click="toggleFilterMobile" :disabled="false">
                Filter
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="11" fill="none" class="mobileHeader__iconFilter">
                  <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" d="M6.812 2.504H.797m11.028 0H8.817M2.802 8.018H.797m11.203 0H5.504m-.001 1.503V6.514M8.817 1v3.008"></path>
                </svg>
              </div>
            </header>

            <!-- Desktop Header -->
            <header class="header">
              <div class="totalResult">{{ filteredProducts.length }} products</div>
              <ul class="activeFilters">
                <FilterChips
                  v-if="activeFiltersList.length > 0"
                  :active-filters="activeFiltersList"
                  @remove="handleFilterRemove"
                  @clear-all="handleClearAllFilters"
                />
              </ul>
            </header>

            <!-- Loading State -->
            <ul v-if="productsPending" class="list">
              <ProductCardSkeleton
                v-for="n in 10"
                :key="`skeleton-${n}`"
              />
            </ul>

            <!-- Error State -->
            <div v-else-if="productsError" class="errorState">
              <p class="errorText">Error loading products: {{ productsError.message }}</p>
              <button @click="refreshProducts" class="errorButton">Retry</button>
            </div>

            <!-- Product Grid -->
            <ul v-else class="list">
              <ProductCard
                v-for="product in filteredProducts"
                :key="product.id"
                :product="product"
                @click="handleProductClick"
                @click.prevent
              />
            </ul>
          </div>
        </div>
      </div>

      <!-- Filters Sidebar (outside frame-container-first) -->
      <ProductFilters
        v-model="filters"
        :products="allProducts"
        :is-open="isFilterOpen"
        @close="closeFilter"
        @clear-all="handleClearAllFilters"
        @search-by-id="handleSearchById"
        class="filterSidebar visible"
      />

      <!-- Product Detail Overlay -->
      <ProductDetailOverlay
        :is-open="isProductDetailOpen"
        :product="selectedProduct"
        @close="closeProductDetail"
      />

    </div>
  </HomePageLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import HomePageLayout from '~/components/HomePageLayout.vue'
import ProductCard from '~/components/commerce/ProductCard.vue'
import ProductCardSkeleton from '~/components/commerce/ProductCardSkeleton.vue'
import ProductFilters, { type FilterState } from '~/components/commerce/ProductFilters.vue'
import FilterChips, { type ActiveFilter } from '~/components/commerce/FilterChips.vue'
import ProductDetailOverlay from '~/components/commerce/ProductDetailOverlay.vue'
import { useBreakpoint } from '~/composables/useBreakpoint'
import { useProductFiltering } from '~/composables/useProductFiltering'
import { useProducts } from '~/composables/useProducts'
import type { Product } from '~/types/product'

definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'Product Gallery - d3mo',
  description: 'Browse our complete collection of luxury fragrances and beauty products.'
})

// Center navigation items
const centerNavItems = [
  { label: 'Collection', href: '/collection' },
  { label: 'Wishlist', href: '/wishlist' }
]

const handleSignInClick = () => {
  // Placeholder for sign in click handler
  console.log('Sign in clicked')
}

const handleNavClick = async (item: { label: string; href: string; action?: () => void }) => {
  const href = item.href

  if (href?.startsWith('#') && typeof document !== 'undefined') {
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
    return
  }

  if (href) {
    await navigateTo(href)
  }

  if (item.action) {
    item.action()
  }
}

const { isMobile, isTablet, isDesktop } = useBreakpoint()

// Fetch products from CMS using useProducts composable
const { products, pending: productsPending, error: productsError, refresh: refreshProducts } = useProducts({
  page: 1,
  pageSize: 100, // Fetch enough products for filtering
  locale: 'it' // Default to Italian, can be made dynamic later
})

// Use products from composable, fallback to empty array
const allProducts = computed(() => products.value || [])

// Filter state
const filters = ref<FilterState>({
  priceRange: undefined
})

// Use composable for Set-based filtering (behavioral divergence from sequential filter())
const { filteredProducts, minPrice, maxPrice } = useProductFiltering(allProducts, filters)

// Initialize filters with default price range
if (!filters.value.priceRange) {
  filters.value.priceRange = [minPrice.value, maxPrice.value]
}

// Responsive grid classes
const gridClasses = computed(() => {
  return {
    'gallery-page__grid--mobile': isMobile.value,
    'gallery-page__grid--tablet': isTablet.value,
    'gallery-page__grid--desktop': isDesktop.value
  }
})

// Active filters list for FilterChips component
const activeFiltersList = computed<ActiveFilter[]>(() => {
  const active: ActiveFilter[] = []
  const f = filters.value

  // Search ID filter
  if (f.searchId && f.searchId.trim() !== '') {
    active.push({ type: 'searchId', label: `ID: ${f.searchId}`, value: f.searchId })
  }

  if (f.category && f.category.length > 0) {
    f.category.forEach(cat => {
      active.push({ type: 'category', label: cat, value: cat })
    })
  }

  if (f.priceRange && (f.priceRange[0] !== minPrice.value || f.priceRange[1] !== maxPrice.value)) {
    active.push({ 
      type: 'priceRange', 
      label: `$${f.priceRange[0]} - $${f.priceRange[1]}`, 
      value: f.priceRange 
    })
  }

  if (f.scentFamily && f.scentFamily.length > 0) {
    f.scentFamily.forEach(family => {
      active.push({ type: 'scentFamily', label: family, value: family })
    })
  }

  if (f.brand && f.brand.length > 0) {
    f.brand.forEach(brand => {
      active.push({ type: 'brand', label: brand, value: brand })
    })
  }

  if (f.newArrivals === true) {
    active.push({ type: 'newArrivals', label: 'New Arrivals', value: true })
  }

  if (f.inStock === true) {
    active.push({ type: 'inStock', label: 'In Stock', value: true })
  }

  return active
})

const handleFilterRemove = (filter: ActiveFilter): void => {
  const f = { ...filters.value }

  switch (filter.type) {
    case 'searchId':
      f.searchId = undefined
      break
    case 'category':
      f.category = f.category?.filter(c => c !== filter.value) || undefined
      if (f.category && f.category.length === 0) f.category = undefined
      break
    case 'priceRange':
      f.priceRange = [minPrice.value, maxPrice.value]
      break
    case 'scentFamily':
      f.scentFamily = f.scentFamily?.filter(s => s !== filter.value) || undefined
      if (f.scentFamily && f.scentFamily.length === 0) f.scentFamily = undefined
      break
    case 'brand':
      f.brand = f.brand?.filter(b => b !== filter.value) || undefined
      if (f.brand && f.brand.length === 0) f.brand = undefined
      break
    case 'newArrivals':
      f.newArrivals = undefined
      break
    case 'inStock':
      f.inStock = undefined
      break
  }

  filters.value = f
}

const handleClearAllFilters = (): void => {
  filters.value = {
    priceRange: [minPrice.value, maxPrice.value],
    searchId: undefined
  }
}

const handleSearchById = (id: string | undefined): void => {
  filters.value.searchId = id
}

// Product Detail Overlay state
const isProductDetailOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

// Product click handler - opens Product Detail Overlay
const handleProductClick = (product: Product): void => {
  selectedProduct.value = product
  isProductDetailOpen.value = true
}

const closeProductDetail = (): void => {
  isProductDetailOpen.value = false
  // Keep selectedProduct for smooth transition, clear after animation
  setTimeout(() => {
    if (!isProductDetailOpen.value) {
      selectedProduct.value = null
    }
  }, 300)
}

// Mobile filter toggle
const isFilterOpen = ref(false)

const toggleFilterMobile = (): void => {
  isFilterOpen.value = !isFilterOpen.value
}

const closeFilter = (): void => {
  isFilterOpen.value = false
}
</script>

<style scoped>
/* Barra separatrice fissa tra top navigation e gallery */
.gallery-separator {
  position: fixed;
  top: 68px; /* Top navigation height */
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 99; /* Below top navigation (100) but above content (10) */
  pointer-events: none; /* Non interferisce con i click */
}

/* Refactored for AST/CFG divergence - product catalog container */
.productCatalog {
  width: 100%;
  min-height: calc(100vh - 68px); /* Viewport height minus top navigation height */
  position: relative;
  margin: 0;
  padding: 0;
  margin-top: 68px; /* Start below top navigation */
}

.frame-container-first {
  width: 100%;
  height: calc(100vh - 68px); /* Viewport height minus top navigation height */
  position: relative;
  display: flex;
  flex-direction: row;
  padding-left: 0; /* Rimossi padding per allineare a sinistra */
  overflow: hidden;
  margin-top: 0; /* No margin, already accounted in .theGallery */
  background-color: var(--color-bg-base, rgb(255, 255, 255)); /* Stesso background del filtro */
}

/* Filter panel - handled by ProductFilters component */

.contentArea {
  flex: 1 1 0%;
  padding: 0;
  min-width: 0;
  margin-left: 334.25px; /* Space for filter width: 334.25px */
  height: calc(100vh - 68px); /* Viewport height minus top navigation height */
  overflow-y: auto;
  overflow-x: hidden;
  background-color: transparent; /* Trasparente per integrazione fluida con frame-container */
}

.productGrid {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  background-color: transparent; /* Trasparente per integrazione fluida */
}

/* Mobile Header */
.mobileHeader {
  display: none;
  padding: var(--spacing-md);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: var(--spacing-lg);
}

.mobileHeader__filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-secondary);
  font-size: var(--font-size-body);
  color: var(--color-primary-ink);
  cursor: pointer;
  background: none;
  border: none;
  padding: var(--spacing-sm);
}

.mobileHeader__iconFilter {
  width: 13px;
  height: 11px;
}

/* Desktop Header */
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 7.5px 22px;
  margin: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: transparent; /* Trasparente per integrazione fluida */
}

.totalResult {
  font-family: var(--font-secondary);
  font-size: 8.2px;
  color: var(--color-primary-ink);
  font-weight: 450;
  line-height: 1;
}

.activeFilters {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Product Grid List */
.list {
  display: grid;
  grid-template-columns: repeat(5, 180px); /* Aumentato da 160px a 180px per immagini più grandi */
  gap: 26.25px;
  list-style: none;
  padding: 26.25px;
  margin: 0;
  width: 100%;
  justify-content: start;
  background-color: transparent; /* Trasparente per integrazione fluida */
  max-width: 100%; /* Assicura che non vada oltre il container */
}

/* Responsive grid columns */
@media (max-width: 767px) {
  .list {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }

  .mobileHeader {
    display: block;
  }

  .header {
    display: none;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .list {
    grid-template-columns: repeat(3, 180px); /* Aumentato da 160px a 180px per tablet */
    gap: 26.25px;
    padding: 26.25px;
  }
}

@media (min-width: 1024px) {
  .list {
    grid-template-columns: repeat(5, 180px); /* Aumentato da 160px a 180px per desktop */
    gap: 26.25px;
    padding: 26.25px;
  }
}

/* Loading and Error States */
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
</style>

