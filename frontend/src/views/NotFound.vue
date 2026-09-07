<template>
  <section class="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
    <h1 class="mb-4 text-2xl font-bold">404 — Página no encontrada</h1>
    <p class="mb-6 text-slate-500">La ruta que buscas no existe.</p>
    <router-link
      class="inline-block rounded-lg bg-primary px-4 py-2 text-sm text-white no-underline hover:bg-primary-dark"
      :to="{ name: 'home' }"
    >
      Volver al inicio
    </router-link>
  </section>
</template>
