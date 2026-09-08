<script setup lang="ts">
// Selector de filtro reutilizable. options: [{ value, label }] o strings.
//
// Añade la opción “Todos” delante y delega el resto en SelectField, para que un
// filtro y un campo de formulario sean exactamente el mismo control y no haya
// que mantener dos desplegables distintos.
import { computed } from 'vue'
import SelectField, { type SelectOption } from './SelectField.vue'

export type { SelectOption }

const props = withDefaults(
  defineProps<{
    label: string
    options?: (SelectOption | string)[]
    modelValue?: string | number
    allLabel?: string
  }>(),
  { options: () => [], modelValue: '', allLabel: 'Todos' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// “Todos” es una opción más de la lista, con la cadena vacía como valor: así
// quitar el filtro se hace igual que ponerlo.
const optionsWithAll = computed<SelectOption[]>(() => [
  { value: '', label: props.allLabel },
  ...props.options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  ),
])
</script>

<template>
  <SelectField
    class="min-w-48"
    :label="label"
    label-variant="filter"
    :model-value="modelValue"
    :options="optionsWithAll"
    @update:model-value="(value) => emit('update:modelValue', String(value))"
  />
</template>
