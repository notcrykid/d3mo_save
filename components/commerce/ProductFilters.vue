<template>
  <div 
    v-if="isOpen || !isMobile" 
    class="filterSidebar" 
    :class="{ visible: isOpen || !isMobile }"
  >
    <div class="inner">
      <button 
        class="btn-close btnClose" 
        @click="handleClose"
        type="button"
        aria-label="Close filters"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.82 12.28" class="icon-close no-pointer">
          <path d="M12.82 12.16 8.34 7.91M0 0l4.56 4.32" class="stroke"></path>
          <path d="M.34 12.28 12.54.22" class="stroke2"></path>
        </svg>
      </button>

      <h3 class="title type-h2">Filters</h3>

      <!-- Search by ID -->
      <form class="galleryFilterSearch type-gallery search">
        <div class="btnOutline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 1888 1158" class="svgBase" width="1888px" height="1158px">
            <path d="M 0 4 Q 0 0, 5 0L 1884 0 Q 1888 0, 1888 4L 1888 1144 Q 1888 1145, 1886 1148L 1880 1154 Q 1877 1157, 1874 1158L 4 1158 Q 0 1158, 0 1154L 0 4" class="path"></path>
          </svg>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 13 13" class="searchIcon">
          <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" d="M5.75 11A5.25 5.25 0 1 0 .5 5.75 5.25 5.25 0 0 0 5.75 11Zm3.71-1.54 3 3"></path>
        </svg>
        <input 
          class="input" 
          type="text" 
          placeholder="Search by ID..."
          v-model="searchId"
          @input="handleSearchIdChange"
        />
      </form>

      <div class="filterOptionsList" role="list">
        <!-- Category Filter -->
        <div class="filterGroup type-gallery" role="listitem">
          <header class="filterGroupHeader" @click="toggleTrait('category')">
            <h3>Category</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="plus plusIcon" 
              viewBox="0 0 10 10"
              :class="{ rotated: expandedTraits.category }"
            >
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M5 0v10" class="vertical"></path>
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M10 5H0" class="horizontal"></path>
            </svg>
          </header>
          <div v-if="expandedTraits.category" class="filterOptionsList" role="list">
            <div 
              v-for="category in availableCategories" 
              :key="category"
              class="filterOption"
              role="listitem"
            >
              <div 
                class="filterToggle" 
                :class="{ active: modelValue.category?.includes(category) }"
                @click="handleCategoryChange(category, $event)"
                role="checkbox"
                :aria-checked="modelValue.category?.includes(category) || false"
              ></div>
              <span class="name">{{ category }}</span>
              <span class="count">({{ getCategoryCount(category) }})</span>
            </div>
          </div>
        </div>

        <!-- Price Range Filter -->
        <div class="filterGroup type-gallery" role="listitem">
          <header class="filterGroupHeader" @click="toggleTrait('priceRange')">
            <h3>Price Range</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="plus plusIcon" 
              viewBox="0 0 10 10"
              :class="{ rotated: expandedTraits.priceRange }"
            >
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M5 0v10" class="vertical"></path>
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M10 5H0" class="horizontal"></path>
            </svg>
          </header>
          <div v-if="expandedTraits.priceRange" class="priceRangeContent">
            <div class="priceRangeInputs">
              <label class="priceRangeLabel">
                <span class="priceRangeLabelText">Min</span>
                <input
                  type="number"
                  :min="minPrice"
                  :max="maxPrice"
                  :value="modelValue.priceRange?.[0] ?? minPrice"
                  @input="handlePriceMinChange($event)"
                  class="priceRangeInput"
                  aria-label="Minimum price"
                />
              </label>
              <label class="priceRangeLabel">
                <span class="priceRangeLabelText">Max</span>
                <input
                  type="number"
                  :min="minPrice"
                  :max="maxPrice"
                  :value="modelValue.priceRange?.[1] ?? maxPrice"
                  @input="handlePriceMaxChange($event)"
                  class="priceRangeInput"
                  aria-label="Maximum price"
                />
              </label>
            </div>
            <div class="priceRangeDisplay">
              ${{ modelValue.priceRange?.[0] ?? minPrice }} - ${{ modelValue.priceRange?.[1] ?? maxPrice }}
            </div>
          </div>
        </div>

        <!-- Scent Family Filter -->
        <div class="filterGroup type-gallery" role="listitem">
          <header class="filterGroupHeader" @click="toggleTrait('scentFamily')">
            <h3>Scent Family</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="plus plusIcon" 
              viewBox="0 0 10 10"
              :class="{ rotated: expandedTraits.scentFamily }"
            >
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M5 0v10" class="vertical"></path>
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M10 5H0" class="horizontal"></path>
            </svg>
          </header>
          <div v-if="expandedTraits.scentFamily" class="filterOptionsList" role="list">
            <div 
              v-for="family in availableScentFamilies" 
              :key="family"
              class="filterOption"
              role="listitem"
            >
              <div 
                class="filterToggle" 
                :class="{ active: modelValue.scentFamily?.includes(family) }"
                @click="handleScentFamilyChange(family, $event)"
                role="checkbox"
                :aria-checked="modelValue.scentFamily?.includes(family) || false"
              ></div>
              <span class="name">{{ family }}</span>
              <span class="count">({{ getScentFamilyCount(family) }})</span>
            </div>
          </div>
        </div>

        <!-- Brand Filter -->
        <div class="filterGroup type-gallery" role="listitem">
          <header class="filterGroupHeader" @click="toggleTrait('brand')">
            <h3>Brand</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="plus plusIcon" 
              viewBox="0 0 10 10"
              :class="{ rotated: expandedTraits.brand }"
            >
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M5 0v10" class="vertical"></path>
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M10 5H0" class="horizontal"></path>
            </svg>
          </header>
          <div v-if="expandedTraits.brand" class="filterOptionsList" role="list">
            <div class="filterOption" role="listitem">
              <div 
                class="filterToggle" 
                :class="{ active: modelValue.brand?.includes('niche') }"
                @click="handleBrandChange('niche', $event)"
                role="checkbox"
                :aria-checked="modelValue.brand?.includes('niche') || false"
              ></div>
              <span class="name">Niche</span>
              <span class="count">({{ getBrandCount('niche') }})</span>
            </div>
            <div class="filterOption" role="listitem">
              <div 
                class="filterToggle" 
                :class="{ active: modelValue.brand?.includes('commercial') }"
                @click="handleBrandChange('commercial', $event)"
                role="checkbox"
                :aria-checked="modelValue.brand?.includes('commercial') || false"
              ></div>
              <span class="name">Commercial</span>
              <span class="count">({{ getBrandCount('commercial') }})</span>
            </div>
          </div>
        </div>

        <!-- New Arrivals Toggle -->
        <div class="filterGroup type-gallery" role="listitem">
          <header class="filterGroupHeader" @click="toggleTrait('newArrivals')">
            <h3>New Arrivals</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="plus plusIcon" 
              viewBox="0 0 10 10"
              :class="{ rotated: expandedTraits.newArrivals }"
            >
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M5 0v10" class="vertical"></path>
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M10 5H0" class="horizontal"></path>
            </svg>
          </header>
          <div v-if="expandedTraits.newArrivals" class="filterOptionsList" role="list">
            <div class="filterOption" role="listitem">
              <div 
                class="filterToggle" 
                :class="{ active: modelValue.newArrivals === true }"
                @click="handleNewArrivalsChange($event)"
                role="checkbox"
                :aria-checked="modelValue.newArrivals === true || false"
              ></div>
              <span class="name">New Arrivals</span>
              <span class="count">({{ getNewArrivalsCount() }})</span>
            </div>
          </div>
        </div>

        <!-- In Stock Toggle -->
        <div class="filterGroup type-gallery" role="listitem">
          <header class="filterGroupHeader" @click="toggleTrait('inStock')">
            <h3>In Stock</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="plus plusIcon" 
              viewBox="0 0 10 10"
              :class="{ rotated: expandedTraits.inStock }"
            >
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M5 0v10" class="vertical"></path>
              <path fill="none" stroke="#000" stroke-miterlimit="10" d="M10 5H0" class="horizontal"></path>
            </svg>
          </header>
          <div v-if="expandedTraits.inStock" class="filterOptionsList" role="list">
            <div class="filterOption" role="listitem">
              <div 
                class="filterToggle" 
                :class="{ active: modelValue.inStock === true }"
                @click="handleInStockChange($event)"
                role="checkbox"
                :aria-checked="modelValue.inStock === true || false"
              ></div>
              <span class="name">In Stock</span>
              <span class="count">({{ getInStockCount() }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBreakpoint } from '~/composables/useBreakpoint'

export interface FilterState {
  category?: string[]
  priceRange?: [number, number]
  scentFamily?: string[]
  brand?: string[]
  newArrivals?: boolean
  inStock?: boolean
  searchId?: string
}

interface ProductFiltersProps {
  modelValue?: FilterState
  products: Array<{ category?: string; price?: number; scentFamily?: string; brand?: string; isNew?: boolean; inStock?: boolean; id?: string | number }>
  isOpen?: boolean
}

const props = withDefaults(defineProps<ProductFiltersProps>(), {
  modelValue: () => ({} as FilterState),
  products: () => [],
  isOpen: false
})

const emit = defineEmits<{
  'update:modelValue': [filters: FilterState]
  'clearAll': []
  'close': []
  'search-by-id': [id: string | undefined]
}>()

const { isMobile } = useBreakpoint()

// Computed modelValue for v-model compatibility
const modelValue = computed({
  get: () => props.modelValue || ({} as FilterState),
  set: (value) => emit('update:modelValue', value)
})

// Search by ID
const searchId = ref(props.modelValue?.searchId || '')

// Expanded traits state
const expandedTraits = ref<Record<string, boolean>>({
  category: true,
  priceRange: true,
  scentFamily: true,
  brand: true,
  newArrivals: true,
  inStock: true
})

const toggleTrait = (trait: string): void => {
  expandedTraits.value[trait] = !expandedTraits.value[trait]
}

// Extract available options from products
const availableCategories = computed(() => {
  const categories = new Set<string>()
  props.products.forEach(product => {
    if (product.category) categories.add(product.category)
  })
  return Array.from(categories).sort()
})

const availableScentFamilies = computed(() => {
  const families = new Set<string>()
  props.products.forEach(product => {
    if (product.scentFamily) families.add(product.scentFamily)
  })
  return Array.from(families).sort()
})

// Price range from products
const minPrice = computed(() => {
  if (props.products.length === 0) return 0
  return Math.min(...props.products.map(p => p.price ?? 0))
})

const maxPrice = computed(() => {
  if (props.products.length === 0) return 1000
  return Math.max(...props.products.map(p => p.price ?? 1000))
})

// Count functions
const getCategoryCount = (category: string): number => {
  return props.products.filter(p => p.category === category).length
}

const getScentFamilyCount = (family: string): number => {
  return props.products.filter(p => p.scentFamily === family).length
}

const getBrandCount = (brand: string): number => {
  return props.products.filter(p => p.brand === brand).length
}

const getNewArrivalsCount = (): number => {
  return props.products.filter(p => p.isNew === true).length
}

const getInStockCount = (): number => {
  return props.products.filter(p => p.inStock === true).length
}

// Filter change handlers
const updateFilters = (updates: Partial<FilterState>) => {
  const newFilters = { ...modelValue.value, ...updates }
  emit('update:modelValue', newFilters)
}

const handleSearchIdChange = (): void => {
  const id = searchId.value || undefined
  updateFilters({ searchId: id })
  emit('search-by-id', id)
}

const handleCategoryChange = (category: string, event: Event) => {
  event.stopPropagation()
  const current = modelValue.value.category || []
  const isActive = current.includes(category)
  const updated = isActive
    ? current.filter(c => c !== category)
    : [...current, category]
  updateFilters({ category: updated.length > 0 ? updated : undefined })
}

const handlePriceMinChange = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  const max = modelValue.value.priceRange?.[1] ?? maxPrice.value
  updateFilters({ priceRange: [Math.max(minPrice.value, value), max] })
}

