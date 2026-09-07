<script setup lang="ts">
// Landing pública: hero + funciones + CTA (layout público sin sidebar, ver App.vue)
</script>

<template>
  <section class="grid gap-10 py-6 md:grid-cols-2 md:items-center">
    <div>
      <h1 class="font-brand mb-5 text-4xl leading-tight font-semibold text-ink md:text-5xl">
        Todas tus propiedades, una sola cuenta
      </h1>
      <p class="mb-8 text-lg text-slate-600">
        Registra casas, aptos o fincas, conecta su renta de Airbnb o contrato, y mira la ganancia
        real de cada una.
      </p>
      <router-link
        class="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white no-underline hover:bg-primary-dark"
        :to="{ name: 'login' }"
      >
        Crear cuenta gratis
      </router-link>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <p class="mb-1 text-sm text-slate-500">Ganancia neta este mes</p>
      <p class="font-brand text-4xl font-semibold text-ink">$14.3M</p>
      <p class="mt-4 text-sm text-slate-500">Sobre 6 propiedades activas</p>
    </div>
  </section>

  <section id="funciones" class="grid gap-6 py-14 md:grid-cols-3">
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="font-brand mb-2 text-lg font-semibold text-ink">Conecta tu Airbnb</h3>
      <p class="text-sm text-slate-600">Trae la renta real de tus anuncios activos.</p>
    </div>
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="font-brand mb-2 text-lg font-semibold text-ink">Guarda tus contratos</h3>
      <p class="text-sm text-slate-600">Renta fija, fechas y datos del arrendatario.</p>
    </div>
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="font-brand mb-2 text-lg font-semibold text-ink">Ve tu ganancia real</h3>
      <p class="text-sm text-slate-600">Ingresos menos gastos, propiedad por propiedad.</p>
    </div>
  </section>

  <section id="precios" class="border-t border-slate-200 py-14 text-center">
    <h2 class="font-brand mb-3 text-2xl font-semibold text-ink">Un solo plan, sin sorpresas</h2>
    <p class="mb-6 text-slate-600">
      Gratis mientras estás construyendo tu portafolio de propiedades.
    </p>
    <router-link
      class="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white no-underline hover:bg-primary-dark"
      :to="{ name: 'login' }"
    >
      Empezar ahora
    </router-link>
  </section>
</template>
