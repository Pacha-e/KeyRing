<script setup lang="ts">
// --- Internal imports ---
import type { Property } from '#shared/interfaces/Property';

// --- State ---
const route = useRoute();
const {
  data: property,
  error,
  pending,
} = await useFetch<Property>(
  () => `/api/properties/${encodeURIComponent(String(route.params.id))}`,
);
if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Property not found' });
}
</script>

<template>
  <section class="property-detail">
    <NuxtLink to="/properties">All properties</NuxtLink>
    <p v-if="pending" role="status">Loading property...</p>
    <p v-else-if="error" role="alert">Unable to load this property. Please try again later.</p>
    <PropertiesPropertyDetail v-else-if="property" :property="property" />
  </section>
</template>

<style scoped>
.property-detail {
  margin: 0 auto;
  max-width: 1100px;
  padding: 2rem 1rem;
}
a {
  color: #174c3a;
}
</style>