const handlePriceMaxChange = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  const min = modelValue.value.priceRange?.[0] ?? minPrice.value
  updateFilters({ priceRange: [min, Math.min(maxPrice.value, value)] })
}

const handleScentFamilyChange = (family: string, event: Event) => {
  event.stopPropagation()
  const current = modelValue.value.scentFamily || []
  const isActive = current.includes(family)
  const updated = isActive
    ? current.filter(f => f !== family)
    : [...current, family]
  updateFilters({ scentFamily: updated.length > 0 ? updated : undefined })
}

const handleBrandChange = (brand: string, event: Event) => {
  event.stopPropagation()
  const current = modelValue.value.brand || []
  const isActive = current.includes(brand)
  const updated = isActive
    ? current.filter(b => b !== brand)
    : [...current, brand]
  updateFilters({ brand: updated.length > 0 ? updated : undefined })
}

const handleNewArrivalsChange = (event: Event) => {
  event.stopPropagation()
  const checked = modelValue.value.newArrivals !== true
  updateFilters({ newArrivals: checked || undefined })
}

const handleInStockChange = (event: Event) => {
  event.stopPropagation()
  const checked = modelValue.value.inStock !== true
  updateFilters({ inStock: checked || undefined })
}

const handleClearAll = () => {
  emit('clearAll')
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* Refactored for AST/CFG divergence - filter sidebar styling */
.filterSidebar {
  position: fixed;
  top: 68px; /* Top navigation height */
  bottom: 0;
  left: 0; /* Allineato completamente a sinistra */
  width: 334.25px;
  background-color: var(--color-bg-base, rgb(255, 255, 255));
  border-left: none; /* Rimuoviamo il bordo per integrazione migliore */
  padding: 22px 28px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10; /* Below top navigation (z-index: 100) but above content */
  transform: translateX(0);
  transition: transform 0.3s ease;
  box-shadow: none; /* Nessuna ombra per integrazione fluida */
}

.filterSidebar.visible {
  transform: translateX(0);
}

/* Mobile: hide filter by default, show as overlay */
@media (max-width: 767px) {
  .filterSidebar {
    left: 0;
    width: 100%;
    transform: translateX(100%);
  }

  .filterSidebar.visible {
    transform: translateX(0);
  }
}

.inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.btn-close {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  z-index: 10;
}

.icon-close {
  width: 12.82px;
  height: 12.28px;
}

.stroke,
.stroke2 {
  stroke: #000;
  stroke-width: 1;
}

.title {
  font-family: var(--font-primary);
  font-size: var(--font-size-h3); /* Ridotto da h2 a h3 */
  color: var(--color-primary-ink);
  margin: 0 0 var(--spacing-lg) 0;
  font-weight: 400;
}

/* Search */
.galleryFilterSearch {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.btnOutline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.svgBase {
  width: 100%;
  height: 100%;
}

.path {
  fill: none;
  stroke: #000;
  stroke-width: 1;
}

.searchIcon {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  width: 13px;
  height: 13px;
  pointer-events: none;
}

.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 35px;
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption); /* Ridotto da body a caption */
  color: var(--color-primary-ink);
  background: transparent;
  border: none;
  outline: none;
}

