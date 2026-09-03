<script setup>
// Tarjeta de estadística para dashboards
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: '' },
})
</script>

<template>
  <div class="card stat-card">
    <span v-if="icon" class="stat-icon">{{ icon }}</span>
    <p class="stat-title text-muted">{{ title }}</p>
    <p class="stat-value">{{ value }}</p>
  </div>
</template>

<style scoped>
.stat-card {
  text-align: center;
}

.stat-icon {
  font-size: 1.8rem;
}

.stat-title {
  margin: var(--space-xs) 0;
  font-size: 0.9rem;
}

.stat-value {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-primary-dark);
}
</style>
