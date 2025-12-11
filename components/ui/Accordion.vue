<template>
  <div class="accordion">
    <button
      :class="['accordion__trigger', { 'accordion__trigger--open': isOpen }]"
      :aria-expanded="isOpen"
      :aria-controls="`accordion-content-${id}`"
      :id="`accordion-trigger-${id}`"
      @click="toggle"
      type="button"
    >
      <span class="accordion__label">{{ label }}</span>
      <span class="accordion__icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" :transform="isOpen ? 'rotate(45)' : 'rotate(0)'" />
        </svg>
      </span>
    </button>
    <Transition name="accordion">
      <div
        v-if="isOpen"
        :id="`accordion-content-${id}`"
        :aria-labelledby="`accordion-trigger-${id}`"
        class="accordion__content"
        role="region"
      >
        <div class="accordion__inner">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface AccordionProps {
  label: string
  id: string
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<AccordionProps>(), {
  defaultOpen: false
})

const isOpen = ref(props.defaultOpen)

const toggle = (): void => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.accordion {
  border-bottom: 1px solid var(--color-neutral-surface);
}

.accordion__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-secondary);
  font-size: var(--font-size-body);
  color: var(--color-primary-ink);
  text-align: left;
  transition: color 0.2s ease;
  min-height: 44px;
}

.accordion__trigger:hover {
  color: var(--color-primary-ink-hover);
}

.accordion__trigger:focus-visible {
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.accordion__label {
  font-family: var(--font-secondary);
  font-size: var(--font-size-body);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.accordion__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: transform 0.3s cubic-bezier(0.33, 0, 0.2, 1);
  flex-shrink: 0;
}

.accordion__trigger--open .accordion__icon {
  transform: rotate(45deg);
}

.accordion__content {
  overflow: hidden;
}

.accordion__inner {
  padding-bottom: var(--spacing-md);
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  color: var(--color-primary-ink);
}

/* Transition animations */
.accordion-enter-active {
  transition: max-height 0.3s cubic-bezier(0.33, 0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.33, 0, 0.2, 1);
}

.accordion-leave-active {
  transition: max-height 0.3s cubic-bezier(0.33, 0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.33, 0, 0.2, 1);
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 1000px;
  opacity: 1;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .accordion__icon,
  .accordion-enter-active,
  .accordion-leave-active {
    transition: none;
  }
  
  .accordion-enter-from,
  .accordion-leave-to {
    max-height: none;
  }
}
</style>










