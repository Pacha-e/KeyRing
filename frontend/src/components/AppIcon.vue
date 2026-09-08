<script setup lang="ts">
// Iconos de trazo del proyecto. Se definen aquí, en un solo sitio, para que
// todas las pantallas usen el mismo grosor y el mismo tamaño, y para que el
// color lo herede del texto que los rodea en vez de venir fijo como pasaría
// con un emoji.
export type IconName =
  'home' | 'contract' | 'income' | 'balance' | 'map' | 'users' | 'arrow' | 'chevron' | 'check'

const props = withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 20 })

// Cada trazo está dibujado sobre una rejilla de 24x24.
const PATHS: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5',
  contract: 'M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M9 13h7M9 17h5',
  // Billete con una moneda al centro. Antes era un signo de peso dibujado a
  // trazo, que al tamaño de la interfaz se confundía con el símbolo de bitcoin.
  income:
    'M3 7h18a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  balance: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  map: 'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4zM9 4v13M15 6.5v13',
  users:
    'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1.5a4 4 0 0 0-3-3.87M16.5 3.63a4 4 0 0 1 0 7.75',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'm6 9 6 6 6-6',
  check: 'm5 13 4 4 10-10',
}

const path = PATHS[props.name]
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="path" />
  </svg>
</template>
