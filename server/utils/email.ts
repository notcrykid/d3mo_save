/**
 * Email service utilities
 * 
 * Handles email sending via Resend API.
 * 
 * Note: Requires RESEND_API_KEY environment variable.
 * Install: npm install resend
 * 
 * Usage:
 * ```ts
 * import { sendEmail } from '~/server/utils/email'
 * await sendEmail({
 *   to: 'admin@example.com',
 *   subject: 'Low Stock Alert',
 *   html: '<p>Product is low in stock</p>'
 * })
 * ```
 */

/**
 * Email sending options
 */
export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

/**
 * Send email via Resend
 * 
 * @param options - Email options
 * @returns Promise resolving to email result
 */
export async function sendEmail(options: EmailOptions): Promise<{ id: string; success: boolean }> {
  const config = useRuntimeConfig()
  const apiKey = config.resendApiKey || process.env.RESEND_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Email Service Not Configured',
      message: 'RESEND_API_KEY is not configured. Please set RESEND_API_KEY environment variable.'
    })
  }

  // Dynamic import to avoid requiring resend at build time if not installed
  let Resend: any
  try {
    Resend = (await import('resend')).Resend
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Email Library Not Installed',
      message: 'Resend package is not installed. Run: npm install resend'
    })
  }

  const resend = new Resend(apiKey)

  const from = options.from || config.resendFromEmail || 'noreply@d3mo.com'

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo
    })

    if (result.error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Email Send Failed',
        message: result.error.message || 'Failed to send email'
      })
    }

    return {
      id: result.data?.id || '',
      success: true
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Email Error',
      message: error.message || 'Failed to send email'
    })
  }
}

/**
 * Format email template for low stock alert
 */
export function formatLowStockAlertEmail(data: {
  productName: string
  variantValue?: string
  currentQuantity: number
  threshold: number
  sku: string
}): string {
  const variantInfo = data.variantValue ? ` (Variante: ${data.variantValue})` : ''
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .product-info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ff9800; }
        .quantity { font-size: 24px; font-weight: bold; color: #ff9800; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Allerta Stock Basso</h1>
        </div>
        <div class="content">
          <p>Il prodotto seguente ha raggiunto il livello di stock minimo:</p>
          <div class="product-info">
            <h2>${data.productName}${variantInfo}</h2>
            <p><strong>SKU:</strong> ${data.sku}</p>
            <p class="quantity">Quantità attuale: ${data.currentQuantity}</p>
            <p><strong>Soglia minima:</strong> ${data.threshold} unità</p>
          </div>
          <p>Si prega di verificare e rifornire il magazzino se necessario.</p>
        </div>
        <div class="footer">
          <p>Questo è un messaggio automatico dal sistema di gestione stock.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Format email template for stock availability notification
 */
export function formatStockAvailableEmail(data: {
  productName: string
  variantValue?: string
  productUrl: string
  sku: string
}): string {
  const variantInfo = data.variantValue ? ` (Variante: ${data.variantValue})` : ''
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2e7d32; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .product-info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2e7d32; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Prodotto Disponibile</h1>
        </div>
        <div class="content">
          <p>Buone notizie! Il prodotto che stavi aspettando è ora disponibile:</p>
          <div class="product-info">
            <h2>${data.productName}${variantInfo}</h2>
            <p><strong>SKU:</strong> ${data.sku}</p>
          </div>
          <p style="text-align: center;">
            <a href="${data.productUrl}" class="cta-button">Visualizza Prodotto</a>
          </p>
        </div>
        <div class="footer">
          <p>Questo è un messaggio automatico dal sistema di notifiche stock.</p>
          <p><a href="${data.productUrl}?unsubscribe=true">Annulla iscrizione</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}









