<script setup lang="ts">
// Tabla genérica. columns: [{ key, label }], rows: objetos con esas keys.
// Slot "actions" (scoped: { row }) para botones por fila.
// Slot "cell-<key>" (scoped: { value, row }) opcional, para renderizar una celda a medida
// (por ejemplo un badge de estado) en vez del texto plano por defecto.
export interface TableColumn {
  key: string
  label: string
  /**
   * Alineación del contenido de la columna. 'right' es para cifras y fechas:
   * alineadas a la derecha los millares quedan uno debajo de otro y se pueden
   * comparar de un vistazo. Estas columnas además nunca parten en dos líneas,
   * porque una fecha o un monto cortados a la mitad no se leen.
   */
  align?: 'left' | 'right'
}

withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows?: Record<string, unknown>[]
    /**
     * Qué decir cuando no hay filas. Cada listado explica su propio vacío: no
     * es lo mismo no tener ninguna propiedad todavía que haber filtrado hasta
     * dejar la tabla sin resultados.
     */
    emptyMessage?: string
    /** Segunda línea del estado vacío, para sugerir el siguiente paso. */
    emptyHint?: string
  }>(),
  { rows: () => [], emptyMessage: 'No hay datos para mostrar', emptyHint: '' },
)

/**
 * Clases de alineación de una columna.
 * @param column columna a alinear
 * @returns las utilidades de Tailwind que le corresponden
 */
const alignClass = (column: TableColumn): string =>
  column.align === 'right' ? 'text-right tabular-nums whitespace-nowrap' : 'text-left'
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-sidebar/[0.04]">
          <th
            v-for="col in columns"
            :key="col.key"
            class="border-b border-slate-200 px-4 py-3 text-xs font-semibold tracking-wide text-slate-500 uppercase"
            :class="alignClass(col)"
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
          <td
            v-for="col in columns"
            :key="col.key"
            class="border-b border-slate-100 px-4 py-3"
            :class="alignClass(col)"
          >
            <slot :name="`cell-${col.key}`" :value="row[col.key]" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
          <!-- Las acciones no parten de línea: “Cambiar rol” en dos renglones
               se lee como dos botones distintos. -->
          <td v-if="$slots.actions" class="border-b border-slate-100 px-4 py-3 whitespace-nowrap">
            <slot name="actions" :row="row" />
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td class="px-4 py-12 text-center" :colspan="columns.length + ($slots.actions ? 1 : 0)">
            <p class="m-0 text-sm font-medium text-slate-500">{{ emptyMessage }}</p>
            <p v-if="emptyHint" class="mt-1 mb-0 text-sm text-slate-400">{{ emptyHint }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
