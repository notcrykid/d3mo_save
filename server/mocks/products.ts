import type { StrapiProduct, StrapiResponse } from '~/types/strapi'

/**
 * Lightweight mock catalog used when Strapi is unavailable in dev.
 * 
 * NOTE: we deliberately omit images so UI shows the original gradient
 * placeholders instead of external photos.
 */
const mockProducts: StrapiProduct[] = [
  { id: 1, name: { en: 'Product 1', it: 'Product 1' }, price: 120, currency: 'EUR', sku: 'P-001', images: [], variants: [] },
  { id: 2, name: { en: 'Product 2', it: 'Product 2' }, price: 140, currency: 'EUR', sku: 'P-002', images: [], variants: [] },
  { id: 3, name: { en: 'Product 3', it: 'Product 3' }, price: 160, currency: 'EUR', sku: 'P-003', images: [], variants: [] },
  { id: 4, name: { en: 'Product 4', it: 'Product 4' }, price: 180, currency: 'EUR', sku: 'P-004', images: [], variants: [] },
  { id: 5, name: { en: 'Product 5', it: 'Product 5' }, price: 200, currency: 'EUR', sku: 'P-005', images: [], variants: [] },
  { id: 6, name: { en: 'Product 6', it: 'Product 6' }, price: 220, currency: 'EUR', sku: 'P-006', images: [], variants: [] },
  { id: 7, name: { en: 'Product 7', it: 'Product 7' }, price: 240, currency: 'EUR', sku: 'P-007', images: [], variants: [] },
  { id: 8, name: { en: 'Product 8', it: 'Product 8' }, price: 260, currency: 'EUR', sku: 'P-008', images: [], variants: [] },
  { id: 9, name: { en: 'Product 9', it: 'Product 9' }, price: 280, currency: 'EUR', sku: 'P-009', images: [], variants: [] }
]

export const mockProductsResponse: StrapiResponse<StrapiProduct[]> = {
  data: mockProducts,
  meta: {
    pagination: {
      page: 1,
      pageSize: mockProducts.length,
      pageCount: 1,
      total: mockProducts.length
    }
  }
}


