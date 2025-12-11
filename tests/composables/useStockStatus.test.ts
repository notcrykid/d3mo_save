import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { useStockStatus } from '~/composables/useStockStatus'

/**
 * Unit tests for useStockStatus composable
 * 
 * Tests reactive stock status calculations for product variants.
 * 
 * Acceptance Criteria Coverage (AC: 1, 2):
 * - Stock status calculated in real-time (in stock, low stock, out of stock) - tested
 * - Reactive stock status updates - tested
 */

describe('useStockStatus', () => {
  describe('with ref stockQuantity', () => {
    it('should calculate out_of_stock for zero quantity', () => {
      const stockQuantity = ref(0)
      const { stockStatus, isAvailable, isOutOfStock } = useStockStatus(stockQuantity)

      expect(stockStatus.value).toBe('out_of_stock')
      expect(isAvailable.value).toBe(false)
      expect(isOutOfStock.value).toBe(true)
    })

    it('should calculate out_of_stock for undefined quantity', () => {
      const stockQuantity = ref<number | undefined>(undefined)
      const { stockStatus, isAvailable, isOutOfStock } = useStockStatus(stockQuantity)

      expect(stockStatus.value).toBe('out_of_stock')
      expect(isAvailable.value).toBe(false)
      expect(isOutOfStock.value).toBe(true)
    })

    it('should calculate low_stock for quantity between 1 and threshold', () => {
      const stockQuantity = ref(5)
      const { stockStatus, isAvailable, isLowStock } = useStockStatus(stockQuantity)

      expect(stockStatus.value).toBe('low_stock')
      expect(isAvailable.value).toBe(true)
      expect(isLowStock.value).toBe(true)
    })

    it('should calculate in_stock for quantity above threshold', () => {
      const stockQuantity = ref(15)
      const { stockStatus, isAvailable, isLowStock, isOutOfStock } = useStockStatus(stockQuantity)

      expect(stockStatus.value).toBe('in_stock')
      expect(isAvailable.value).toBe(true)
      expect(isLowStock.value).toBe(false)
      expect(isOutOfStock.value).toBe(false)
    })

    it('should react to quantity changes', () => {
      const stockQuantity = ref(15)
      const { stockStatus, isAvailable } = useStockStatus(stockQuantity)

      expect(stockStatus.value).toBe('in_stock')
      expect(isAvailable.value).toBe(true)

      // Update quantity
      stockQuantity.value = 5
      expect(stockStatus.value).toBe('low_stock')
      expect(isAvailable.value).toBe(true)

      // Update to out of stock
      stockQuantity.value = 0
      expect(stockStatus.value).toBe('out_of_stock')
      expect(isAvailable.value).toBe(false)
    })
  })

  describe('with computed stockQuantity', () => {
    it('should work with computed ref', () => {
      const baseQuantity = ref(10)
      const stockQuantity = computed(() => baseQuantity.value)
      const { stockStatus, isAvailable } = useStockStatus(stockQuantity)

      expect(stockStatus.value).toBe('low_stock')
      expect(isAvailable.value).toBe(true)

      baseQuantity.value = 20
      expect(stockStatus.value).toBe('in_stock')
    })
  })

  describe('with custom threshold', () => {
    it('should use custom threshold when provided', () => {
      const stockQuantity = ref(5)
      const { stockStatus, threshold } = useStockStatus(stockQuantity, { threshold: 5 })

      expect(threshold.value).toBe(5)
      expect(stockStatus.value).toBe('low_stock')

      stockQuantity.value = 6
      expect(stockStatus.value).toBe('in_stock')
    })

    it('should handle different threshold values', () => {
      const stockQuantity = ref(10)
      
      const lowThreshold = useStockStatus(stockQuantity, { threshold: 5 })
      expect(lowThreshold.stockStatus.value).toBe('in_stock')

      const highThreshold = useStockStatus(stockQuantity, { threshold: 15 })
      expect(highThreshold.stockStatus.value).toBe('low_stock')
    })
  })

  describe('helper properties', () => {
    it('should expose quantity', () => {
      const stockQuantity = ref(10)
      const { quantity } = useStockStatus(stockQuantity)

      expect(quantity.value).toBe(10)

      stockQuantity.value = 20
      expect(quantity.value).toBe(20)
    })

    it('should expose threshold', () => {
      const stockQuantity = ref(10)
      const { threshold } = useStockStatus(stockQuantity, { threshold: 15 })

      expect(threshold.value).toBe(15)
    })

    it('should correctly identify stock states', () => {
      const inStock = useStockStatus(ref(20))
      expect(inStock.isAvailable.value).toBe(true)
      expect(inStock.isLowStock.value).toBe(false)
      expect(inStock.isOutOfStock.value).toBe(false)

      const lowStock = useStockStatus(ref(5))
      expect(lowStock.isAvailable.value).toBe(true)
      expect(lowStock.isLowStock.value).toBe(true)
      expect(lowStock.isOutOfStock.value).toBe(false)

      const outOfStock = useStockStatus(ref(0))
      expect(outOfStock.isAvailable.value).toBe(false)
      expect(outOfStock.isLowStock.value).toBe(false)
      expect(outOfStock.isOutOfStock.value).toBe(true)
    })
  })
})









