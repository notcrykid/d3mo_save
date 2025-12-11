# Strapi CMS Media Library Configuration

## Overview

This document describes the media library configuration for Strapi CMS.

## Media Library Setup

### Default Configuration (Local Storage)

Strapi uses local file storage by default:

1. **Storage Location:**
   - Files stored in `public/uploads/` directory
   - Accessible via `{STRAPI_URL}/uploads/{filename}`

2. **Configuration:**
   - No additional configuration required
   - Works out of the box for development

### Cloudinary Integration (Optional)

For production, Cloudinary integration is recommended:

1. **Install Cloudinary Plugin:**
   ```bash
   npm install @strapi/provider-upload-cloudinary
   ```

2. **Configure in Strapi:**
   - Add Cloudinary credentials to Strapi config
   - Update upload provider settings
   - Configure image transformations

3. **Environment Variables:**
   ```
   CLOUDINARY_NAME=your-cloud-name
   CLOUDINARY_KEY=your-api-key
   CLOUDINARY_SECRET=your-api-secret
   ```

## Media Upload Settings

### Image Formats

Supported formats:
- JPEG, PNG, WebP, GIF, SVG

### Image Sizes

Strapi automatically generates multiple sizes:
- **Thumbnail**: 150x150px
- **Small**: 500px width
- **Medium**: 750px width
- **Large**: 1000px width

### Configuration

Configure in Strapi Admin:
1. Go to Settings → Media Library
2. Set maximum file size (default: 10MB)
3. Configure allowed file types
4. Set image quality settings

## API Usage

### Upload Media

```typescript
// Upload via Strapi Admin or API
// POST /api/upload
const formData = new FormData()
formData.append('files', file)
formData.append('ref', 'api::product.product')
formData.append('refId', productId)
formData.append('field', 'images')

const response = await $fetch('/api/strapi/upload', {
  method: 'POST',
  body: formData
})
```

### Fetch Media

```typescript
// Get media file
const { data: media } = useStrapi(`upload/files/${fileId}`)

// Get media URL
const imageUrl = media.value?.url
// Or use format variants
const thumbnailUrl = media.value?.formats?.thumbnail?.url
```

### Media in Product

```typescript
// Products with populated images
const { data: products } = useStrapi('products', {
  query: {
    populate: {
      images: {
        fields: ['url', 'formats', 'alternativeText']
      }
    }
  }
})

// Access image URLs
products.value?.forEach(product => {
  const mainImage = product.images?.[0]?.url
  const thumbnail = product.images?.[0]?.formats?.thumbnail?.url
})
```

## TypeScript Types

Media types are defined in `types/strapi.d.ts`:

- `StrapiMedia` - Media file structure
- `StrapiMediaFormat` - Image format variants

## Best Practices

1. **Optimize Images:**
   - Use WebP format when possible
   - Compress images before upload
   - Use appropriate image sizes

2. **Alt Text:**
   - Always provide alternative text for images
   - Important for accessibility and SEO

3. **CDN Usage:**
   - Use Cloudinary or similar CDN in production
   - Improves load times and reduces server load

4. **Caching:**
   - Media files are cached by browser
   - Use cache headers appropriately
   - Consider CDN caching strategies

## Future Enhancements

- Automatic image optimization
- Video upload support
- Document upload support
- Media library search and filtering
- Bulk upload functionality









