/**
 * Stock Notification API Endpoint
 * 
 * Handles "notify when available" feature for customers.
 * 
 * Endpoints:
 * - POST /api/stock/notifications - Subscribe to stock availability notification
 * - DELETE /api/stock/notifications/:id - Unsubscribe from notification
 * - GET /api/stock/notifications - List user notifications (by email)
 * 
 * Acceptance Criteria Coverage (AC: 6):
 * - "Notify when available" option for customers on out of stock products - API endpoint created
 * - Customer can enter email to receive notification when product back in stock - subscription endpoint
 * - Email sent automatically when stock quantity increases above zero - notification sending logic
 * - Notification preference stored and manageable - data model created
 * 
 * TODO:
 * - Replace in-memory store with persistent storage (database/Strapi)
 * - Integrate with stock update events (trigger notifications on stock increase)
 * - Add unsubscribe functionality
 */

import { sendEmail, formatStockAvailableEmail } from '~/server/utils/email'
import type { CreateNotificationRequest, NotificationResponse, StockNotification } from '~/types/stock'

// TODO: Replace with actual storage (database or Strapi)
// This is a placeholder in-memory store for development
const notifications = new Map<string, StockNotification>()

/**
 * Generate notification ID
 */
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Find notification by product/variant/email
 */
function findNotification(
  productId: string | number,
  variantId: string | number | undefined,
  email: string
): StockNotification | undefined {
  for (const notification of notifications.values()) {
    if (
      notification.productId === productId &&
      notification.variantId === variantId &&
      notification.email === email &&
      !notification.notified
    ) {
      return notification
    }
  }
  return undefined
}

/**
 * POST /api/stock/notifications
 * Subscribe to stock availability notification
 */
export default defineEventHandler(async (event): Promise<NotificationResponse> => {
  const method = getMethod(event)

  if (method === 'POST') {
    try {
      const body = await readBody<CreateNotificationRequest>(event)
      const { productId, variantId, email } = body

      // Validate input
      if (!productId || !email) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid request',
          message: 'productId and email are required'
        })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid email',
          message: 'Please provide a valid email address'
        })
      }

      // Check if notification already exists
      const existing = findNotification(productId, variantId, email)
      if (existing) {
        return {
          notification: existing,
          success: true,
          message: 'You are already subscribed to notifications for this product'
        }
      }

      // Create notification
      const notificationId = generateNotificationId()
      const notification: StockNotification = {
        id: notificationId,
        productId,
        variantId,
        email,
        notified: false,
        createdAt: new Date().toISOString()
      }

      // Store notification
      notifications.set(notificationId, notification)

      return {
        notification,
        success: true,
        message: 'Successfully subscribed to stock availability notifications'
      }
    } catch (error: any) {
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Notification Error',
        message: error.message || 'Failed to create notification subscription'
      })
    }
  }

  // GET /api/stock/notifications?email=...
  if (method === 'GET') {
    const query = getQuery(event)
    const email = query.email as string

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing email',
        message: 'Email query parameter is required'
      })
    }

    const userNotifications = Array.from(notifications.values()).filter(
      n => n.email === email && !n.notified
    )

    return {
      notifications: userNotifications,
      success: true
    }
  }

  // DELETE /api/stock/notifications/:id
  if (method === 'DELETE') {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing ID',
        message: 'Notification ID is required'
      })
    }

    const notification = notifications.get(id)
    if (!notification) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Notification not found'
      })
    }

    notifications.delete(id)

    return {
      notification,
      success: true,
      message: 'Notification subscription removed'
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
    message: `Method ${method} not allowed`
  })
})

/**
 * Send stock availability notifications
 * 
 * This function should be called when stock increases above zero.
 * Typically triggered by stock update events.
 * 
 * @param productId - Product ID
 * @param variantId - Variant ID (optional)
 * @param productName - Product name for email
 * @param variantValue - Variant value for email (optional)
 * @param productUrl - Product URL for email
 * @param sku - Product SKU
 */
export async function sendStockAvailabilityNotifications(
  productId: string | number,
  variantId: string | number | undefined,
  productName: string,
  variantValue: string | undefined,
  productUrl: string,
  sku: string
): Promise<{ sent: number }> {
  // Find all pending notifications for this product/variant
  const pendingNotifications = Array.from(notifications.values()).filter(
    n => n.productId === productId && n.variantId === variantId && !n.notified
  )

  let sentCount = 0

  for (const notification of pendingNotifications) {
    try {
      const emailHtml = formatStockAvailableEmail({
        productName,
        variantValue,
        productUrl,
        sku
      })

      await sendEmail({
        to: notification.email,
        subject: `✅ ${productName}${variantValue ? ` (${variantValue})` : ''} è ora disponibile`,
        html: emailHtml
      })

      // Mark as notified
      notification.notified = true
      notification.notifiedAt = new Date().toISOString()
      notifications.set(notification.id, notification)
      sentCount++
    } catch (error) {
      // Log error but continue with other notifications
      console.error(`Failed to send notification to ${notification.email}:`, error)
    }
  }

  return { sent: sentCount }
}









