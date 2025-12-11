<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
    :aria-busy="loading"
    :aria-disabled="disabled || loading"
  >
    <span v-if="loading" class="button__loader" aria-hidden="true"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary'
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  disabled: false,
  loading: false,
  size: 'md',
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  return [
    'button',
    `button--${props.variant}`,
    `button--${props.size}`,
    {
      'button--disabled': props.disabled,
      'button--loading': props.loading
    }
  ]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  font-weight: 400;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  text-decoration: none;
  background-color: transparent;
  color: var(--color-primary-ink);
}

/* Variants */
.button--primary {
  background-color: var(--color-primary-ink);
  color: var(--color-bg-base);
  border-color: var(--color-primary-ink);
}

.button--primary:hover:not(.button--disabled):not(.button--loading) {
  background-color: var(--color-primary-ink-hover);
  border-color: var(--color-primary-ink-hover);
}

.button--primary:focus-visible {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.button--secondary {
  background-color: var(--color-accent-rose);
  color: var(--color-primary-ink);
  border-color: var(--color-accent-rose);
}

.button--secondary:hover:not(.button--disabled):not(.button--loading) {
  background-color: var(--color-accent-rose-hover);
  border-color: var(--color-accent-rose-hover);
}

.button--secondary:focus-visible {
  outline: 2px solid var(--color-accent-rose);
  outline-offset: 2px;
}

.button--tertiary {
  background-color: transparent;
  color: var(--color-primary-ink);
  border-color: var(--color-neutral-surface);
}

.button--tertiary:hover:not(.button--disabled):not(.button--loading) {
  background-color: var(--color-neutral-surface);
  border-color: var(--color-primary-ink);
}

.button--tertiary:focus-visible {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

/* Sizes */
.button--sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-caption);
  min-height: 32px;
}

.button--md {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-body);
  min-height: 44px;
}

.button--lg {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-h3);
  min-height: 56px;
}

/* States */
.button--disabled,
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.button--loading {
  cursor: wait;
  position: relative;
}

.button__loader {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Touch target compliance: minimum 44x44px on mobile */
@media (max-width: 767px) {
  .button--sm {
    min-width: 44px;
    min-height: 44px;
    padding: 12px 16px; /* Ensure 44x44px touch target */
  }
  
  .button--md {
    min-width: 44px;
    min-height: 44px;
  }
  
  .button--lg {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>

