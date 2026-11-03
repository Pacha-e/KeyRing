<script setup lang="ts">
// --- External imports ---
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// --- Internal imports ---
import SelectField from '../components/SelectField.vue';
import type { CreatePropertyDto as CreatePropertyDTO } from '../dtos/CreatePropertyDto';
import { PropertyStatus, PropertyStatusLabel } from '../enums/PropertyStatus';
import { PropertyType, PropertyTypeLabel } from '../enums/PropertyType';
import { RentalMode, RentalModeLabel } from '../enums/RentalMode';
import type { SelectOption } from '../interfaces/SelectOption';
import { PropertyService as propertyService } from '../services/property.service';
import { useAuthStore } from '../stores/auth';
import { HttpClient } from '../utils/HttpClient';

// --- Stores ---
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// --- State ---
const formError = ref('');
const isFormReady = ref(false);
const propertyForm = ref<CreatePropertyDTO>(buildEmptyProperty());

// --- Computed ---
const isEditing = computed(() => Boolean(propertyId.value));
const modeOptions = computed<SelectOption[]>(() =>
  Object.values(RentalMode).map((mode) => ({
    value: mode,
    label: RentalModeLabel[mode],
  })),
);
const propertyId = computed(() => String(route.params.id ?? ''));
const statusOptions = computed<SelectOption[]>(() =>
  Object.values(PropertyStatus).map((status) => ({
    value: status,
    label: PropertyStatusLabel[status],
  })),
);
const typeOptions = computed<SelectOption[]>(() =>
  Object.values(PropertyType).map((type) => ({
    value: type,
    label: PropertyTypeLabel[type],
  })),
);

// --- Methods ---
/** Empty property with the domain default values. */
function buildEmptyProperty(): CreatePropertyDTO {
  return {
    name: '',
    address: '',
    city: '',
    type: PropertyType.APARTMENT,
    rentalMode: RentalMode.AIRBNB,
    status: PropertyStatus.VACANT,
    estimatedMonthlyRent: 0,
    adminFee: 0,
    otherFixedCosts: 0,
    userId: null,
  };
}

/** Returns the first validation error, or null if the form is valid. */
function findValidationError(): string | null {
  if (!propertyForm.value.name.trim()) return 'Property name is required.';
  if (!propertyForm.value.city.trim()) return 'City is required.';
  if (propertyForm.value.estimatedMonthlyRent < 0 || propertyForm.value.adminFee < 0) {
    return 'Amounts cannot be negative.';
  }
  if (propertyForm.value.otherFixedCosts < 0) return 'Amounts cannot be negative.';
  return null;
}

/**
 * Loads the property indicated by the route into the form.
 * If the id does not exist, redirects to the list instead of editing nothing.
 */
async function loadFormFromRoute(): Promise<void> {
  formError.value = '';
  isFormReady.value = false;
  if (!isEditing.value) {
    propertyForm.value = buildEmptyProperty();
    isFormReady.value = true;
    return;
  }
  let existing;
  try {
    existing = await propertyService.findById(propertyId.value);
  } catch (error) {
    formError.value = HttpClient.apiErrorMessage(error);
    return;
  }
  if (!existing) {
    router.replace({ name: 'properties' });
    return;
  }
  const { id: _id, ...editableFields } = existing;
  propertyForm.value = editableFields;
  isFormReady.value = true;
}

/** Validates and persists the property, then returns to the list. */
async function saveProperty(): Promise<void> {
  const validationError = findValidationError();
  if (validationError) {
    formError.value = validationError;
    return;
  }
  const values: CreatePropertyDTO = {
    ...propertyForm.value,
    userId: propertyForm.value.userId ?? authStore.user?.id ?? null,
  };
  try {
    if (isEditing.value) {
      await propertyService.update(propertyId.value, values);
    } else {
      await propertyService.create(values);
    }
  } catch (error) {
    formError.value = HttpClient.apiErrorMessage(error);
    return;
  }
  router.push({ name: 'properties' });
}

// --- Lifecycle ---
onMounted(() => void loadFormFromRoute());
watch(propertyId, () => void loadFormFromRoute());
</script>

<template>
  <section
    class="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    <h1 class="font-brand mt-0 mb-1 text-2xl font-semibold text-ink">
      {{ isEditing ? 'Edit property' : 'New property' }}
    </h1>
    <p class="mt-0 mb-6 text-sm text-slate-500">Property data, rental mode and fixed costs.</p>

    <p v-if="!isFormReady && formError" role="alert" class="text-red-700">{{ formError }}</p>
    <p v-else-if="!isFormReady" class="text-slate-500">Loading property...</p>

    <form v-if="isFormReady" class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveProperty">
      <label class="col-span-full flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Name</span>
        <input v-model="propertyForm.name" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Address</span>
        <input v-model="propertyForm.address" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">City</span>
        <input v-model="propertyForm.city" required class="field-input" />
      </label>

      <SelectField v-model="propertyForm.type" label="Type" :options="typeOptions" />
      <SelectField v-model="propertyForm.rentalMode" label="Rental mode" :options="modeOptions" />
      <SelectField v-model="propertyForm.status" label="Status" :options="statusOptions" />

      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Estimated monthly rent (COP)</span>
        <input
          v-model.number="propertyForm.estimatedMonthlyRent"
          type="number"
          min="0"
          class="field-input"
        />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Admin fee (COP)</span>
        <input v-model.number="propertyForm.adminFee" type="number" min="0" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Other fixed costs (COP)</span>
        <input
          v-model.number="propertyForm.otherFixedCosts"
          type="number"
          min="0"
          class="field-input"
        />
      </label>

      <p
        v-if="formError"
        aria-live="polite"
        class="col-span-full m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ formError }}
      </p>

      <div class="col-span-full mt-2 flex gap-3 border-t border-slate-200 pt-5">
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          type="submit"
        >
          Save
        </button>
        <router-link
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 no-underline transition hover:bg-slate-50"
          :to="{ name: 'properties' }"
        >
          Cancel
        </router-link>
      </div>
    </form>
  </section>
</template>
