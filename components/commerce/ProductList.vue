<template>
  <ul class="productList" :class="listClasses">
    <li v-for="product in products" :key="product.id" class="productList__item">
      <ProductCard
        :product="product"
        :show-price="showPrice"
        :show-image="showImage"
        :clickable="clickable"
        @click="handleProductClick"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types/product'
import ProductCard from './ProductCard.vue'

interface ProductListProps {
  products: Product[]
  showPrice?: boolean
  showImage?: boolean
  clickable?: boolean
  layout?: 'grid' | 'list'
}

const props = withDefaults(defineProps<ProductListProps>(), {
  showPrice: true,
  showImage: true,
  clickable: true,
  layout: 'grid'
})

const emit = defineEmits<{
  (e: 'product-click', product: Product): void
}>()

const listClasses = computed(() => ({
  'productList--grid': props.layout === 'grid',
  'productList--list': props.layout === 'list'
}))

const handleProductClick = (product: Product): void => {
  emit('product-click', product)
}
</script>

<style scoped>
.productList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--spacing-md, 20px);
}

.productList--grid {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.productList--list {
  grid-template-columns: 1fr;
}

.productList__item {
  list-style: none;
}

/* Responsive grid adjustments */
@media (max-width: 767px) {
  .productList--grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm, 15px);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .productList--grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .productList--grid {
    grid-template-columns: repeat(5, 180px);
  }
}
</style>

