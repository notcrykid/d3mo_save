import { ref, computed } from 'vue'
import type { Product, ProductVariant } from '~/types/product'
import { calculateStockStatus } from '~/utils/stockCalculations'

/**
 * Cart composable with stock validation
 * 
 * Manages cart state and operations with stock validation.
 * Prevents adding out of stock items and validates stock availability.
 * 
 * @returns Cart state and methods
 */
export interface CartItem {
  product: Product
  variant?: ProductVariant
  quantity: number
}

export interface AddToCartResult {
  success: boolean
  error?: string
}

export const useCart = () => {
  const items = ref<CartItem[]>([])
  const error = ref<string | null>(null)

  /**
   * Check if variant has sufficient stock
   */
  const checkVariantStock = (variant: ProductVariant, requestedQuantity: number): boolean => {
    if (!variant.stockQuantity || variant.stockQuantity <= 0) {
      return false
    }
    return variant.stockQuantity >= requestedQuantity
  }

  /**
   * Check if product has sufficient stock
   */
  const checkProductStock = (product: Product, variant: ProductVariant | undefined, requestedQuantity: number): boolean => {
    // If variant is specified, check variant stock
    if (variant) {
      return checkVariantStock(variant, requestedQuantity)
    }

    // If product has variants, check if any variant has stock
    if (product.variants && product.variants.length > 0) {
      // Check if any variant has sufficient stock
      return product.variants.some(v => {
        if (!v.stockQuantity || v.stockQuantity <= 0) return false
        return v.stockQuantity >= requestedQuantity
      })
    }

    // Product-level stock check (fallback)
    return product.inStock !== false
  }

  /**
   * Get stock status message
   */
  const getStockErrorMessage = (product: Product, variant?: ProductVariant): string => {
    if (variant) {
      if (variant.stockStatus === 'out_of_stock') {
        return `La variante "${variant.value}" di ${product.name} è esaurita`
      }
      if (variant.stockQuantity !== undefined && variant.stockQuantity !== null) {
        return `Solo ${variant.stockQuantity} unità disponibili per la variante "${variant.value}" di ${product.name}`
      }
    }
    
    if (product.variants && product.variants.length > 0) {
      return `${product.name} non è disponibile in magazzino`
    }
    
    return `${product.name} non è disponibile in magazzino`
  }

  /**
   * Add product to cart with stock validation
   */
  const addToCart = (
    product: Product, 
    options: {
      variant?: ProductVariant
      quantity?: number
    } = {}
  ): AddToCartResult => {
    const { variant, quantity = 1 } = options

    // Clear previous error
    error.value = null

    // Validate stock availability
    if (!checkProductStock(product, variant, quantity)) {
      const errorMessage = getStockErrorMessage(product, variant)
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    }

    // Check if item already exists in cart
    const existingItem = items.value.find(item => {
      if (item.product.id !== product.id) return false
      if (variant && item.variant) {
        return item.variant.id === variant.id
      }
      return !variant && !item.variant
    })

    if (existingItem) {
      // Check if adding quantity would exceed stock
      const totalQuantity = existingItem.quantity + quantity
      if (variant) {
        if (!checkVariantStock(variant, totalQuantity)) {
          const errorMessage = getStockErrorMessage(product, variant)
          error.value = errorMessage
          return {
            success: false,
            error: errorMessage
          }
        }
      }
      existingItem.quantity = totalQuantity
    } else {
      items.value.push({ product, variant, quantity })
    }

    console.log('Added to cart:', product.name, variant ? `(${variant.value})` : '', quantity)
    return { success: true }
  }

  const removeFromCart = (productId: string | number): void => {
    items.value = items.value.filter(item => item.product.id !== productId)
  }

  const updateQuantity = (productId: string | number, quantity: number, variantId?: string | number): AddToCartResult => {
    error.value = null

    const item = items.value.find(item => {
      if (item.product.id !== productId) return false
      if (variantId && item.variant) {
        return item.variant.id === variantId
      }
      return !variantId && !item.variant
    })

    if (!item) {
      const errorMessage = 'Prodotto non trovato nel carrello'
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    }

    // Validate stock availability for new quantity
    const variant = item.variant
    if (variant) {
      if (!checkVariantStock(variant, quantity)) {
        const errorMessage = getStockErrorMessage(item.product, variant)
        error.value = errorMessage
        return {
          success: false,
          error: errorMessage
        }
      }
    } else if (!checkProductStock(item.product, undefined, quantity)) {
      const errorMessage = getStockErrorMessage(item.product)
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    }

    item.quantity = quantity
    return { success: true }
  }

  const clearCart = (): void => {
    items.value = []
  }

  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  return {
    items: computed(() => items.value),
    itemCount,
    error: computed(() => error.value),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
}
