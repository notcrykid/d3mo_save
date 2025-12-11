import { computed, type Ref, type ComputedRef } from 'vue'
import type { FilterState } from '~/components/commerce/ProductFilters.vue'
import type { Product } from '~/types/product'

/**
 * Composable for product filtering using Set-based approach for behavioral divergence
 * Refactored from sequential filter() calls to Set/Map-based filtering
 */
export function useProductFiltering(
  products: Ref<Product[]> | ComputedRef<Product[]>,
  filters: Ref<FilterState>
) {
  // Extract min/max price from products
  const minPrice = computed(() => {
    if (products.value.length === 0) return 0
    return Math.min(...products.value.map(p => p.price ?? 0))
  })

  const maxPrice = computed(() => {
    if (products.value.length === 0) return 1000
    return Math.max(...products.value.map(p => p.price ?? 1000))
  })

  // Filtered products using Set-based approach (behavioral divergence from sequential filter())
  const filteredProducts = computed(() => {
    const allProducts = products.value
    const filterState = filters.value

    // Search by ID filter (highest priority) - early return pattern
    if (filterState.searchId && filterState.searchId.trim() !== '') {
      const searchIdNum = Number(filterState.searchId.trim())
      if (!isNaN(searchIdNum)) {
        return allProducts.filter(product => {
          const productId = typeof product.id === 'number' ? product.id : Number(product.id)
          return productId === searchIdNum
        })
      }
    }

    // Build filter sets for efficient lookup (Set-based approach)
    const categorySet = filterState.category && filterState.category.length > 0
      ? new Set(filterState.category)
      : null

    const scentFamilySet = filterState.scentFamily && filterState.scentFamily.length > 0
      ? new Set(filterState.scentFamily)
      : null

    const brandSet = filterState.brand && filterState.brand.length > 0
      ? new Set(filterState.brand)
      : null

    // Filter products using Set-based lookups (different execution pattern from sequential filter())
    const result: Product[] = []
    
    for (const product of allProducts) {
      let matches = true

      // Category filter (Set lookup) - handle category as object or string
      if (categorySet && product.category) {
        const categoryName = typeof product.category === 'string' 
          ? product.category 
          : product.category.name || product.category.slug
        if (!categoryName || !categorySet.has(categoryName)) {
          matches = false
          continue
        }
      } else if (categorySet) {
        matches = false
        continue
      }

      // Price range filter (direct comparison)
      if (filterState.priceRange) {
        const [min, max] = filterState.priceRange
        const price = product.price ?? 0
        if (price < min || price > max) {
          matches = false
          continue
        }
      }

      // Scent family filter (Set lookup)
      if (scentFamilySet && product.scentFamily) {
        if (!scentFamilySet.has(product.scentFamily)) {
          matches = false
          continue
        }
      } else if (scentFamilySet) {
        matches = false
        continue
      }

      // Brand filter (Set lookup)
      if (brandSet && product.brand) {
        if (!brandSet.has(product.brand)) {
          matches = false
          continue
        }
      } else if (brandSet) {
        matches = false
        continue
      }

      // New arrivals filter (boolean check)
      if (filterState.newArrivals === true) {
        if (product.isNew !== true) {
          matches = false
          continue
        }
      }

      // In stock filter (boolean check)
      if (filterState.inStock === true) {
        if (product.inStock !== true) {
          matches = false
          continue
        }
      }

      if (matches) {
        result.push(product)
      }
    }

    return result
  })

  return {
    filteredProducts,
    minPrice,
    maxPrice
  }
}


