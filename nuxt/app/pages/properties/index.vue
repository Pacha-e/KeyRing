<script setup lang="ts">
// --- Internal imports ---
import type { Property } from '#shared/interfaces/Property';

// --- State ---
const { data: properties, error, pending } = await useFetch<Property[]>('/api/properties');
</script>

<template>
  <section class="properties">
    <h1>Properties</h1>
    <p>Explore your property portfolio and estimated rental income.</p>
    <p v-if="pending" role="status">Loading properties...</p>
    <p v-else-if="error" role="alert">Unable to load properties. Please try again later.</p>
    <div v-else class="property-grid">
      <PropertiesPropertyCard
        v-for="property in properties"
        :key="property.id"
        :property="property"
      />
    </div>
  </section>
</template>

<style scoped>
.properties {
  margin: 0 auto;
  max-width: 1100px;
  padding: 2rem 1rem;
}
.property-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  margin-top: 2rem;
}
</style>
