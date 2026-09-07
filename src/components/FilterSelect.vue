<script setup lang="ts">
// Selector de filtro reutilizable. options: [{ value, label }] o strings.
export interface SelectOption {
  value: string | number
  label: string
}

withDefaults(
  defineProps<{
    label: string
    options?: (SelectOption | string)[]
    modelValue?: string | number
    allLabel?: string
  }>(),
  { options: () => [], modelValue: '', allLabel: 'Todos' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}

const optValue = (opt: SelectOption | string): string | number =>
  typeof opt === 'string' ? opt : opt.value
const optLabel = (opt: SelectOption | string): string => (typeof opt === 'string' ? opt : opt.label)
</script>

<template>
  <label class="flex flex-col gap-1">
    <span class="text-sm font-medium">{{ label }}</span>
    <select
      :value="modelValue"
      class="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary"
      @change="onChange"
    >
      <option value="">{{ allLabel }}</option>
      <option v-for="opt in options" :key="String(optValue(opt))" :value="optValue(opt)">
        {{ optLabel(opt) }}
      </option>
    </select>
  </label>
</template>
