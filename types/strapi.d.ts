/**
 * TypeScript types for Strapi CMS API responses
 * 
 * Based on Strapi v5.x API structure
 */

/**
 * Standard Strapi API response wrapper
 */
export interface StrapiResponse<T> {
  data: T
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
 * Strapi error response structure
 */
export interface StrapiError {
  error: {
    status: number
    message: string
    details?: any
  }
}

/**
 * Strapi entity with standard fields
 */
export interface StrapiEntity {
  id: number
  documentId?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string | null
  locale?: string
}

/**
 * Product variant structure in Strapi
 */
export interface StrapiProductVariant extends StrapiEntity {
  type: 'size' | 'scent-profile'
  value: string // e.g., "50ml", "Floral"
  sku: string // Unique SKU for this variant
  price?: number // Price override (if different from base product price)
  currency?: string // Currency for variant price
  stockQuantity?: number
  images?: StrapiMedia[] // Variant-specific images
}

/**
 * Product content type structure
 * Extended with variant support
 */
export interface StrapiProduct extends StrapiEntity {
  name: string | Record<string, string> // Multi-language support
  description: string | Record<string, string> // Rich text, multi-language
  category?: StrapiCategory | number
  subCategory?: 'Niche' | 'Commercial'
  brand?: string
  price?: number
  currency?: string
  sku?: string
  barcode?: string
  images?: StrapiMedia[]
  variants?: StrapiProductVariant[] // Product variants (size, scent profile, etc.)
}

/**
 * Category content type structure
 */
export interface StrapiCategory extends StrapiEntity {
  name: string | Record<string, string> // Multi-language support
  slug: string
  description?: string | Record<string, string>
}

/**
 * Strapi media/file structure
 */
export interface StrapiMedia extends StrapiEntity {
  name: string
  alternativeText?: string
  caption?: string
  width?: number
  height?: number
  formats?: {
    thumbnail?: StrapiMediaFormat
    small?: StrapiMediaFormat
    medium?: StrapiMediaFormat
    large?: StrapiMediaFormat
  }
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl?: string
  provider: string
  provider_metadata?: any
}

/**
 * Media format variant
 */
export interface StrapiMediaFormat {
  name: string
  hash: string
  ext: string
  mime: string
  width: number
  height: number
  size: number
  path?: string
  url: string
}

