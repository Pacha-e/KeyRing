<script setup lang="ts">
// --- State ---
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
    <p>
      KeyRing — Web Engineering Development Project · Team 3 · Paula Andrea Arroyave · Juan Andres
      Salcedo · Emmanuel Hernández · {{ year }}
    </p>
  </footer>
</template>
