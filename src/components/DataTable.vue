<script setup>
// Tabla genérica. columns: [{ key, label }], rows: objetos con esas keys.
// Slot "actions" (scoped: { row }) para botones por fila.
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
          <th v-if="$slots.actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="row.id ?? i">
          <td v-for="col in columns" :key="col.key">{{ row[col.key] }}</td>
          <td v-if="$slots.actions">
            <slot name="actions" :row="row" />
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td class="empty" :colspan="columns.length + ($slots.actions ? 1 : 0)">
            No hay datos para mostrar
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
