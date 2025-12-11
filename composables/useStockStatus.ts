/**
 * Stock status composable
 * 
 * Provides reactive stock status calculations for product variants.
 * Calculates stock status (in_stock, low_stock, out_of_stock) based on quantity and threshold.
 * 
 * @example
 * ```ts
 * const { stockStatus, isAvailable, isLowStock, isOutOfStock } = useStockStatus(computed(() => variant.value?.stockQuantity))
 * ```
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { calculateStockStatus, getLowStockThreshold } from '~/utils/stockCalculations'
import type { StockStatus } from '~/types/product'

/**
 * Options for stock status calculation
 */
export interface UseStockStatusOptions {
  /**
   * Low stock threshold (overrides default/config value)
   */
  threshold?: number
}

/**
 * Get reactive stock status for a variant
 * 
 * @param stockQuantity - Reactive stock quantity (from variant or product)
 * @param options - Options for stock status calculation
 * @returns Reactive stock status state and helpers
 */
export function useStockStatus(
  stockQuantity: Ref<number | undefined | null> | ComputedRef<number | undefined | null>,
  options: UseStockStatusOptions = {}
): {
  /**
   * Current stock status (in_stock, low_stock, out_of_stock)
   */
  stockStatus: ComputedRef<StockStatus>
  /**
   * Whether variant is available (has stock)
   */
  isAvailable: ComputedRef<boolean>
  /**
   * Whether variant is low stock
   */
  isLowStock: ComputedRef<boolean>
  /**
   * Whether variant is out of stock
   */
  isOutOfStock: ComputedRef<boolean>
  /**
   * Current stock quantity
   */
  quantity: ComputedRef<number | undefined | null>
  /**
   * Low stock threshold being used
   */
  threshold: ComputedRef<number>
} {
  const { threshold: customThreshold } = options

  // Get threshold (custom, from config, or default)
  const threshold = computed(() => {
    return customThreshold ?? getLowStockThreshold()
  })

  // Calculate stock status reactively
  const stockStatus = computed<StockStatus>(() => {
    return calculateStockStatus(stockQuantity.value, threshold.value)
  })

  // Helper computed properties
  const isAvailable = computed(() => {
    return stockStatus.value !== 'out_of_stock'
  })

  const isLowStock = computed(() => {
    return stockStatus.value === 'low_stock'
  })

  const isOutOfStock = computed(() => {
    return stockStatus.value === 'out_of_stock'
  })

  // Expose quantity for convenience
  const quantity = computed(() => stockQuantity.value)

  return {
    stockStatus,
    isAvailable,
    isLowStock,
    isOutOfStock,
    quantity,
    threshold
  }
}









