<script setup lang="ts">
// Tarjeta de estadística para dashboards
withDefaults(defineProps<{ title: string; value: string | number; icon?: string }>(), {
  icon: '',
})
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
    <span v-if="icon" class="text-3xl">{{ icon }}</span>
    <p class="my-1 text-sm text-slate-500">{{ title }}</p>
    <p class="m-0 text-2xl font-bold text-primary-dark">{{ value }}</p>
  </div>
</template>
