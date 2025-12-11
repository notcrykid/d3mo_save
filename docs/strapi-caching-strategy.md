# Strapi CMS Caching Strategy

## Overview

This document describes the caching strategy for Strapi CMS API responses in the Nuxt application.

## Implementation

### Cache Keys

Cache keys follow the pattern: `strapi:{method}:{endpoint}:{query}`

Examples:
- `strapi:GET:products:{}` - All products
- `strapi:GET:products:{"populate":"category"}` - Products with category populated
- `strapi:GET:products/123:{}` - Specific product

### Cache Invalidation

Cache invalidation should be triggered when:
1. Content is updated in Strapi CMS admin
2. Products are created, updated, or deleted
3. Categories are modified
4. Media files are uploaded or deleted

### Usage

```typescript
// In composable or component
import { useStrapi, clearStrapiCache } from '~/composables/useStrapi'

// Fetch with automatic caching
const { data, pending, error } = useStrapi('products', {
  query: { populate: 'category' }
})

// Invalidate cache after content update
await clearStrapiCache('products')
```

### Cache Key Patterns

Predefined cache key patterns are available in `STRAPI_CACHE_PATTERNS`:

```typescript
import { STRAPI_CACHE_PATTERNS } from '~/composables/useStrapi'

// Use predefined patterns
await clearStrapiCache(STRAPI_CACHE_PATTERNS.products)
await clearStrapiCache(STRAPI_CACHE_PATTERNS.product(123))
await clearStrapiCache(STRAPI_CACHE_PATTERNS.productSingle(123, 'it'))
await clearStrapiCache(STRAPI_CACHE_PATTERNS.productsList({ page: 1, filters: { category: 'perfumes' } }))
await clearStrapiCache(STRAPI_CACHE_PATTERNS.productSearch('perfume', { locale: 'it' }))
```

### Product-Specific Cache Keys

Product composables use specific cache key patterns:

- **Product List**: `strapi:products:list:{query}` - Includes pagination, filters, sorting, locale
- **Single Product**: `strapi:products:single:{id}:{locale}` - Includes product ID and locale
- **Product Search**: `strapi:products:search:{query}:{options}` - Includes search query and options

These patterns ensure proper cache isolation for different product queries and locales.

## Best Practices

1. **Use cache keys consistently**: Always use the same cache key pattern for the same data
2. **Invalidate on updates**: Always clear cache when content is modified
3. **Use query parameters in cache keys**: Include query parameters in cache keys to avoid stale data
4. **Server-side rendering**: Cache works for both server and client-side requests

## Future Enhancements

- Webhook integration for automatic cache invalidation when content is updated in Strapi
- Cache TTL configuration
- Selective cache invalidation based on content type relationships

