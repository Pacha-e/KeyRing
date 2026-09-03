<template>
  <footer class="footer">
    <p>KeyRing — Proyecto de Ingeniería de Desarrollo Web · Equipo KeyRing · {{ year }}</p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>
