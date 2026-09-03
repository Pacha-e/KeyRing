<script setup>
// Tarjeta de gráfico: envuelve vue-chartjs. type: 'bar' | 'line' | 'doughnut' | 'pie'
import { computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Bar, Line, Doughnut, Pie } from 'vue-chartjs'

Chart.register(...registerables)

const props = defineProps({
  title: { type: String, required: true },
  type: { type: String, default: 'bar' },
  chartData: { type: Object, required: true },
  options: { type: Object, default: () => ({ responsive: true }) },
})

const chartComponent = computed(
  () => ({ bar: Bar, line: Line, doughnut: Doughnut, pie: Pie })[props.type] ?? Bar,
)
</script>

<template>
  <div class="card chart-card">
    <h3>{{ title }}</h3>
    <component :is="chartComponent" :data="chartData" :options="options" />
  </div>
</template>
