<script setup lang="ts">
// Tabla genérica. columns: [{ key, label }], rows: objetos con esas keys.
// Slot "actions" (scoped: { row }) para botones por fila.
export interface TableColumn {
  key: string
  label: string
}

withDefaults(defineProps<{ columns: TableColumn[]; rows?: Record<string, unknown>[] }>(), {
  rows: () => [],
})
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
    <table class="w-full border-collapse bg-white">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="border-b border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold"
          >
            {{ col.label }}
          </th>
          <th
            v-if="$slots.actions"
            class="border-b border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold"
          >
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="String(row.id ?? i)">
          <td v-for="col in columns" :key="col.key" class="border-b border-slate-200 px-4 py-2">
            {{ row[col.key] }}
          </td>
          <td v-if="$slots.actions" class="border-b border-slate-200 px-4 py-2">
            <slot name="actions" :row="row" />
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td
            class="px-4 py-6 text-center text-slate-500"
            :colspan="columns.length + ($slots.actions ? 1 : 0)"
          >
            No hay datos para mostrar
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
