<script setup lang="ts">
// Barra superior para páginas públicas (landing), sin sidebar.
import { APP_NAME } from '../config/app.config'
</script>

<template>
  <header class="border-b border-slate-200/70">
    <div class="mx-auto flex w-[min(1100px,92%)] items-center gap-6 py-4">
      <router-link
        class="font-brand flex items-center gap-2 text-xl font-semibold text-ink no-underline"
        :to="{ name: 'home' }"
      >
        <img class="h-7 w-7" src="/isotipo-keyring.png" :alt="`Isotipo de ${APP_NAME}`" />
        {{ APP_NAME }}
      </router-link>

      <nav class="flex flex-1 items-center gap-6 text-sm text-slate-600">
        <!-- Ambos enlaces apuntan a secciones que existen en la portada -->
        <a class="no-underline hover:text-ink" href="#funciones">Funciones</a>
        <a class="no-underline hover:text-ink" href="#equipo">Equipo</a>
      </nav>

      <router-link
        class="rounded-lg border border-slate-300 px-4 py-1.5 text-sm text-ink no-underline hover:bg-slate-50"
        :to="{ name: 'login' }"
      >
        Iniciar sesión
      </router-link>
    </div>
  </header>
</template>
