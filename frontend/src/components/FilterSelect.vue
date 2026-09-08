<script setup lang="ts">
// Selector de filtro reutilizable. options: [{ value, label }] o strings.
// Pensado para ir dentro de FilterBar: por eso la etiqueta va en versalitas
// pequeñas, como encabezado del control, y no como texto de formulario.
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
  <label class="flex min-w-40 flex-col gap-1.5">
    <span class="text-xs font-semibold tracking-wide text-slate-500 uppercase">{{ label }}</span>
    <select :value="modelValue" class="field-input" @change="onChange">
      <option value="">{{ allLabel }}</option>
      <option v-for="opt in options" :key="String(optValue(opt))" :value="optValue(opt)">
        {{ optLabel(opt) }}
      </option>
    </select>
  </label>
</template>
