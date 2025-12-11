import type { StrapiResponse, StrapiError } from '~/types/strapi'

/**
 * Strapi API Client Composable
 * 
 * Wrapper around useFetch for Strapi API calls with caching support.
 * 
 * @example
 * ```ts
 * const { data, pending, error, refresh } = useStrapi('/products')
 * ```
 * 
 * @param endpoint - Strapi API endpoint (without /api prefix)
 * @param options - Additional useFetch options
 * @returns Reactive state and methods for Strapi API calls
 * 
 * @see docs/architecture.md#Composables-Pattern
 */
export function useStrapi<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: any
    query?: Record<string, any>
    cacheKey?: string
    immediate?: boolean
    server?: boolean
  } = {}
) {
  const {
    method = 'GET',
    body,
    query,
    cacheKey,
    immediate = true,
    server = true
  } = options

  // Build the API path
  // Remove leading slash if present, add /api/strapi prefix
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  const apiPath = `/api/strapi/${cleanEndpoint}`

  // Build cache key if not provided
  const finalCacheKey = cacheKey || `strapi:${method}:${cleanEndpoint}:${JSON.stringify(query || {})}`

  // Use Nuxt's useFetch with caching
  const { data, pending, error, refresh, execute } = useFetch<StrapiResponse<T>>(
    apiPath,
    {
      method,
      body,
      query,
      key: finalCacheKey,
      immediate,
      server,
      // Transform error to StrapiError type
      onResponseError({ response }) {
        const strapiError: StrapiError = {
          error: {
            status: response.status,
            message: response.statusText || 'Unknown error',
            details: response._data
          }
        }
        return strapiError
      }
    }
  )

  // Extract data from Strapi response structure
  // Strapi v5 returns data in { data: T } format
  const extractedData = computed(() => {
    if (!data.value) return null
    
    // Handle Strapi response structure
    if ('data' in data.value) {
      return (data.value as StrapiResponse<T>).data
    }
    
    return data.value as T
  })

  return {
    data: extractedData,
    pending,
    error,
    refresh,
    execute,
    // Raw response (includes metadata)
    rawData: data
  }
}

/**
 * Cache key patterns for Strapi API responses
 * 
 * Used for cache invalidation when content is updated in CMS.
 * 
 * @example
 * ```ts
 * // Invalidate all product-related cache
 * await clearStrapiCache('products')
 * 
 * // Invalidate specific product cache
 * await clearStrapiCache('products', { id: 123 })
 * ```
 */
export const STRAPI_CACHE_PATTERNS = {
  products: 'strapi:GET:products',
  productsList: (query?: Record<string, any>) => 
    `strapi:products:list:${JSON.stringify(query || {})}`,
  product: (id: string | number) => `strapi:GET:products/${id}`,
  productSingle: (id: string | number, locale?: string) => 
    `strapi:products:single:${id}${locale ? `:${locale}` : ''}`,
  productSearch: (query: string, options?: Record<string, any>) => 
    `strapi:products:search:${query}:${JSON.stringify(options || {})}`,
  categories: 'strapi:GET:categories',
  category: (id: string | number) => `strapi:GET:categories/${id}`,
  media: (id: string | number) => `strapi:GET:upload/files/${id}`
} as const

/**
 * Clear Strapi cache by pattern
 * 
 * Invalidates Nuxt useFetch cache entries matching the pattern.
 * Should be called after content updates in CMS.
 * 
 * @param pattern - Cache key pattern or endpoint
 * @param params - Optional parameters for dynamic cache keys
 */
export async function clearStrapiCache(
  pattern: string,
  params?: Record<string, any>
): Promise<void> {
  const { clearNuxtData } = await import('#app')
  
  if (params) {
    // Clear specific cache entry
    const cacheKey = pattern.includes(':') 
      ? pattern 
      : `strapi:GET:${pattern}:${JSON.stringify(params)}`
    clearNuxtData(cacheKey)
  } else {
    // Clear all cache entries matching pattern
    // Note: Nuxt's clearNuxtData doesn't support wildcards,
    // so we clear the base pattern
    const cacheKey = pattern.includes(':') 
      ? pattern 
      : `strapi:GET:${pattern}`
    clearNuxtData(cacheKey)
  }
}

