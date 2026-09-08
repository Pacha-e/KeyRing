<script setup lang="ts">
// Tarjeta de métrica del dashboard.
//
// Si recibe `to`, se comporta como enlace: la métrica lleva a la pantalla donde
// se gestiona ese dato, en vez de ser un número que no va a ninguna parte.
import AppIcon, { type IconName } from './AppIcon.vue'
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    title: string
    value: string | number
    icon: IconName
    /** Ruta a la que lleva la tarjeta. Sin ella, la tarjeta no es clicable. */
    to?: RouteLocationRaw
    /** Aclaración bajo el valor, para dar contexto al número. */
    hint?: string
  }>(),
  { to: undefined, hint: '' },
)
</script>

<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    class="group block rounded-xl border border-slate-200 bg-white p-5 no-underline shadow-sm transition"
    :class="to ? 'hover:border-primary hover:shadow-md' : ''"
  >
    <div class="flex items-start justify-between">
      <span class="rounded-lg bg-page p-2 text-primary">
        <AppIcon :name="icon" />
      </span>
      <AppIcon
        v-if="to"
        name="arrow"
        :size="16"
        class="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </div>

    <p class="mt-4 mb-1 text-sm text-slate-500">{{ title }}</p>
    <p class="m-0 text-2xl font-semibold text-ink">{{ value }}</p>
    <p v-if="hint" class="mt-1 mb-0 text-xs text-slate-400">{{ hint }}</p>
  </component>
</template>
