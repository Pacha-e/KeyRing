<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import PublicHeader from './components/PublicHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()

// 'bare': solo el contenido centrado (login). 'public': header público, sin sidebar (home).
// 'app': layout con sidebar (todo lo demás, ya protegido por los guards del router).
const layout = computed<'bare' | 'public' | 'app'>(() => {
  if (route.name === 'login') return 'bare'
  if (route.name === 'home') return 'public'
  return 'app'
})
</script>

<template>
  <div v-if="layout === 'app'" class="flex min-h-screen bg-page text-ink">
    <AppNavbar />
    <main class="flex-1 px-8 py-8">
      <router-view />
    </main>
  </div>

  <div v-else-if="layout === 'public'" class="flex min-h-screen flex-col bg-page text-ink">
    <PublicHeader />
    <main class="mx-auto w-[min(1100px,92%)] flex-1 py-10">
      <router-view />
    </main>
    <AppFooter />
  </div>

  <div v-else class="flex min-h-screen items-center justify-center bg-page px-4 text-ink">
    <router-view />
  </div>
</template>
