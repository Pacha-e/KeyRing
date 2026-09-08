<script setup lang="ts">
// Cabecera de página: título, contexto y acciones.
//
// Todas las pantallas la usan para que el encabezado pese siempre igual y la
// acción principal esté siempre en el mismo sitio. El slot `actions` deja que
// cada vista ponga sus botones sin que este componente sepa qué hacen.
withDefaults(defineProps<{ title: string; subtitle?: string }>(), { subtitle: '' })
</script>

<template>
  <header
    class="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4"
  >
    <div>
      <h1 class="font-brand m-0 text-2xl font-semibold text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 mb-0 text-sm text-slate-500">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>
