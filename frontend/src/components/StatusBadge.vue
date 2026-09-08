<script setup lang="ts">
// Badge de color reutilizable para valores de estado en tablas (Activa, Vacante, Airbnb, etc.)
import { computed, type PropType } from 'vue'

export type BadgeTone = 'green' | 'gray' | 'dark' | 'blue' | 'red' | 'purple' | 'primary'

const props = defineProps({
  label: { type: String, required: true },
  tone: { type: String as PropType<BadgeTone>, default: 'gray' },
})

const toneClass = computed(
  () =>
    ({
      green: 'bg-green-100 text-green-800',
      gray: 'bg-slate-200 text-slate-700',
      dark: 'bg-sidebar text-white',
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      primary: 'bg-primary/10 text-primary-dark',
    })[props.tone],
)
</script>

<template>
  <span class="rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap" :class="toneClass">
    {{ label }}
  </span>
</template>
