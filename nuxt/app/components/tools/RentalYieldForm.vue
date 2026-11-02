<script setup lang="ts">
// --- Internal imports ---
import type { RentalYieldInput } from '../../interfaces/RentalYieldInput';
import type { RentalYieldResult } from '../../interfaces/RentalYieldResult';
import { RentalYieldCalculator } from '../../utils/RentalYieldCalculator';

// --- State ---
const error = ref('');
const input = reactive<RentalYieldInput>({
  monthlyAdminFee: 0,
  monthlyRent: 0,
  otherMonthlyFixedCosts: 0,
  propertyPrice: 0,
  vacancyMonths: 0,
});
const result = ref<RentalYieldResult | null>(null);

// --- Event handlers ---
function calculate() {
  error.value = RentalYieldCalculator.validate(input);
  result.value = error.value ? null : RentalYieldCalculator.calculate(input);
}
</script>

<template>
  <section class="calculator">
    <NuxtLink to="/tools">All tools</NuxtLink>
    <h1>Rental yield calculator</h1>
    <p>Estimate your annual return using Colombian pesos. Fixed costs apply throughout the year.</p>
    <form novalidate @submit.prevent="calculate">
      <label for="property-price">Property price (COP)</label
      ><input
        id="property-price"
        v-model.number="input.propertyPrice"
        type="number"
        min="0"
        step="any"
        required
      />
      <label for="monthly-rent">Monthly rent (COP)</label
      ><input
        id="monthly-rent"
        v-model.number="input.monthlyRent"
        type="number"
        min="0"
        step="any"
        required
      />
      <label for="admin-fee">Monthly administration fee (COP)</label
      ><input
        id="admin-fee"
        v-model.number="input.monthlyAdminFee"
        type="number"
        min="0"
        step="any"
        required
      />
      <label for="fixed-costs">Other monthly fixed costs (COP)</label
      ><input
        id="fixed-costs"
        v-model.number="input.otherMonthlyFixedCosts"
        type="number"
        min="0"
        step="any"
        required
      />
      <label for="vacancy">Vacancy months per year</label
      ><input
        id="vacancy"
        v-model.number="input.vacancyMonths"
        type="number"
        min="0"
        max="12"
        step="any"
        required
      />
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <button type="submit">Calculate yield</button>
    </form>
    <section v-if="result" class="result" aria-live="polite">
      <h2>Annual estimate</h2>
      <p>
        Gross yield: <strong>{{ result.grossYield.toFixed(2) }}%</strong>
      </p>
      <p>
        Net yield: <strong>{{ result.netYield.toFixed(2) }}%</strong>
      </p>
      <p>
        Annual net income:
        <strong>{{
          new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
          }).format(result.annualNetIncome)
        }}</strong>
      </p>
    </section>
  </section>
</template>

<style scoped>
.calculator {
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem 1.25rem;
}
a {
  color: #276455;
}
h1 {
  font-size: clamp(2rem, 5vw, 3rem);
}
form {
  display: grid;
  gap: 0.5rem;
  margin-top: 2rem;
}
label {
  font-weight: 700;
  margin-top: 0.5rem;
}
input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #a6bcb3;
  border-radius: 0.4rem;
  padding: 0.7rem;
  font: inherit;
}
button {
  justify-self: start;
  margin-top: 1rem;
  padding: 0.8rem 1.2rem;
  border: 0;
  border-radius: 0.4rem;
  background: #245e50;
  color: white;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.error {
  color: #a22b2b;
}
.result {
  margin-top: 2rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  background: #eff8f3;
}
</style>
