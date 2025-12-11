<template>
  <div 
    class="burger-search-bar"
    role="search"
    aria-label="Search products"
  >
    <input
      ref="searchInput"
      type="text"
      class="burger-search-bar__input"
      :placeholder="placeholder"
      :value="modelValue"
      @input="handleInput"
      @keydown.enter="handleSubmit"
      aria-label="Search products"
    />
    <button 
      type="button"
      class="burger-search-bar__icon"
      @click="handleSubmit"
      aria-label="Submit search"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface BurgerSearchBarProps {
  modelValue?: string
  placeholder?: string
  autofocus?: boolean
}

const props = withDefaults(defineProps<BurgerSearchBarProps>(), {
  modelValue: '',
  placeholder: 'Search products...',
  autofocus: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const searchInput = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleSubmit = (): void => {
  emit('search', props.modelValue || '')
}

// Focus input when component is mounted (if autofocus is true)
onMounted(() => {
  if (props.autofocus && searchInput.value) {
    searchInput.value.focus()
  }
})

// Expose focus method for parent components
defineExpose({
  focus: () => searchInput.value?.focus()
})
</script>

<style scoped>
.burger-search-bar {
  position: relative;
  width: clamp(280px, 70vw, 600px);
  display: flex;
  align-items: center;
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-neutral-surface);
  border-radius: 8px;
  overflow: hidden;
  animation: searchBarEnter 300ms cubic-bezier(0.33, 0, 0.2, 1) forwards;
  min-height: 44px; /* Match Sign In button height for alignment */
}

@keyframes searchBarEnter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.burger-search-bar__input {
  flex: 1;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-secondary);
  font-size: 14px;
  color: var(--color-primary-ink);
  background: transparent;
  border: none;
  outline: none;
  letter-spacing: 0.02em;
}

.burger-search-bar__input::placeholder {
  color: var(--color-primary-ink);
  opacity: 0.5;
}

.burger-search-bar__input:focus {
  outline: none;
}

.burger-search-bar:focus-within {
  border-color: var(--color-border-strong);
  box-shadow: 0 0 0 2px var(--color-border-strong);
}

.burger-search-bar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  color: var(--color-primary-ink);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  min-width: 44px;
  min-height: 44px;
}

.burger-search-bar__icon:hover {
  opacity: 1;
}

.burger-search-bar__icon:focus {
  outline: 2px solid var(--color-border-strong);
  outline-offset: -2px;
}

/* Responsive */
@media (min-width: 768px) and (max-width: 1023px) {
  .burger-search-bar {
    width: clamp(350px, 70vw, 550px);
  }
}

@media (min-width: 1024px) {
  .burger-search-bar {
    width: clamp(400px, 60vw, 700px);
  }

  .burger-search-bar__input {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: 15px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .burger-search-bar {
    animation: none;
    opacity: 1;
    transform: none;
  }
  
  .burger-search-bar__icon {
    transition: none;
  }
}
</style>

