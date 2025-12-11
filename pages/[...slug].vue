<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-title">404</h1>
      <h2 class="error-heading">Page Not Found</h2>
      <p class="error-message">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <NuxtLink to="/" class="home-link">
        Return to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 error page - catch-all route for unknown pages
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: var(--spacing-xl);
}

.error-content {
  text-align: center;
  max-width: 600px;
}

.error-title {
  font-size: clamp(64px, 12vw, 120px);
  font-family: var(--font-primary);
  color: var(--color-primary-ink);
  line-height: 1;
  margin: 0 0 var(--spacing-md) 0;
  font-weight: 700;
}

.error-heading {
  font-size: var(--font-size-h2);
  font-family: var(--font-primary);
  color: var(--color-primary-ink);
  line-height: var(--line-height-h2);
  margin: 0 0 var(--spacing-lg) 0;
  font-weight: 700;
}

.error-message {
  font-size: var(--font-size-body);
  font-family: var(--font-primary);
  color: var(--color-primary-ink);
  line-height: var(--line-height-body);
  margin: 0 0 var(--spacing-xl) 0;
  opacity: 0.8;
}

.home-link {
  display: inline-block;
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: var(--color-primary-ink);
  color: var(--color-bg-base);
  text-decoration: none;
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
  border-radius: 4px;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.home-link:hover {
  background-color: var(--color-primary-ink-hover);
  transform: translateY(-1px);
}

.home-link:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: 2px;
}

.home-link:active {
  transform: translateY(0);
}
</style>

