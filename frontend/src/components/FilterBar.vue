<script setup lang="ts">
// --- Props and emits ---
const props = withDefaults(defineProps<{ title?: string }>(), { title: 'Filters' });
</script>

<template>
  <section class="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <p class="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
      {{ props.title }}
    </p>
    <div class="flex flex-wrap items-end gap-4">
      <slot />
    </div>
  </section>
</template>
