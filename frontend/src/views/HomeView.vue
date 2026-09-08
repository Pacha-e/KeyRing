<script setup lang="ts">
// Portada pública: presenta el producto a quien todavía no ha iniciado sesión.
// Las secciones tienen id porque la cabecera pública enlaza a ellas.
import AppIcon, { type IconName } from '../components/AppIcon.vue'
import { APP_NAME } from '../config/app.config'

/** Una capacidad del sistema, tal como se muestra en la sección de funciones. */
interface Feature {
  icon: IconName
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: 'home',
    title: 'Propiedades',
    description:
      'Registra cada inmueble con su modalidad de arriendo, su canon estimado y sus costos fijos. Filtra por ciudad y por tipo.',
  },
  {
    icon: 'contract',
    title: 'Contratos',
    description:
      'Lleva el control de arrendatarios, cánones y fechas. El dashboard avisa cuáles vencen primero.',
  },
  {
    icon: 'income',
    title: 'Ingresos y gastos',
    description:
      'Registra cada movimiento indicando si viene de Airbnb o de un contrato fijo, y compáralos mes a mes.',
  },
  {
    icon: 'balance',
    title: 'Reportes',
    description:
      'Utilidad por ciudad, distribución del ingreso por fuente y resumen por propiedad, con filtros por tipo y por rango de meses.',
  },
  {
    icon: 'map',
    title: 'Mapa',
    description:
      'Ubica el portafolio completo sobre el mapa y consulta el estado de cada inmueble desde el marcador.',
  },
  {
    icon: 'users',
    title: 'Roles',
    description:
      'El propietario ve solo sus inmuebles. El administrador accede a los reportes globales y a la gestión de usuarios.',
  },
]

const team = ['Emmanuel Hernández', 'Paula Arroyave', 'Juan Andrés Salcedo']
</script>

<template>
  <div>
    <!-- Portada -->
    <section class="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
      <div>
        <p class="mb-4 text-sm font-medium tracking-widest text-primary uppercase">
          Propiedades en equilibrio
        </p>
        <h1 class="font-brand m-0 text-4xl leading-tight font-semibold text-ink md:text-5xl">
          Todo tu portafolio de arriendos, en una sola pantalla
        </h1>
        <p class="mt-5 mb-8 max-w-prose text-lg text-slate-600">
          {{ APP_NAME }} reúne propiedades, contratos e ingresos en un mismo lugar y te dice cuánto
          rinde de verdad cada inmueble, una vez descontados administración y gastos.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <router-link
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white no-underline transition hover:bg-primary-dark"
            :to="{ name: 'login' }"
          >
            Ingresar
            <AppIcon name="arrow" :size="18" />
          </router-link>
          <a
            class="rounded-lg border border-slate-300 px-6 py-3 font-medium text-ink no-underline transition hover:bg-white"
            href="#funciones"
          >
            Ver qué hace
          </a>
        </div>
      </div>

      <img
        class="mx-auto w-full max-w-md"
        src="/logo-keyring.png"
        :alt="`${APP_NAME} — propiedades en equilibrio`"
      />
    </section>

    <!-- Funciones -->
    <section id="funciones" class="scroll-mt-20 border-t border-slate-200 py-14">
      <h2 class="font-brand m-0 text-2xl font-semibold text-ink">Qué hace</h2>
      <p class="mt-2 mb-8 text-slate-600">Seis frentes de la operación, en un mismo tablero.</p>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="feature in features"
          :key="feature.title"
          class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <span class="inline-flex rounded-lg bg-page p-2.5 text-primary">
            <AppIcon :name="feature.icon" :size="22" />
          </span>
          <h3 class="mt-4 mb-2 text-base font-semibold text-ink">{{ feature.title }}</h3>
          <p class="m-0 text-sm leading-relaxed text-slate-600">{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <!-- Equipo -->
    <section id="equipo" class="scroll-mt-20 border-t border-slate-200 py-14">
      <h2 class="font-brand m-0 text-2xl font-semibold text-ink">Equipo</h2>
      <p class="mt-2 mb-8 text-slate-600">Proyecto del curso de Ingeniería de Desarrollo Web.</p>

      <ul class="grid list-none gap-4 p-0 sm:grid-cols-3">
        <li
          v-for="member in team"
          :key="member"
          class="rounded-xl border border-slate-200 bg-white px-5 py-4 text-center font-medium text-ink shadow-sm"
        >
          {{ member }}
        </li>
      </ul>
    </section>
  </div>
</template>
