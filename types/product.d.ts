/**
 * Product-related TypeScript types
 * 
 * Application-level types for product data model with variants and images.
 * These types represent the normalized format after transformation from Strapi CMS.
 */

/**
 * Product variant type (size, scent profile, etc.)
 */
export type ProductVariantType = 'size' | 'scent-profile'

/**
 * Stock status enum
 * Calculated based on stock quantity and low stock threshold
 */
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

/**
 * Product variant structure
 * Each variant can have different price, stock, and images
 */
export interface ProductVariant {
  id: string | number
  type: ProductVariantType
  value: string // e.g., "50ml", "Floral"
  sku: string // Unique SKU for this variant
  price?: number // Price override (if different from base product price)
  currency?: string // Currency for variant price (defaults to product currency)
  stockQuantity?: number
  stockStatus?: StockStatus // Computed from stockQuantity and threshold
  images?: ProductImage[] // Variant-specific images
  isAvailable?: boolean // Computed from stockQuantity
}

/**
 * Product image structure
 * Supports 2D and 3D assets
 */
export interface ProductImage {
  id: string | number
  url: string // Full URL to image
  thumbnailUrl?: string // Thumbnail version
  alt?: string // Alternative text for accessibility
  caption?: string
  width?: number
  height?: number
  isPrimary?: boolean // Primary product image
  is3D?: boolean // Whether this is a 3D asset
  formats?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
  }
}

/**
 * Product interface - Application format
 * Complete product schema with variants and images
 */
export interface Product {
  id: string | number
  name: string // Extracted from multi-language field (current locale)
  description?: string // Extracted from multi-language field (current locale)
  category?: {
    id: string | number
    name: string
    slug: string
  }
  subCategory?: 'Niche' | 'Commercial'
  brand?: string
  price: number // Base price
  currency: string // Default: EUR
  sku: string // Unique identifier
  barcode?: string // Optional EAN/barcode
  images: ProductImage[] // Product image gallery
  primaryImage?: ProductImage // Main product image
  variants?: ProductVariant[] // Product variants (size, scent profile, etc.)
  inStock?: boolean // Computed from variants or direct stock
  isNew?: boolean // New arrival flag
  // Multi-language support (full data)
  nameLocalized?: Record<string, string> // Full multi-language name object
  descriptionLocalized?: Record<string, string> // Full multi-language description object
}

/**
 * Product list query parameters
 * For filtering, pagination, and sorting
 */
export interface ProductListQuery {
  // Pagination
  page?: number
  pageSize?: number
  
  // Sorting
  sort?: string // e.g., "name:asc", "price:desc"
  
  // Filtering
  filters?: {
    category?: string | number
    subCategory?: 'Niche' | 'Commercial'
    brand?: string | string[]
    priceMin?: number
    priceMax?: number
    inStock?: boolean
    isNew?: boolean
  }
  
  // Search
  search?: string // Search by name, description, SKU, brand
  
  // Locale
  locale?: string // 'it' or 'en' for multi-language content
}

/**
 * Product search query parameters
 */
export interface ProductSearchQuery {
  query: string // Search term
  fields?: ('name' | 'description' | 'sku' | 'brand')[] // Fields to search in
  locale?: string
  limit?: number
}

/**
 * Product API response wrapper
 * For list endpoints with pagination
 */
export interface ProductListResponse {
  data: Product[]
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

/**
 * Product API response wrapper
 * For single product endpoint
 */
export interface ProductResponse {
  data: Product
}

