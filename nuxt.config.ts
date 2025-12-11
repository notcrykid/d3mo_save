// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./styles/reset.css', './styles/variables.css'],
  
  // Nuxt Image module for image optimization
  modules: ['@nuxt/image'],
  
  image: {
    // Provider configuration
    providers: {
      // Strapi CMS images
      strapi: {
        baseURL: process.env.STRAPI_URL || 'http://localhost:1337'
      }
    },
    // Image optimization settings
    quality: 80,
    format: ['webp', 'avif'],
    // Lazy loading enabled by default
    lazy: true
  },
  
  // ISR (Incremental Static Regeneration) configuration
  routeRules: {
    // Product gallery page - ISR with 1 hour revalidation
    '/gallery': {
      isr: 3600 // Revalidate every hour (3600 seconds)
    },
    // Product detail pages - ISR with 1 hour revalidation
    '/products/**': {
      isr: 3600 // Revalidate every hour (3600 seconds)
    }
  },
  
  // Runtime configuration for Strapi CMS
  runtimeConfig: {
    // Private keys (server-side only)
    strapiApiToken: process.env.STRAPI_API_TOKEN || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@d3mo.com',
    adminEmail: process.env.ADMIN_EMAIL || '',
    
    // Public keys (exposed to client)
    public: {
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
      lowStockThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10)
    }
  },
  
  // Language Routing Structure (Prepared for Epic 10)
  // ==================================================
  // The i18n structure will be fully implemented in Epic 10: Multi-language & Multi-currency
  // 
  // Planned routing structure:
  // - / (root) = Italian (default language)
  // - /en/ = English
  // 
  // Implementation will use @nuxtjs/i18n module:
  // modules: ['@nuxtjs/i18n'],
  // i18n: {
  //   locales: [
  //     { code: 'it', iso: 'it-IT', file: 'it.json', name: 'Italiano' },
  //     { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' }
  //   ],
  //   defaultLocale: 'it',
  //   strategy: 'prefix_except_default',
  //   vueI18n: './i18n.config.ts'
  // }
  //
  // Current routing structure:
  // - All routes work without language prefix (defaults to Italian)
  // - Structure is ready for i18n module integration in Epic 10
  app: {
    head: {
      title: 'd3mo - Luxury Fragrance & Beauty E-commerce',
      meta: [
        { 
          name: 'description', 
          content: 'Discover luxury fragrances and beauty products with an immersive, cinematic shopping experience.' 
        },
        { 
          name: 'viewport', 
          content: 'width=device-width, initial-scale=1' 
        },
        { 
          charset: 'utf-8' 
        }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Libre+Baskerville:wght@400;700&display=swap' 
        }
      ]
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
      duration: 300
    }
  }
})
