# Strapi CMS Authentication and Security

## Overview

This document describes the authentication and security configuration for Strapi CMS integration.

## API Token Authentication

### Configuration

1. **Generate API Token in Strapi Admin:**
   - Navigate to Settings → API Tokens
   - Create a new API token with appropriate permissions
   - Copy the token value

2. **Store Token Securely:**
   - Add `STRAPI_API_TOKEN` to `.env` file (not committed to git)
   - Add `STRAPI_API_TOKEN=` to `.env.example` (documentation only)

3. **Runtime Configuration:**
   - Token is automatically loaded from `process.env.STRAPI_API_TOKEN`
   - Available in `nuxt.config.ts` runtime config (server-side only)
   - Automatically forwarded in API proxy requests

### Usage

The API token is automatically included in requests made through the API proxy:

```typescript
// Token is automatically added to Authorization header
const { data } = useStrapi('products')
```

### Manual Token Usage

If you need to use the token directly:

```typescript
const config = useRuntimeConfig()
const token = config.strapiApiToken // Server-side only

// Or use in API calls
const response = await $fetch('/api/strapi/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## Admin Authentication

### CMS Admin Panel

- Access Strapi admin at: `{STRAPI_URL}/admin`
- Create admin user during initial setup
- Use strong passwords and enable 2FA if available

### Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files to git
   - Use `.env.example` for documentation
   - Rotate API tokens regularly

2. **API Token Permissions:**
   - Use least privilege principle
   - Create separate tokens for different use cases
   - Revoke unused tokens

3. **HTTPS in Production:**
   - Always use HTTPS for Strapi API in production
   - Configure CORS properly
   - Use secure headers

4. **Token Storage:**
   - Store tokens in environment variables only
   - Never expose tokens in client-side code
   - Use server-side proxy for all API calls

## Implementation Details

### API Proxy Authentication

The API proxy (`server/api/strapi/[...].ts`) automatically handles authentication:

1. Checks for `Authorization` header in incoming request
2. Falls back to `STRAPI_API_TOKEN` from runtime config
3. Forwards token to Strapi API

### Error Handling

Authentication errors are handled gracefully:

```typescript
// Error response from Strapi
{
  error: {
    status: 401,
    message: "Unauthorized",
    details: { ... }
  }
}
```

## Future Enhancements

- JWT token refresh mechanism
- Role-based access control (RBAC) integration
- Webhook authentication for content updates
- Rate limiting configuration









