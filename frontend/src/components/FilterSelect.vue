<script setup lang="ts">
// --- External imports ---
import { computed } from 'vue';

// --- Internal imports ---
import type { SelectOption } from '../interfaces/SelectOption';
import SelectField from './SelectField.vue';

// --- Props and emits ---
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const props = withDefaults(
  defineProps<{
    allLabel?: string;
    label: string;
    modelValue?: string | number;
    options?: (SelectOption | string)[];
  }>(),
  { allLabel: 'All', modelValue: '', options: () => [] },
);

// --- Computed ---
const optionsWithAll = computed<SelectOption[]>(() => [
  { value: '', label: props.allLabel },
  ...props.options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  ),
]);
</script>

<template>
  <SelectField
    class="min-w-48"
    :label="props.label"
    label-variant="filter"
    :model-value="props.modelValue"
    :options="optionsWithAll"
    @update:model-value="(value) => emit('update:modelValue', String(value))"
  />
</template>
