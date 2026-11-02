<script setup lang="ts">
// --- External imports ---
import { Chart, type ChartData, type ChartOptions, type ChartType, registerables } from 'chart.js';
import { type Component, computed } from 'vue';
import { Bar, Doughnut, Line, Pie } from 'vue-chartjs';

Chart.register(...registerables);

// --- Props and emits ---
const props = withDefaults(
  defineProps<{
    chartData: ChartData<ChartType>;
    height?: number;
    options?: ChartOptions<ChartType>;
    title: string;
    type?: ChartType;
  }>(),
  { height: 288, options: () => ({}), type: 'bar' },
);

// --- Computed ---
const chartComponent = computed<Component>(() => {
  const map: Record<string, Component> = { bar: Bar, doughnut: Doughnut, line: Line, pie: Pie };
  return map[props.type] ?? Bar;
});

const mergedOptions = computed<ChartOptions<ChartType>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  datasets: { bar: { maxBarThickness: 72 } },
  ...props.options,
}));
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 class="font-brand mt-0 mb-4 text-base font-semibold text-ink">{{ props.title }}</h3>
    <div :style="{ height: `${props.height}px` }">
      <component :is="chartComponent" :data="props.chartData" :options="mergedOptions" />
    </div>
  </div>
</template>
