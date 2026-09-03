<script setup>
// Landing pública: descripción de la app + equipo
</script>

<template>
  <section class="card">
    <h1>🔑 KeyRing</h1>
    <p>
      KeyRing es un dashboard web para la gestión de propiedades de arriendo: soporta alquileres
      cortos tipo Airbnb y contratos fijos. Permite administrar propiedades, contratos e ingresos y
      gastos, con reportes gráficos y mapa de ubicaciones.
    </p>
    <p class="text-muted">
      Equipo: <strong>KeyRing</strong> — <!-- TODO equipo: reemplazar con los nombres de los 3 integrantes -->
      Integrante 1 · Integrante 2 · Integrante 3
    </p>
    <router-link class="btn" :to="{ name: 'login' }">Ingresar</router-link>
  </section>
</template>
