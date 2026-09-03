<script setup>
// Selector de filtro reutilizable. options: [{ value, label }] o strings.
defineProps({
  label: { type: String, required: true },
  options: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: '' },
  allLabel: { type: String, default: 'Todos' },
})

const emit = defineEmits(['update:modelValue'])

function onChange(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <label class="form-group filter-select">
    <span>{{ label }}</span>
    <select :value="modelValue" @change="onChange">
      <option value="">{{ allLabel }}</option>
      <option v-for="opt in options" :key="opt.value ?? opt" :value="opt.value ?? opt">
        {{ opt.label ?? opt }}
      </option>
    </select>
  </label>
</template>
