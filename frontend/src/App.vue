<script setup lang="ts">
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-100 text-slate-800">
    <AppNavbar />
    <main class="mx-auto w-[min(1100px,92%)] flex-1 py-6">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>
