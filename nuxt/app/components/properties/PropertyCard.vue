<script setup lang="ts">
// --- Internal imports ---
import { propertyStatusLabels } from '../../enums/PropertyStatus';
import { propertyTypeLabels } from '../../enums/PropertyType';
import type { Property } from '../../interfaces/Property';
import { PropertyFormatter } from '../../utils/PropertyFormatter';

// --- Types ---
defineProps<{ property: Property }>();
</script>

<template>
  <article class="property-card">
    <h2>
      <NuxtLink :to="`/properties/${property.id}`">{{ property.name }}</NuxtLink>
    </h2>
    <p>{{ property.city }} · {{ propertyTypeLabels[property.type] }}</p>
    <p>{{ propertyStatusLabels[property.status] }}</p>
    <p>
      <strong>{{ PropertyFormatter.formatCurrency(property.estimatedMonthlyRent) }}</strong> / month
    </p>
  </article>
</template>

<style scoped>
.property-card {
  border: 1px solid #d5ddd9;
  border-radius: 12px;
  padding: 1.25rem;
}
h2 {
  font-size: 1.2rem;
  margin: 0 0 0.75rem;
}
a {
  color: #174c3a;
}
p {
  color: #40534b;
  margin: 0.5rem 0;
}
</style>
