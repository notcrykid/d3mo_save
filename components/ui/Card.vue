<template>
  <div :class="cardClasses">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface CardProps {
  elevated?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<CardProps>(), {
  elevated: false,
  padding: 'md'
})

const cardClasses = computed(() => {
  return [
    'card',
    `card--padding-${props.padding}`,
    {
      'card--elevated': props.elevated
    }
  ]
})
</script>

<style scoped>
.card {
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-neutral-surface);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.card--padding-sm {
  padding: var(--spacing-sm);
}

.card--padding-md {
  padding: var(--spacing-md);
}

.card--padding-lg {
  padding: var(--spacing-lg);
}

.card--elevated {
  box-shadow: var(--shadow-elevated);
  border-color: var(--color-primary-ink);
}
</style>

