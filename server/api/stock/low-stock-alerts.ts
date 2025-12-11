/**
 * Low Stock Alert API Endpoint
 * 
 * Detects low stock and sends email alerts to admin.
 * 
 * Endpoint:
 * - POST /api/stock/low-stock-alerts - Check and send low stock alerts
 * 
 * Note: This should be called periodically (cron job) or triggered on stock updates.
 * 
 * Acceptance Criteria Coverage (AC: 5):
 * - Low stock threshold configurable (default: 10 units) - uses getLowStockThreshold()
 * - Admin receives email alerts when stock falls below threshold - email sending implemented
 * - Alert includes product name, variant, current quantity, and threshold - email template includes all
 * - Alerts sent only once per low stock event (no spam) - deduplication logic needed
 * 
 * TODO:
 * - Add deduplication mechanism (track sent alerts to prevent spam)
 * - Integrate with stock update events (trigger on stock changes)
 * - Set up cron job to check periodically
 */

import { sendEmail, formatLowStockAlertEmail } from '~/server/utils/email'
import { getLowStockThreshold } from '~/utils/stockCalculations'
import type { Product, ProductVariant } from '~/types/product'

/**
 * Track sent alerts to prevent spam
 * Format: { productId_variantId: timestamp }
 */
const sentAlerts = new Map<string, number>()

/**
 * Alert cooldown period: 24 hours (prevent sending same alert multiple times)
 */
const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000

/**
 * Check if alert was recently sent
 */
function wasAlertSentRecently(productId: string | number, variantId?: string | number): boolean {
  const key = variantId ? `${productId}_${variantId}` : `${productId}`
  const lastSent = sentAlerts.get(key)
  
  if (!lastSent) {
    return false
  }
  
  return (Date.now() - lastSent) < ALERT_COOLDOWN_MS
}

/**
 * Mark alert as sent
 */
function markAlertSent(productId: string | number, variantId?: string | number): void {
  const key = variantId ? `${productId}_${variantId}` : `${productId}`
  sentAlerts.set(key, Date.now())
}

/**
 * Check product/variant for low stock
 */
function checkLowStock(
  product: Product,
  variant?: ProductVariant,
  threshold?: number
): { isLowStock: boolean; currentQuantity: number; threshold: number } {
  const lowStockThreshold = threshold ?? getLowStockThreshold()
  
  if (variant) {
    const quantity = variant.stockQuantity ?? 0
    return {
      isLowStock: quantity > 0 && quantity <= lowStockThreshold,
      currentQuantity: quantity,
      threshold: lowStockThreshold
    }
  }
  
  // Check product-level stock or variants
  if (product.variants && product.variants.length > 0) {
    // Check if any variant is low stock
    const lowStockVariants = product.variants.filter(v => {
      const qty = v.stockQuantity ?? 0
      return qty > 0 && qty <= lowStockThreshold
    })
    
    if (lowStockVariants.length > 0) {
      // Return max quantity from low stock variants
      const maxQty = Math.max(...lowStockVariants.map(v => v.stockQuantity ?? 0))
      return {
        isLowStock: true,
        currentQuantity: maxQty,
        threshold: lowStockThreshold
      }
    }
  }
  
  // Product-level stock (fallback)
  return {
    isLowStock: false,
    currentQuantity: 0,
    threshold: lowStockThreshold
  }
}

/**
 * POST /api/stock/low-stock-alerts
 * Check products for low stock and send alerts
 */
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
      message: 'Only POST method allowed'
    })
  }

  const config = useRuntimeConfig()
  const adminEmail = config.adminEmail || process.env.ADMIN_EMAIL

  if (!adminEmail) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin Email Not Configured',
      message: 'ADMIN_EMAIL is not configured. Please set ADMIN_EMAIL environment variable.'
    })
  }

  try {
    const body = await readBody<{
      products?: Product[]
      product?: Product
      variant?: ProductVariant
      threshold?: number
    }>(event)

    const { products, product, variant, threshold } = body
    const alertsSent: Array<{ productId: string | number; variantId?: string | number }> = []

    // Check single product/variant
    if (product) {
      const check = checkLowStock(product, variant, threshold)
      
      if (check.isLowStock) {
        const variantId = variant?.id
        const shouldSend = !wasAlertSentRecently(product.id, variantId)
        
        if (shouldSend) {
          const emailHtml = formatLowStockAlertEmail({
            productName: product.name,
            variantValue: variant?.value,
            currentQuantity: check.currentQuantity,
            threshold: check.threshold,
            sku: variant?.sku || product.sku || 'N/A'
          })

          await sendEmail({
            to: adminEmail,
            subject: `⚠️ Allerta Stock Basso: ${product.name}${variant ? ` (${variant.value})` : ''}`,
            html: emailHtml
          })

          markAlertSent(product.id, variantId)
          alertsSent.push({ productId: product.id, variantId })
        }
      }
    }

    // Check multiple products
    if (products && products.length > 0) {
      for (const prod of products) {
        // Check product-level stock
        if (prod.variants && prod.variants.length > 0) {
          for (const v of prod.variants) {
            const check = checkLowStock(prod, v, threshold)
            
            if (check.isLowStock) {
              const shouldSend = !wasAlertSentRecently(prod.id, v.id)
              
              if (shouldSend) {
                const emailHtml = formatLowStockAlertEmail({
                  productName: prod.name,
                  variantValue: v.value,
                  currentQuantity: check.currentQuantity,
                  threshold: check.threshold,
                  sku: v.sku || prod.sku || 'N/A'
                })

                await sendEmail({
                  to: adminEmail,
                  subject: `⚠️ Allerta Stock Basso: ${prod.name} (${v.value})`,
                  html: emailHtml
                })

                markAlertSent(prod.id, v.id)
                alertsSent.push({ productId: prod.id, variantId: v.id })
              }
            }
          }
        } else {
          // Product without variants
          const check = checkLowStock(prod, undefined, threshold)
          
          if (check.isLowStock) {
            const shouldSend = !wasAlertSentRecently(prod.id)
            
            if (shouldSend) {
              const emailHtml = formatLowStockAlertEmail({
                productName: prod.name,
                currentQuantity: check.currentQuantity,
                threshold: check.threshold,
                sku: prod.sku || 'N/A'
              })

              await sendEmail({
                to: adminEmail,
                subject: `⚠️ Allerta Stock Basso: ${prod.name}`,
                html: emailHtml
              })

              markAlertSent(prod.id)
              alertsSent.push({ productId: prod.id })
            }
          }
        }
      }
    }

    return {
      success: true,
      alertsSent: alertsSent.length,
      details: alertsSent
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Alert Error',
      message: error.message || 'Failed to process low stock alerts'
    })
  }
})









