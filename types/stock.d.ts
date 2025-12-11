/**
 * Stock management TypeScript types
 * 
 * Types for stock reservations, notifications, and stock management operations.
 */

/**
 * Stock reservation data model
 * 
 * Represents a temporary stock reservation during checkout.
 * Reservations expire after 15 minutes and release stock back to available pool.
 */
export interface StockReservation {
  id: string
  variantId: string | number
  productId: string | number
  quantity: number
  expiresAt: Date | string
  createdAt: Date | string
  sessionId?: string // Optional session identifier for cleanup
}

/**
 * Stock reservation creation request
 */
export interface CreateReservationRequest {
  variantId: string | number
  productId: string | number
  quantity: number
  sessionId?: string
}

/**
 * Stock reservation response
 */
export interface ReservationResponse {
  reservation: StockReservation
  success: boolean
  message?: string
}

/**
 * Stock notification subscription
 * 
 * Represents a customer subscription to be notified when a product becomes available.
 */
export interface StockNotification {
  id: string
  productId: string | number
  variantId?: string | number
  email: string
  notified: boolean
  createdAt: Date | string
  notifiedAt?: Date | string
}

/**
 * Stock notification subscription request
 */
export interface CreateNotificationRequest {
  productId: string | number
  variantId?: string | number
  email: string
}

/**
 * Stock notification subscription response
 */
export interface NotificationResponse {
  notification: StockNotification
  success: boolean
  message?: string
}









