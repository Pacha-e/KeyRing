<script setup lang="ts">
// Tabla genérica. columns: [{ key, label }], rows: objetos con esas keys.
// Slot "actions" (scoped: { row }) para botones por fila.
// Slot "cell-<key>" (scoped: { value, row }) opcional, para renderizar una celda a medida
// (por ejemplo un badge de estado) en vez del texto plano por defecto.
export interface TableColumn {
  key: string
  label: string
}

withDefaults(defineProps<{ columns: TableColumn[]; rows?: Record<string, unknown>[] }>(), {
  rows: () => [],
})
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-sidebar/[0.04]">
          <th
            v-for="col in columns"
            :key="col.key"
            class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            {{ col.label }}
          </th>
          <th
            v-if="$slots.actions"
            class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Acciones
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows"
          :key="String(row.id ?? i)"
          class="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-primary/[0.06]"
        >
          <td v-for="col in columns" :key="col.key" class="border-b border-slate-100 px-4 py-3">
            <slot :name="`cell-${col.key}`" :value="row[col.key]" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="border-b border-slate-100 px-4 py-3">
            <slot name="actions" :row="row" />
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td
            class="px-4 py-10 text-center text-slate-400"
            :colspan="columns.length + ($slots.actions ? 1 : 0)"
          >
            No hay datos para mostrar
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
