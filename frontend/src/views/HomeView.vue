<script setup lang="ts">
// Landing pública: logo, descripción de la aplicación y equipo.
import { APP_NAME } from '../config/app.config'
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <!-- El logo lleva el nombre dentro, por eso el h1 va oculto para lectores
         de pantalla en lugar de repetirlo en pantalla -->
    <h1 class="sr-only">{{ APP_NAME }}</h1>
    <img
      class="mb-6 h-24 w-auto"
      src="/logo-keyring.png"
      :alt="`${APP_NAME} — propiedades en equilibrio`"
    />

    <p class="mb-4">
      {{ APP_NAME }} es un dashboard web para la gestión de propiedades de arriendo: soporta
      alquileres cortos tipo Airbnb y contratos fijos. Permite administrar propiedades, contratos e
      ingresos y gastos, con reportes gráficos y mapa de ubicaciones.
    </p>
    <p class="mb-6 text-slate-500">
      Equipo: <strong>{{ APP_NAME }}</strong> — Emmanuel Hernández · Paula Arroyave · Juan Andrés
      Salcedo
    </p>
    <router-link
      class="inline-block rounded-lg bg-primary px-4 py-2 text-sm text-white no-underline hover:bg-primary-dark"
      :to="{ name: 'login' }"
    >
      Ingresar
    </router-link>
  </section>
</template>
