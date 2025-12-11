/**
 * Product data transformation utilities
 * 
 * Transforms Strapi CMS format → Application format
 * Handles multi-language content extraction, variant normalization, and image processing
 */

import type { 
  StrapiProduct, 
  StrapiMedia, 
  StrapiProductVariant,
  StrapiCategory 
} from '~/types/strapi'
import type { 
  Product, 
  ProductImage, 
  ProductVariant 
} from '~/types/product'
import { calculateStockStatus } from '~/utils/stockCalculations'

/**
 * Extract multi-language content
 * Returns content for current locale or fallback to first available
 */
function extractLocalizedContent(
  content: string | Record<string, string> | undefined,
  locale: string = 'en'
): string {
  if (!content) return ''
  
  if (typeof content === 'string') {
    return content
  }
  
  // Try current locale first
  if (content[locale]) {
    return content[locale]
  }
  
  // Fallback to first available locale
  const locales = Object.keys(content)
  if (locales.length > 0) {
    return content[locales[0]]
  }
  
  return ''
}

/**
 * Transform Strapi media to ProductImage
 */
export function transformStrapiMedia(
  media: StrapiMedia | number | null | undefined
): ProductImage | null {
  // Handle case where media is just an ID (not populated)
  if (!media || typeof media === 'number') {
    return null
  }
  
  // Build full URL (Strapi returns relative URLs)
  const baseUrl = useRuntimeConfig().public.strapiUrl || 'http://localhost:1337'
  const imageUrl = media.url.startsWith('http') 
    ? media.url 
    : `${baseUrl}${media.url.startsWith('/') ? '' : '/'}${media.url}`
  
  const thumbnailUrl = media.formats?.thumbnail?.url
    ? (media.formats.thumbnail.url.startsWith('http')
        ? media.formats.thumbnail.url
        : `${baseUrl}${media.formats.thumbnail.url.startsWith('/') ? '' : '/'}${media.formats.thumbnail.url}`)
    : undefined
  
  return {
    id: media.id,
    url: imageUrl,
    thumbnailUrl,
    alt: media.alternativeText || media.name,
    caption: media.caption,
    width: media.width,
    height: media.height,
    isPrimary: false, // Will be set by transformer
    is3D: media.mime?.includes('model') || false,
    formats: media.formats ? {
      thumbnail: media.formats.thumbnail?.url 
        ? (media.formats.thumbnail.url.startsWith('http')
            ? media.formats.thumbnail.url
            : `${baseUrl}${media.formats.thumbnail.url.startsWith('/') ? '' : '/'}${media.formats.thumbnail.url}`)
        : undefined,
      small: media.formats.small?.url
        ? (media.formats.small.url.startsWith('http')
            ? media.formats.small.url
            : `${baseUrl}${media.formats.small.url.startsWith('/') ? '' : '/'}${media.formats.small.url}`)
        : undefined,
      medium: media.formats.medium?.url
        ? (media.formats.medium.url.startsWith('http')
            ? media.formats.medium.url
            : `${baseUrl}${media.formats.medium.url.startsWith('/') ? '' : '/'}${media.formats.medium.url}`)
        : undefined,
      large: media.formats.large?.url
        ? (media.formats.large.url.startsWith('http')
            ? media.formats.large.url
            : `${baseUrl}${media.formats.large.url.startsWith('/') ? '' : '/'}${media.formats.large.url}`)
        : undefined
    } : undefined
  }
}

/**
 * Transform Strapi product variant to ProductVariant
 */
export function transformStrapiVariant(
  variant: StrapiProductVariant | number | null | undefined
): ProductVariant | null {
  // Handle case where variant is just an ID (not populated)
  if (!variant || typeof variant === 'number') {
    return null
  }
  
  const variantImages = variant.images
    ? variant.images
        .map(img => transformStrapiMedia(img))
        .filter((img): img is ProductImage => img !== null)
    : []
  
  // Calculate stock status based on quantity and threshold
  const stockStatus = calculateStockStatus(variant.stockQuantity)
  
  return {
    id: variant.id,
    type: variant.type,
    value: variant.value,
    sku: variant.sku,
    price: variant.price,
    currency: variant.currency,
    stockQuantity: variant.stockQuantity,
    stockStatus,
    images: variantImages.length > 0 ? variantImages : undefined,
    isAvailable: stockStatus !== 'out_of_stock'
  }
}

/**
 * Transform Strapi category to Product category
 */
function transformStrapiCategory(
  category: StrapiCategory | number | null | undefined
): Product['category'] | undefined {
  if (!category || typeof category === 'number') {
    return undefined
  }
  
  return {
    id: category.id,
    name: extractLocalizedContent(category.name),
    slug: category.slug
  }
}

/**
 * Transform Strapi product to Product (application format)
 * 
 * @param strapiProduct - Strapi product data
 * @param locale - Current locale for multi-language content (default: 'en')
 * @returns Transformed Product
 */
export function transformStrapiProduct(
  strapiProduct: StrapiProduct,
  locale: string = 'en'
): Product {
  // Extract multi-language content
  const name = extractLocalizedContent(strapiProduct.name, locale)
  const description = extractLocalizedContent(strapiProduct.description, locale)
  
  // Transform images
  const images = strapiProduct.images
    ? strapiProduct.images
        .map(img => transformStrapiMedia(img))
        .filter((img): img is ProductImage => img !== null)
    : []
  
  // Set primary image (first image or marked as primary)
  const primaryImage = images.find(img => img.isPrimary) || images[0]
  if (primaryImage) {
    primaryImage.isPrimary = true
  }
  
  // Transform variants
  const variants = strapiProduct.variants
    ? strapiProduct.variants
        .map(variant => transformStrapiVariant(variant))
        .filter((variant): variant is ProductVariant => variant !== null)
    : undefined
  
  // Compute inStock from variants or assume true if no variants
  const inStock = variants && variants.length > 0
    ? variants.some(v => v.isAvailable !== false)
    : true
  
  // Transform category
  const category = transformStrapiCategory(strapiProduct.category)
  
  return {
    id: strapiProduct.id,
    name,
    description: description || undefined,
    category,
    subCategory: strapiProduct.subCategory,
    brand: strapiProduct.brand,
    price: strapiProduct.price ?? 0,
    currency: strapiProduct.currency || 'EUR',
    sku: strapiProduct.sku || '',
    barcode: strapiProduct.barcode,
    images,
    primaryImage,
    variants,
    inStock,
    isNew: false, // Will be determined by business logic or CMS field
    // Store full multi-language data
    nameLocalized: typeof strapiProduct.name === 'object' 
      ? strapiProduct.name 
      : undefined,
    descriptionLocalized: typeof strapiProduct.description === 'object'
      ? strapiProduct.description
      : undefined
  }
}

/**
 * Transform array of Strapi products
 */
export function transformStrapiProducts(
  strapiProducts: StrapiProduct[],
  locale: string = 'en'
): Product[] {
  return strapiProducts.map(product => transformStrapiProduct(product, locale))
}

