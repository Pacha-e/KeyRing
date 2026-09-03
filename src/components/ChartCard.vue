<script setup lang="ts">
// Tarjeta de gráfico: envuelve vue-chartjs. type: 'bar' | 'line' | 'doughnut' | 'pie'
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
    default: () => ({ responsive: true }),
  },
})

const chartComponent = computed<Component>(
  () =>
    (({ bar: Bar, line: Line, doughnut: Doughnut, pie: Pie }) as Record<string, Component>)[
      props.type
    ] ?? Bar,
)
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h3 class="mt-0">{{ title }}</h3>
    <component :is="chartComponent" :data="chartData" :options="options" />
  </div>
</template>
