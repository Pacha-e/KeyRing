<script setup lang="ts">
// Barra de filtros de un listado.
//
// Agrupa los selectores dentro de una pieza con fondo propio para que se lean
// como un control del listado que tienen debajo, y no como campos sueltos
// flotando sobre el contenido.
withDefaults(defineProps<{ title?: string }>(), { title: 'Filtros' })
</script>

<template>
  <section class="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <p class="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">{{ title }}</p>
    <div class="flex flex-wrap items-end gap-4">
      <slot />
    </div>
  </section>
</template>
