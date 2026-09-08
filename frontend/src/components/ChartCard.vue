<script setup lang="ts">
// Tarjeta de gráfico: envuelve vue-chartjs. type: 'bar' | 'line' | 'doughnut' | 'pie'
//
// El lienzo va dentro de un contenedor de alto fijo y se desactiva la relación
// de aspecto de Chart.js. Sin eso el gráfico crece con el ancho disponible y en
// una página a pantalla completa acaba midiendo media pantalla de alto.
import { computed, type Component, type PropType } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { ChartData, ChartOptions, ChartType } from 'chart.js'
import { Bar, Line, Doughnut, Pie } from 'vue-chartjs'

Chart.register(...registerables)

const props = defineProps({
  title: { type: String, required: true },
  type: { type: String as PropType<ChartType>, default: 'bar' },
  chartData: { type: Object as PropType<ChartData<ChartType>>, required: true },
  options: {
    type: Object as PropType<ChartOptions<ChartType>>,
    default: () => ({}),
  },
  /** Alto del lienzo en píxeles. */
  height: { type: Number, default: 288 },
})

// Lo que pase el llamador manda: se mezcla encima de los valores por defecto.
const mergedOptions = computed<ChartOptions<ChartType>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  // Con pocas categorías Chart.js reparte todo el ancho entre las barras y
  // salen bloques enormes. El tope las mantiene legibles.
  datasets: { bar: { maxBarThickness: 72 } },
  ...props.options,
}))

const chartComponent = computed<Component>(
  () =>
    (({ bar: Bar, line: Line, doughnut: Doughnut, pie: Pie }) as Record<string, Component>)[
      props.type
    ] ?? Bar,
)
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 class="font-brand mt-0 mb-4 text-base font-semibold text-ink">{{ title }}</h3>
    <div :style="{ height: `${height}px` }">
      <component :is="chartComponent" :data="chartData" :options="mergedOptions" />
    </div>
  </div>
</template>
