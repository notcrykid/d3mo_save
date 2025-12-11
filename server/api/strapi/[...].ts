export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const strapiUrl = config.public.strapiUrl || 'http://localhost:1337'
  
  // Get the path after /api/strapi/
  const path = getRouterParam(event, '_') || ''
  const isProductsRequest = path.startsWith('products')
  
  // Build the full Strapi API URL
  const targetUrl = `${strapiUrl}/api/${path}`
  
  // Get query parameters
  const query = getQuery(event)
  const queryString = new URLSearchParams(query as Record<string, string>).toString()
  const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl
  
  // Get request method and headers
  const method = getMethod(event)
  const headers: Record<string, string> = {}
  
  // Forward authorization header if present
  const authHeader = getHeader(event, 'authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  }
  
  // Forward API token from runtime config if available
  const apiToken = config.strapiApiToken
  if (apiToken && !authHeader) {
    headers['Authorization'] = `Bearer ${apiToken}`
  }
  
  // Set content type
  headers['Content-Type'] = 'application/json'
  
  try {
    // Get request body if present
    let body: any = undefined
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await readBody(event)
      } catch {
        // No body or already read
      }
    }
    
    // Forward request to Strapi
    const response = await $fetch(finalUrl, {
      method,
      headers,
      body,
      // Pass through response as-is
      responseType: 'json'
    })
    
    return response
  } catch (error: any) {
    // Provide a graceful mock fallback in development so the gallery remains usable
    if (process.dev && isProductsRequest) {
      const { mockProductsResponse } = await import('~/server/mocks/products')
      console.warn(`[strapi-proxy] ${error?.message || 'fetch failed'}, serving mock products`)
      return mockProductsResponse
    }
    
    // Handle errors gracefully
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Strapi API Error',
      message: error.message || 'Failed to fetch from Strapi API'
    })
  }
})



