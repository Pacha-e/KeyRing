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
        <svg
          class="h-5 w-5 text-primary"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M14.7 2.7a5.5 5.5 0 0 0-7.2 7.2L2 15.4V19a1 1 0 0 0 1 1h3.6a1 1 0 0 0 .7-.3l1-1a1 1 0 0 0 .3-.7v-1h1a1 1 0 0 0 .7-.3l.7-.7a1 1 0 0 0 .3-.7v-1h1a1 1 0 0 0 .7-.3l1.5-1.5a5.5 5.5 0 0 0 .2-8.8zM16 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
          />
        </svg>
        {{ APP_NAME }}
      </router-link>

      <nav class="flex flex-1 items-center gap-6 text-sm text-slate-600">
        <a class="no-underline hover:text-ink" href="#funciones">Funciones</a>
        <a class="no-underline hover:text-ink" href="#precios">Precios</a>
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
