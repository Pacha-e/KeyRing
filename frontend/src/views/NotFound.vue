<template>
  <section
    class="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm"
  >
    <p class="font-brand m-0 text-6xl font-semibold text-primary">404</p>
    <h1 class="font-brand mt-4 mb-2 text-2xl font-semibold text-ink">Página no encontrada</h1>
    <p class="mt-0 mb-8 text-slate-500">La ruta que buscas no existe o cambió de sitio.</p>
    <router-link
      class="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-primary-dark"
      :to="{ name: 'home' }"
    >
      Volver al inicio
    </router-link>
  </section>
</template>