.input::placeholder {
  color: var(--color-text-muted, #999);
}

/* Filter options list - refactored from ul to div for AST divergence */
.filterOptionsList {
  display: flex;
  flex-direction: column;
  list-style: none;
  padding: 0;
  margin: 0;
}

.filterGroup {
  margin-bottom: var(--spacing-md);
}

.filterGroup .filterGroupHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-neutral-surface);
  margin-bottom: var(--spacing-sm);
}

.filterGroup .filterGroupHeader h3 {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption); /* Ridotto da body a caption */
  color: var(--color-primary-ink);
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.plusIcon {
  width: 10px;
  height: 10px;
  transition: transform 0.2s ease;
}

.plusIcon.rotated {
  transform: rotate(45deg);
}

.filterOption {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  cursor: pointer;
}

.filterToggle {
  width: 18px;
  height: 18px;
  border: 1px solid var(--color-primary-ink);
  background: transparent;
  position: relative;
  flex-shrink: 0;
}

.filterToggle.active {
  background-color: var(--color-primary-ink);
}

.filterToggle.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  line-height: 1;
}

.name {
  font-family: var(--font-primary);
  font-size: var(--font-size-caption); /* Ridotto da body a caption */
  color: var(--color-primary-ink);
  flex: 1;
}

.count {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-text-muted, #999);
}

