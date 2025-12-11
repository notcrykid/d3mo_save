<template>
  <li class="productCardSkeleton">
    <div class="imgWrapSkeleton"></div>
    <footer class="footerSkeleton">
      <div class="dotSkeleton"></div>
      <div class="textSkeleton"></div>
    </footer>
  </li>
</template>

<script setup lang="ts">
// Loading skeleton for ProductCard
</script>

<style scoped>
.productCardSkeleton {
  display: list-item;
  list-style: none;
  animation: pulse 1.5s ease-in-out infinite;
}

.imgWrapSkeleton {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: var(--color-neutral-surface, #f5f5f5);
  border-radius: 0;
}

.footerSkeleton {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  padding: 0;
  margin: 7.5px 0 0 0;
}

.dotSkeleton {
  width: 6px;
  height: 6px;
  background-color: var(--color-neutral-surface, #f5f5f5);
  border-radius: 50%;
}

.textSkeleton {
  width: 100px;
  height: 8px;
  background-color: var(--color-neutral-surface, #f5f5f5);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .productCardSkeleton {
    animation: none;
  }
}
</style>









