<template>
  <div>
    <!-- Loading Sequence -->
    <LoadingSequence 
      :show="showLoading" 
      @complete="handleLoadingComplete" 
    />
    
    <!-- Hide content until loading is complete -->
    <div v-show="!showLoading" class="app-content">
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import LoadingSequence from '~/components/motion/LoadingSequence.vue'

const { shouldShowLoading, setLoadingSeen } = useLoadingCookie()

// Initialize to true to prevent content flash, then check cookie on mount
// This ensures loading shows immediately if needed
const showLoading = ref(true)

// Check on mount if loading should actually be shown
onMounted(() => {
  // Check URL parameter to force show loading (for testing)
  const urlParams = new URLSearchParams(window.location.search)
  const forceShow = urlParams.get('showLoading') === 'true'
  
  // If cookie exists and not forcing, hide loading immediately
  if (!forceShow && !shouldShowLoading.value) {
    showLoading.value = false
  }
  // Otherwise keep it true (it will be hidden when loading completes)
})

// Watch for changes in shouldShowLoading (in case cookie is set elsewhere)
watch(shouldShowLoading, (newValue) => {
  if (newValue && !showLoading.value) {
    showLoading.value = true
  }
})

// Handle loading completion
const handleLoadingComplete = () => {
  // Set cookie to skip loading on next visit
  setLoadingSeen()
  showLoading.value = false
}
</script>

<style>
/* Hide content initially to prevent flash before loading sequence */
.app-content {
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* Page transition styles */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>


