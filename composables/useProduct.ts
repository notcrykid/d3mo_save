/**
 * Single product composable
 * 
 * Fetches and manages a single product by ID with full variant and image data.
 * Uses Strapi API via useStrapi composable with caching support.
 * 
 * @example
 * ```ts
 * const { product, pending, error, refresh } = useProduct(123, { locale: 'it' })
 * ```
 */

import { computed } from 'vue'
import { useStrapi } from './useStrapi'
import type { StrapiProduct } from '~/types/strapi'
import type { Product } from '~/types/product'
import { transformStrapiProduct } from '~/utils/productTransformers'

/**
 * Get single product by ID
 * 
 * @param id - Product ID
 * @param options - Options for fetching (locale, etc.)
 * @returns Reactive state and methods for product
 */
export function useProduct(
  id: string | number,
  options: {
    locale?: string
    immediate?: boolean
  } = {}
) {
  const {
    locale = 'en',
    immediate = true
  } = options

  // Build Strapi API query parameters
  const strapiQuery: Record<string, any> = {
    'populate': ['category', 'images', 'variants', 'variants.images']
  }

  // Add locale
  if (locale) {
    strapiQuery.locale = locale
  }

  // Build cache key
  const cacheKey = `strapi:products:single:${id}:${locale}`

  // Fetch product from Strapi
  const { data, pending, error, refresh, rawData } = useStrapi<StrapiProduct>(
    `products/${id}`,
    {
      method: 'GET',
      query: strapiQuery,
      cacheKey,
      immediate
    }
  )

  // Transform Strapi product to application format
  const product = computed<Product | null>(() => {
    if (!data.value) {
      return null
    }
    return transformStrapiProduct(data.value, locale)
  })

  return {
    product,
    pending,
    error,
    refresh
  }
}









