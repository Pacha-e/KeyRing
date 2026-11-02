<script setup lang="ts">
// --- External imports ---
import { computed } from 'vue';

// --- Internal imports ---
import type { BadgeTone } from '../enums/badge-tones';

// --- Props and emits ---
const props = defineProps<{ label: string; tone?: BadgeTone }>();

// --- Computed ---
const toneClass = computed(
  () =>
    ({
      blue: 'bg-blue-100 text-blue-800',
      dark: 'bg-sidebar text-white',
      gray: 'bg-slate-200 text-slate-700',
      green: 'bg-green-100 text-green-800',
      primary: 'bg-primary/10 text-primary-dark',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800',
    })[props.tone ?? 'gray'],
);
</script>

<template>
  <span class="rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap" :class="toneClass">
    {{ props.label }}
  </span>
</template>
