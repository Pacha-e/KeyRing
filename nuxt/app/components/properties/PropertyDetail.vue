<script setup lang="ts">
// --- Internal imports ---
import { PropertyFormatter } from '../../utils/PropertyFormatter';
import { PropertyLabels } from '../../utils/PropertyLabels';
import type { Property } from '#shared/interfaces/Property';

// --- Types ---
defineProps<{ property: Property }>();
</script>

<template>
  <article>
    <h1>{{ property.name }}</h1>
    <dl>
      <div>
        <dt>Address</dt>
        <dd>{{ property.address }}</dd>
      </div>
      <div>
        <dt>City</dt>
        <dd>{{ property.city }}</dd>
      </div>
      <div>
        <dt>Type</dt>
        <dd>{{ PropertyLabels.type(property.type) }}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{{ PropertyLabels.status(property.status) }}</dd>
      </div>
      <div>
        <dt>Rental mode</dt>
        <dd>{{ PropertyLabels.rentalMode(property.rentalMode) }}</dd>
      </div>
      <div>
        <dt>Estimated monthly rent</dt>
        <dd>{{ PropertyFormatter.formatCurrency(property.estimatedMonthlyRent) }}</dd>
      </div>
      <div>
        <dt>Administration fee</dt>
        <dd>{{ PropertyFormatter.formatCurrency(property.adminFee) }}</dd>
      </div>
      <div>
        <dt>Other fixed costs</dt>
        <dd>{{ PropertyFormatter.formatCurrency(property.otherFixedCosts) }}</dd>
      </div>
      <div>
        <dt>Latitude</dt>
        <dd>{{ property.latitude }}</dd>
      </div>
      <div>
        <dt>Longitude</dt>
        <dd>{{ property.longitude }}</dd>
      </div>
      <div>
        <dt>Property ID</dt>
        <dd>{{ property.id }}</dd>
      </div>
      <div>
        <dt>User ID</dt>
        <dd>{{ property.userId }}</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
dl {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
dl div {
  border-bottom: 1px solid #d5ddd9;
  padding-bottom: 0.75rem;
}
dt {
  color: #53665d;
  font-size: 0.9rem;
}
dd {
  font-weight: 600;
  margin: 0.3rem 0 0;
}
</style>
