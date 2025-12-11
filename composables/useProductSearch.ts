/**
 * Product search composable
 * 
 * Searches products by name, description, SKU, or brand.
 * Uses Strapi API via useStrapi composable with caching support.
 * 
 * @example
 * ```ts
 * const { products, pending, error, refresh } = useProductSearch({
 *   query: 'perfume',
 *   fields: ['name', 'description'],
 *   locale: 'it'
 * })
 * ```
 */

import { computed } from 'vue'
import { useStrapi } from './useStrapi'
import type { StrapiProduct } from '~/types/strapi'
import type { Product, ProductSearchQuery } from '~/types/product'
import { transformStrapiProducts } from '~/utils/productTransformers'

/**
 * Search products
 * 
 * @param query - Search query parameters
 * @returns Reactive state and methods for search results
 */
export function useProductSearch(query: ProductSearchQuery) {
  const {
    query: searchQuery,
    fields = ['name', 'description', 'sku', 'brand'],
    locale = 'en',
    limit = 20
  } = query

  // Build Strapi API query parameters
  const strapiQuery: Record<string, any> = {
    'pagination[pageSize]': limit,
    'populate': ['category', 'images', 'variants', 'variants.images']
  }

  // Build search filters based on fields
  if (searchQuery) {
    const orConditions: Record<string, any> = {}
    let conditionIndex = 0

    if (fields.includes('name')) {
      orConditions[`filters[$or][${conditionIndex}][name][$containsi]`] = searchQuery
      conditionIndex++
    }

    if (fields.includes('description')) {
      orConditions[`filters[$or][${conditionIndex}][description][$containsi]`] = searchQuery
      conditionIndex++
    }

    if (fields.includes('sku')) {
      orConditions[`filters[$or][${conditionIndex}][sku][$containsi]`] = searchQuery
      conditionIndex++
    }

    if (fields.includes('brand')) {
      orConditions[`filters[$or][${conditionIndex}][brand][$containsi]`] = searchQuery
      conditionIndex++
    }

    Object.assign(strapiQuery, orConditions)
  }

  // Add locale
  if (locale) {
    strapiQuery.locale = locale
  }

  // Build cache key
  const cacheKey = `strapi:products:search:${searchQuery}:${JSON.stringify({
    fields,
    locale,
    limit
  })}`

  // Fetch search results from Strapi
  const { data, pending, error, refresh } = useStrapi<StrapiProduct[]>(
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

  return {
    products,
    pending,
    error,
    refresh
  }
}









