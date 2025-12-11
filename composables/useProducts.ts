/**
 * Products list composable
 * 
 * Fetches and manages product list with pagination, filtering, and sorting.
 * Uses Strapi API via useStrapi composable with caching support.
 * 
 * @example
 * ```ts
 * const { products, pending, error, refresh } = useProducts({
 *   page: 1,
 *   pageSize: 20,
 *   filters: { category: 'perfumes' },
 *   locale: 'it'
 * })
 * ```
 */

import { computed } from 'vue'
import { useStrapi } from './useStrapi'
import type { StrapiProduct } from '~/types/strapi'
import type { Product, ProductListQuery } from '~/types/product'
import { transformStrapiProducts } from '~/utils/productTransformers'

/**
 * Get products list with pagination, filtering, and sorting
 * 
 * @param query - Query parameters for filtering, pagination, sorting
 * @returns Reactive state and methods for products list
 */
export function useProducts(query: ProductListQuery = {}) {
  const {
    page = 1,
    pageSize = 20,
    sort,
    filters,
    search,
    locale = 'en'
  } = query

  // Build Strapi API query parameters
  const strapiQuery: Record<string, any> = {
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'populate': ['category', 'images', 'variants', 'variants.images']
  }

  // Add sorting
  if (sort) {
    strapiQuery.sort = sort
  }

  // Add filters
  if (filters) {
    const filterArray: string[] = []
    
    if (filters.category) {
      const categoryId = typeof filters.category === 'number' 
        ? filters.category 
        : `category.slug:${filters.category}`
      filterArray.push(`filters[category][id][$eq]=${categoryId}`)
    }
    
    if (filters.subCategory) {
      filterArray.push(`filters[subCategory][$eq]=${filters.subCategory}`)
    }
    
    if (filters.brand) {
      const brands = Array.isArray(filters.brand) ? filters.brand : [filters.brand]
      brands.forEach((brand, index) => {
        filterArray.push(`filters[brand][$in][${index}]=${brand}`)
      })
    }
    
    if (filters.priceMin !== undefined) {
      filterArray.push(`filters[price][$gte]=${filters.priceMin}`)
    }
    
    if (filters.priceMax !== undefined) {
      filterArray.push(`filters[price][$lte]=${filters.priceMax}`)
    }
    
    if (filters.inStock !== undefined) {
      // Note: Stock filtering would need to check variants or a stock field
      // This is a placeholder for the filter structure
      filterArray.push(`filters[inStock][$eq]=${filters.inStock}`)
    }
    
    if (filters.isNew !== undefined) {
      filterArray.push(`filters[isNew][$eq]=${filters.isNew}`)
    }
    
    // Merge filter array into query
    if (filterArray.length > 0) {
      Object.assign(strapiQuery, Object.fromEntries(
        filterArray.map(f => {
          const [key, value] = f.split('=')
          return [key, value]
        })
      ))
    }
  }

  // Add search
  if (search) {
    strapiQuery['filters[$or][0][name][$containsi]'] = search
    strapiQuery['filters[$or][1][description][$containsi]'] = search
    strapiQuery['filters[$or][2][sku][$containsi]'] = search
    strapiQuery['filters[$or][3][brand][$containsi]'] = search
  }

  // Add locale
  if (locale) {
    strapiQuery.locale = locale
  }

  // Build cache key
  const cacheKey = `strapi:products:list:${JSON.stringify({
    page,
    pageSize,
    sort,
    filters,
    search,
    locale
  })}`

  // Fetch products from Strapi
  const { data, pending, error, refresh, rawData } = useStrapi<StrapiProduct[]>(
    'products',
    {
      method: 'GET',
      query: strapiQuery,
      cacheKey
    }
  )

  // Transform Strapi products to application format
  const products = computed<Product[]>(() => {
    if (!data.value || !Array.isArray(data.value)) {
      return []
    }
    return transformStrapiProducts(data.value, locale)
  })

  // Extract pagination metadata
  const pagination = computed(() => {
    return rawData.value?.meta?.pagination
  })

  return {
    products,
    pending,
    error,
    refresh,
    pagination
  }
}