/* Price Range */
.priceRangeContent {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
}

.priceRangeInputs {
  display: flex;
  gap: var(--spacing-sm);
}

.priceRangeLabel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.priceRangeLabelText {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  opacity: 0.7;
}

.priceRangeInput {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption); /* Ridotto da body a caption */
  color: var(--color-primary-ink);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-neutral-surface);
  border-radius: 4px;
  background-color: var(--color-bg-base);
  width: 100%;
}

.priceRangeInput:focus {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.priceRangeDisplay {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  text-align: center;
  padding: var(--spacing-xs);
  background-color: var(--color-neutral-surface);
  border-radius: 4px;
}

/* Desktop */
@media (min-width: 768px) {
  .filterSidebar {
    position: fixed;
    top: 68px; /* Top navigation height */
    bottom: 0;
    left: 0; /* Allineato completamente a sinistra */
    width: 334.25px;
    transform: translateX(0%);
    border-left: none; /* Rimuoviamo il bordo per integrazione migliore */
    border-radius: 0;
    flex-shrink: 0;
    box-shadow: none; /* Nessuna ombra per integrazione fluida */
  }

  .filterSidebar .btn-close {
    display: none;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .filterSidebar {
    width: 100%;
    height: 100vh;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .filterSidebar,
  .plusIcon {
    transition: none;
  }
}
</style>
