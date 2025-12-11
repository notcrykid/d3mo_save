<template>
  <div class="layout">
    <!-- Loading content overlay during page transitions -->
    <Teleport to="body">
      <Transition name="loading">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-content">LOADING CONTENT</div>
        </div>
      </Transition>
    </Teleport>

    <!-- Header with hamburger menu placeholder (top-left) -->
    <header class="header">
      <div class="header-content">
        <div class="hamburger-menu-placeholder">
          <!-- Hamburger menu placeholder - will be implemented in Epic 2 -->
          <button 
            class="hamburger-button" 
            aria-label="Menu"
            type="button"
          >
            <span class="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main content area with page slot -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer placeholder (bottom) -->
    <footer class="footer">
      <div class="footer-content">
        <!-- Footer placeholder - will be implemented in Epic 2 -->
        <p class="footer-text">Footer placeholder</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const router = useRouter()
const isLoading = ref(false)

let loadingTimeout: ReturnType<typeof setTimeout> | null = null

const startLoading = () => {
  loadingTimeout = setTimeout(() => {
    isLoading.value = true
  }, 50) // Small delay to avoid flash on fast transitions
}

const stopLoading = () => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
  isLoading.value = false
}

onMounted(() => {
  router.beforeEach(() => {
    startLoading()
  })
  
  router.afterEach(() => {
    stopLoading()
  })
})

onBeforeUnmount(() => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
  }
})
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-base);
  color: var(--color-primary-ink);
  font-family: var(--font-primary);
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg-base);
  border-bottom: 1px solid var(--color-neutral-surface);
  padding: var(--spacing-md) var(--spacing-lg);
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.hamburger-menu-placeholder {
  display: flex;
  align-items: center;
}

.hamburger-button {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-ink);
  transition: opacity 0.2s ease;
}

.hamburger-button:hover {
  opacity: 0.7;
}

.hamburger-button:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: 2px;
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 24px;
  height: 18px;
}

.hamburger-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary-ink);
  transition: all 0.2s ease;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.footer {
  margin-top: auto;
  background-color: var(--color-neutral-surface);
  border-top: 1px solid var(--color-border-strong);
  padding: var(--spacing-lg);
}

.footer-content {
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
}

.footer-text {
  margin: 0;
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  opacity: 0.7;
}

/* Responsive design */
@media (min-width: 768px) {
  .header {
    padding: var(--spacing-md) var(--spacing-xl);
  }

  .main-content {
    padding: var(--spacing-xl);
  }

  .footer {
    padding: var(--spacing-xl);
  }
}

@media (min-width: 1024px) {
  .header-content,
  .main-content,
  .footer-content {
    max-width: 1200px;
  }
}
</style>

<style>
/* Loading overlay styles (global - teleported to body) */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-base);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.loading-content {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body);
  color: var(--color-primary-ink);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Loading transition */
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.2s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .loading-enter-active,
  .loading-leave-active {
    transition: none;
  }

  .loading-overlay {
    display: none;
  }
}
</style>

