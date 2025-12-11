<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" class="input__label">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :class="inputClasses"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
    />
    <span v-if="error" :id="`${inputId}-error`" class="input__error" role="alert">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface InputProps {
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  modelValue?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  return [
    'input',
    {
      'input--error': !!props.error,
      'input--disabled': props.disabled
    }
  ]
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.input__label {
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  color: var(--color-primary-ink);
  font-weight: 400;
}

.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-primary);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  color: var(--color-primary-ink);
  background-color: var(--color-bg-base);
  border: 1px solid var(--color-neutral-surface);
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.input::placeholder {
  color: var(--color-neutral-surface);
  opacity: 0.6;
}

.input:hover:not(.input--disabled) {
  border-color: var(--color-primary-ink);
}

.input:focus {
  border-color: var(--color-primary-ink);
  outline: 2px solid var(--color-primary-ink);
  outline-offset: 2px;
}

.input--error {
  border-color: var(--color-error);
}

.input--error:focus {
  border-color: var(--color-error);
  outline-color: var(--color-error);
}

.input--disabled,
.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-neutral-surface);
}

.input__error {
  font-family: var(--font-secondary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-caption);
  color: var(--color-error);
}
</style>

