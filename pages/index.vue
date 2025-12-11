<template>
  <HomePageLayout 
    :center-nav-items="centerNavItems"
    @sign-in-click="handleSignInClick"
    @nav-click="handleNavClick"
  >
    <!-- Sezione Intro (Hero) -->
    <section class="homeLanding homeSection" id="intro">
      <div class="homeLanding__inner sectionInner">
        <div class="home-content">
          <div class="content-placeholder">
            <h1 class="content-title">Welcome to d3mo</h1>
            <p class="content-description">Experience luxury fragrances</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sezione Best Seller (Collection Gallery con Carosello) -->
    <section class="homeCollectionGallery homeSection darkTheme" id="collection">
      <div class="homeCollectionGallery__inner sectionInner">
        <div class="collection-container">
          <h2 class="collection-title">Best Seller</h2>
          <!-- Componente Carosello -->
          <CentralSpawnCarousel 
            v-if="leftProducts.length > 0 || rightProducts.length > 0"
            :left-items="leftProducts"
            :right-items="rightProducts"
            :auto-play="true"
            @select="handleProductSelect"
          />
          <div v-else class="collection-carousel-placeholder">
            <p class="collection-placeholder-text">Carosello Best Seller - caricamento prodotti...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sezione Footer -->
    <section class="homeFooter homeSection" id="footer">
      <div class="homeFooter__inner sectionInner">
        <div class="footer-content">
          <p class="footer-placeholder-text">Footer section - Coming soon</p>
        </div>
      </div>
    </section>

    <!-- Product Detail Overlay -->
    <ProductDetailOverlay
      :is-open="isProductDetailOpen"
      :product="selectedProduct"
      @close="closeProductDetail"
    />
  </HomePageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CentralSpawnCarousel from '~/components/motion/CentralSpawnCarousel.vue'
import ProductDetailOverlay from '~/components/commerce/ProductDetailOverlay.vue'
import type { Product } from '~/components/commerce/ProductCard.vue'

// Use HomePageLayout instead of default layout
definePageMeta({
  layout: false
})

useSeoMeta({
  title: 'd3mo - Luxury Fragrance & Beauty E-commerce',
  description: 'Discover luxury fragrances and beauty products with an immersive, cinematic shopping experience.'
})

// Center navigation items - Homepage sections
// These are scroll anchors to homepage sections, not separate pages
const centerNavItems = [
  { label: 'Intro', href: '#intro' },
  { label: 'Best Seller', href: '#collection' },
  { label: 'Footer', href: '#footer' }
]

const handleSignInClick = () => {
  // Placeholder for sign in click handler
  // Will be implemented in Epic 6 (Customer Accounts & Authentication)
  console.log('Sign in clicked')
}

const handleNavClick = async (item: { label: string; href: string; action?: () => void }) => {
  const href = item.href

  // Scroll anchors on the homepage
  if (href?.startsWith('#') && typeof document !== 'undefined') {
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
    return
  }

  // Internal routes (e.g. /collection)
  if (href) {
    await navigateTo(href)
  }

  if (item.action) {
    item.action()
  }
}

// Mock product data - placeholder (no external assets)
// Lato sinistro
const leftProducts = ref([
  { id: 'left-1', name: 'Product A1' },
  { id: 'left-2', name: 'Product A2' },
  { id: 'left-3', name: 'Product A3' },
  { id: 'left-4', name: 'Product A4' },
  { id: 'left-5', name: 'Product A5' },
  { id: 'left-6', name: 'Product A6' }
])

// Lato destro
const rightProducts = ref([
  { id: 'right-1', name: 'Product B1' },
  { id: 'right-2', name: 'Product B2' },
  { id: 'right-3', name: 'Product B3' },
  { id: 'right-4', name: 'Product B4' },
  { id: 'right-5', name: 'Product B5' },
  { id: 'right-6', name: 'Product B6' }
])

// Product Detail Overlay state
const isProductDetailOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

// Handler per selezione prodotto - apre Product Detail Overlay
const handleProductSelect = (item: Product) => {
  selectedProduct.value = item
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
</script>

<style scoped>
/* Sezione Hero (homeLanding) */
.homeLanding {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl) var(--spacing-lg);
}

.homeLanding__inner {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.sectionInner {
  width: 100%;
  height: 100%;
}

.home-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.content-placeholder {
  text-align: center;
  color: var(--color-primary-ink);
}

.content-title {
  font-family: var(--font-primary);
  font-size: var(--font-size-h1);
  color: var(--color-primary-ink);
  margin: 0 0 var(--spacing-lg) 0;
  line-height: var(--line-height-h1);
}

.content-description {
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
  color: var(--color-primary-ink);
  opacity: 0.8;
  margin: 0;
  line-height: var(--line-height-body);
}

/* Sezione Collection Gallery (homeCollectionGallery) */
.homeCollectionGallery {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl) var(--spacing-lg);
  background-color: transparent; /* Mantiene il background trasparente per vedere il canvas */
}

.homeCollectionGallery__inner {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.collection-container {
  width: 100%;
}

.collection-title {
  font-family: var(--font-primary);
  font-size: var(--font-size-h2);
  color: var(--color-primary-ink);
  text-align: center;
  margin: 0 0 var(--spacing-xxl) 0;
  line-height: var(--line-height-h2);
}

.collection-carousel-placeholder {
  width: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--color-border-subtle);
  border-radius: 8px;
  background-color: rgba(252, 252, 252, 0.5);
}

.collection-placeholder-text {
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
  color: var(--color-text-muted);
  text-align: center;
}

/* Classe homeSection comune */
.homeSection {
  position: relative;
  z-index: 10;
}

/* Sezione Footer */
.homeFooter {
  position: relative;
  width: 100%;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl) var(--spacing-lg);
  background-color: var(--color-bg-invert, #2E2E2E);
}

.homeFooter__inner {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.footer-content {
  text-align: center;
}

.footer-placeholder-text {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-text-on-dark, #FCFCFC);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 767px) {
  .homeLanding,
  .homeCollectionGallery {
    padding: var(--spacing-xl) var(--spacing-md);
    min-height: auto;
  }

  .collection-title {
    font-size: var(--font-size-h3);
    margin-bottom: var(--spacing-xl);
  }

  .collection-carousel-placeholder {
    min-height: 400px;
  }
}
</style>

