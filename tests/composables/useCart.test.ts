import { describe, it, expect } from 'vitest'
import { useCart } from '~/composables/useCart'
import type { Product, ProductVariant } from '~/types/product'

/**
 * Unit tests for useCart composable with stock validation
 * 
 * Tests stock validation before adding items to cart.
 * 
 * Acceptance Criteria Coverage (AC: 3):
 * - Stock checked before allowing add to cart - tested
 * - Cart prevents adding items when stock is insufficient - tested
 * - Clear error messages when stock unavailable - tested
 * - Stock validation occurs on frontend - tested
 */

describe('useCart', () => {
  describe('Stock Validation (AC: 3)', () => {
    it('should prevent adding out of stock product to cart', () => {
      const { addToCart, error } = useCart()
      
      const outOfStockProduct: Product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        currency: 'EUR',
        sku: 'TEST-001',
        inStock: false
      }

      const result = addToCart(outOfStockProduct)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('non è disponibile')
      expect(error.value).toBe(result.error)
    })

    it('should prevent adding out of stock variant to cart', () => {
      const { addToCart, error } = useCart()
      
      const variant: ProductVariant = {
        id: 1,
        type: 'size',
        value: '50ml',
        sku: 'TEST-001-50ML',
        stockQuantity: 0,
        stockStatus: 'out_of_stock'
      }

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        currency: 'EUR',
        sku: 'TEST-001',
        variants: [variant]
      }

      const result = addToCart(product, { variant })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('esaurita')
      expect(error.value).toBe(result.error)
    })

    it('should prevent adding product when requested quantity exceeds stock', () => {
      const { addToCart, error } = useCart()
      
      const variant: ProductVariant = {
        id: 1,
        type: 'size',
        value: '50ml',
        sku: 'TEST-001-50ML',
        stockQuantity: 5,
        stockStatus: 'low_stock'
      }

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        currency: 'EUR',
        sku: 'TEST-001',
        variants: [variant]
      }

      // Try to add 10 units when only 5 are available
      const result = addToCart(product, { variant, quantity: 10 })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Solo 5 unità disponibili')
      expect(error.value).toBe(result.error)
    })

    it('should allow adding product when stock is sufficient', () => {
      const { addToCart, items, error } = useCart()
      
      const variant: ProductVariant = {
        id: 1,
        type: 'size',
        value: '50ml',
        sku: 'TEST-001-50ML',
        stockQuantity: 10,
        stockStatus: 'in_stock'
      }

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        currency: 'EUR',
        sku: 'TEST-001',
        variants: [variant]
      }

      const result = addToCart(product, { variant, quantity: 5 })
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(error.value).toBeNull()
      expect(items.value.length).toBe(1)
      expect(items.value[0].quantity).toBe(5)
    })

    it('should prevent updating quantity to exceed stock', () => {
      const { addToCart, updateQuantity, items, error } = useCart()
      
      const variant: ProductVariant = {
        id: 1,
        type: 'size',
        value: '50ml',
        sku: 'TEST-001-50ML',
        stockQuantity: 5,
        stockStatus: 'low_stock'
      }

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        currency: 'EUR',
        sku: 'TEST-001',
        variants: [variant]
      }

      // Add 3 units (within stock)
      addToCart(product, { variant, quantity: 3 })
      expect(items.value.length).toBe(1)

      // Try to update to 10 units (exceeds stock of 5)
      const result = updateQuantity(product.id, 10, variant.id)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Solo 5 unità disponibili')
      expect(error.value).toBe(result.error)
      // Quantity should not be updated
      expect(items.value[0].quantity).toBe(3)
    })

    it('should prevent adding quantity that would exceed stock for existing item', () => {
      const { addToCart, items, error } = useCart()
      
      const variant: ProductVariant = {
        id: 1,
        type: 'size',
        value: '50ml',
        sku: 'TEST-001-50ML',
        stockQuantity: 5,
        stockStatus: 'low_stock'
      }

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        currency: 'EUR',
        sku: 'TEST-001',
        variants: [variant]
      }

      // Add 3 units
      addToCart(product, { variant, quantity: 3 })
      expect(items.value[0].quantity).toBe(3)

      // Try to add 3 more (total would be 6, but stock is only 5)
      const result = addToCart(product, { variant, quantity: 3 })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Solo 5 unità disponibili')
      expect(error.value).toBe(result.error)
      // Quantity should not be updated
      expect(items.value[0].quantity).toBe(3)
    })

    it('should allow updating quantity within stock limits', () => {
      const { addToCart, updateQuantity, items, error } = useCart()
      
      const variant: ProductVariant = {
        id: 1,
        type: 'size',
        value: '50ml',
        sku: 'TEST-001-50ML',
        stockQuantity: 10,
        stockStatus: 'in_stock'
      }

      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        currency: 'EUR',
        sku: 'TEST-001',
        variants: [variant]
      }

      addToCart(product, { variant, quantity: 3 })
      expect(items.value[0].quantity).toBe(3)

      const result = updateQuantity(product.id, 5, variant.id)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(error.value).toBeNull()
      expect(items.value[0].quantity).toBe(5)
    })

    it('should provide clear error messages in Italian', () => {
      const { addToCart } = useCart()
      
      const variant: ProductVariant = {
        id: 1,
        type: 'size',
        value: '50ml',
        sku: 'TEST-001-50ML',
        stockQuantity: 0,
        stockStatus: 'out_of_stock'
      }

      const product: Product = {
        id: 1,
        name: 'Prodotto Test',
        price: 99.99,
        currency: 'EUR',
        sku: 'TEST-001',
        variants: [variant]
      }

      const result = addToCart(product, { variant })
      
      expect(result.error).toContain('esaurita')
      expect(result.error).toContain('Prodotto Test')
      expect(result.error).toContain('50ml')
    })
  })
})









