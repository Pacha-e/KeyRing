<script setup lang="ts">
// Landing pública: descripción de la app + equipo
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h1 class="mb-4 text-3xl font-bold">🔑 KeyRing</h1>
    <p class="mb-4">
      KeyRing es un dashboard web para la gestión de propiedades de arriendo: soporta alquileres
      cortos tipo Airbnb y contratos fijos. Permite administrar propiedades, contratos e ingresos y
      gastos, con reportes gráficos y mapa de ubicaciones.
    </p>
    <p class="mb-6 text-slate-500">
      Equipo: <strong>KeyRing</strong> — Emmanuel Hernández · Paula Arroyave · Juan Andrés Salcedo
    </p>
    <router-link
      class="inline-block rounded-lg bg-primary px-4 py-2 text-sm text-white no-underline hover:bg-primary-dark"
      :to="{ name: 'login' }"
    >
      Ingresar
    </router-link>
  </section>
</template>
