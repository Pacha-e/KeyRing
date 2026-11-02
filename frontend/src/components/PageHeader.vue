<script setup lang="ts">
// --- Props and emits ---
const props = withDefaults(defineProps<{ title: string; subtitle?: string }>(), { subtitle: '' });
</script>

<template>
  <header
    class="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4"
  >
    <div>
      <h1 class="font-brand m-0 text-2xl font-semibold text-ink">{{ props.title }}</h1>
      <p v-if="props.subtitle" class="mt-1 mb-0 text-sm text-slate-500">{{ props.subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>
