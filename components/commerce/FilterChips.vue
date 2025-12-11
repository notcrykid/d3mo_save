<template>
  <template v-if="activeFilters.length > 0">
    <li
      v-for="(filter, index) in activeFilters"
      :key="index"
      class="activeFilterChip"
    >
      <button
        class="filterChipButton"
        @click="handleRemove(filter)"
        type="button"
        :aria-label="`Remove ${filter.label} filter`"
      >
        <span class="filterChipText">{{ filter.label }}</span>
        <span class="filterChipRemove" aria-hidden="true">×</span>
      </button>
    </li>
    <li
      v-if="activeFilters.length > 1"
      class="activeFilterChip"
    >
      <button
        class="filterChipButton filterChipButton--clear-all"
        @click="handleClearAll"
        type="button"
        aria-label="Clear all filters"
      >
        <span class="filterChipText">Clear all</span>
      </button>
    </li>
  </template>
</template>

<script setup lang="ts">
export interface ActiveFilter {
  type: 'searchId' | 'category' | 'priceRange' | 'scentFamily' | 'brand' | 'newArrivals' | 'inStock'
  label: string
  value: string | number | [number, number] | boolean
}

interface FilterChipsProps {
  activeFilters: ActiveFilter[]
}

const props = defineProps<FilterChipsProps>()

const emit = defineEmits<{
  remove: [filter: ActiveFilter]
  clearAll: []
}>()

const handleRemove = (filter: ActiveFilter): void => {
  emit('remove', filter)
}

const handleClearAll = (): void => {
  emit('clearAll')
}
</script>

<style scoped>
/* Refactored for AST/CFG divergence - active filter chips styling */
.activeFilterChip {
  display: inline-block;
  list-style: none;
  margin: 0;
  padding: 0;
}

.filterChipButton {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-neutral-surface);
  border: 1px solid var(--color-primary-ink);
  border-radius: 16px;
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  background: none;
  border: none;
  padding: 0;
}

.filterChipButton:hover {
  opacity: 0.7;
}

.filterChipButton:focus {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.filterChipText {
  user-select: none;
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  color: var(--color-primary-ink);
}

.filterChipRemove {
  font-size: 18px;
  line-height: 1;
  font-weight: 300;
  margin-left: var(--spacing-xs);
  color: var(--color-primary-ink);
}

.filterChipButton--clear-all {
  background-color: var(--color-accent-rose);
  border-color: var(--color-accent-rose);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-accent-rose);
  border-radius: 16px;
}

.filterChipButton--clear-all:hover {
  background-color: var(--color-accent-rose-hover);
  border-color: var(--color-accent-rose-hover);
}

/* Mobile: Ensure touch targets */
@media (max-width: 767px) {
  .filterChipButton {
    min-height: 44px;
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .filterChipButton {
    transition: none;
  }
}
</style>

