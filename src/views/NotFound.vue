<template>
  <section class="card" style="text-align: center">
    <h1>404 — Página no encontrada</h1>
    <p class="text-muted">La ruta que buscas no existe.</p>
    <router-link class="btn" :to="{ name: 'home' }">Volver al inicio</router-link>
  </section>
</template>
