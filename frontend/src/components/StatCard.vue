<script setup lang="ts">
// --- External imports ---
import type { RouteLocationRaw } from 'vue-router';

// --- Internal imports ---
import AppIcon, { type IconName } from './AppIcon.vue';

// --- Props and emits ---
const props = withDefaults(
  defineProps<{
    hint?: string;
    icon: IconName;
    title: string;
    to?: RouteLocationRaw;
    value: string | number;
  }>(),
  { hint: '', to: undefined },
);
</script>

<template>
  <component
    :is="props.to ? 'router-link' : 'div'"
    :to="props.to"
    class="group block rounded-xl border border-slate-200 bg-white p-5 no-underline shadow-sm transition"
    :class="props.to ? 'hover:border-primary hover:shadow-md' : ''"
  >
    <div class="flex items-start justify-between">
      <span class="rounded-lg bg-page p-2 text-primary">
        <AppIcon :name="props.icon" />
      </span>
      <AppIcon
        v-if="props.to"
        name="arrow"
        :size="16"
        class="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </div>

    <p class="mt-4 mb-1 text-sm text-slate-500">{{ props.title }}</p>
    <p class="m-0 text-2xl font-semibold text-ink">{{ props.value }}</p>
    <p v-if="props.hint" class="mt-1 mb-0 text-xs text-slate-400">{{ props.hint }}</p>
  </component>
</template>
