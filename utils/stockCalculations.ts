/**
 * Stock status calculation utilities
 * 
 * Calculates stock status based on quantity and low stock threshold
 */

import type { StockStatus } from '~/types/product'

/**
 * Default low stock threshold (configurable via environment variable)
 */
const DEFAULT_LOW_STOCK_THRESHOLD = 10

/**
 * Get low stock threshold from environment or use default
 */
export function getLowStockThreshold(): number {
  try {
    const config = useRuntimeConfig()
    return config.public.lowStockThreshold || DEFAULT_LOW_STOCK_THRESHOLD
  } catch {
    // Fallback if Nuxt context not available (e.g., in tests without proper setup)
    return DEFAULT_LOW_STOCK_THRESHOLD
  }
}

/**
 * Calculate stock status based on quantity and threshold
 * 
 * @param stockQuantity - Current stock quantity (undefined/null = out of stock)
 * @param threshold - Low stock threshold (default: 10, or from config if not provided)
 * @returns StockStatus enum value
 */
export function calculateStockStatus(
  stockQuantity: number | undefined | null,
  threshold?: number
): StockStatus {
  // Use provided threshold, or get from config, or use default
  const lowStockThreshold = threshold !== undefined 
    ? threshold 
    : (() => {
        try {
          return getLowStockThreshold()
        } catch {
          // Fallback if Nuxt context not available (e.g., in tests)
          return DEFAULT_LOW_STOCK_THRESHOLD
        }
      })()
  
  // Handle undefined/null as out of stock
  if (stockQuantity === undefined || stockQuantity === null) {
    return 'out_of_stock'
  }
  
  // Negative quantity treated as out of stock
  if (stockQuantity < 0) {
    return 'out_of_stock'
  }
  
  // Zero quantity is out of stock
  if (stockQuantity === 0) {
    return 'out_of_stock'
  }
  
  // Quantity above threshold is in stock
  if (stockQuantity > lowStockThreshold) {
    return 'in_stock'
  }
  
  // Quantity between 1 and threshold is low stock
  return 'low_stock'
}

/**
 * Check if variant is available (has stock)
 */
export function isVariantAvailable(stockQuantity: number | undefined | null): boolean {
  return calculateStockStatus(stockQuantity) !== 'out_of_stock'
}

