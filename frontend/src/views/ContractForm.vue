<script setup lang="ts">
// --- External imports ---
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// --- Internal imports ---
import SelectField from '../components/SelectField.vue';
import type { CreateContractDto as CreateContractDTO } from '../dtos/CreateContractDto';
import { ContractStatus, ContractStatusLabel } from '../enums/ContractStatus';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import type { SelectOption } from '../interfaces/SelectOption';
import { ContractService as contractService } from '../services/contract.service';
import { PropertyService as propertyService } from '../services/property.service';
import { useAuthStore } from '../stores/auth';
import { HttpClient } from '../utils/HttpClient';

// --- Stores ---
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// --- State ---
const formError = ref('');
const properties = ref<PropertyInterface[]>([]);
// Order kept: contractForm initializer reads properties.
const contractForm = ref<CreateContractDTO>(buildEmptyContract());

// --- Computed ---
const contractId = computed(() => String(route.params.id ?? ''));
const isEditing = computed(() => Boolean(contractId.value));

const propertyOptions = computed<SelectOption[]>(() =>
  properties.value.map((property) => ({ value: property.id, label: property.name })),
);
const statusOptions: SelectOption[] = Object.values(ContractStatus).map((status) => ({
  value: status,
  label: ContractStatusLabel[status],
}));

// --- Methods ---
/** Empty contract with the first available property preselected. */
function buildEmptyContract(): CreateContractDTO {
  return {
    propertyId: properties.value[0]?.id ?? '',
    fixedRent: 0,
    startDate: '',
    endDate: '',
    tenantName: '',
    tenantContact: '',
    status: ContractStatus.ACTIVE,
  };
}

/** Returns the first validation error, or null if the form is valid. */
function findValidationError(): string | null {
  if (!contractForm.value.propertyId) return 'Select the contract property.';
  if (contractForm.value.fixedRent <= 0) return 'Rent must be greater than zero.';
  if (!contractForm.value.startDate || !contractForm.value.endDate)
    return 'Enter start and end dates.';
  if (contractForm.value.startDate >= contractForm.value.endDate) {
    return 'Start date must be earlier than end date.';
  }
  return null;
}

/**
 * Loads the contract indicated by the route into the form.
 * If the id does not exist, redirects to the list instead of editing nothing.
 */
async function loadFormFromRoute(): Promise<void> {
  formError.value = '';
  if (!isEditing.value) {
    contractForm.value = buildEmptyContract();
    return;
  }
  const existing = await contractService.findById(contractId.value);
  if (!existing) {
    router.replace({ name: 'contracts' });
    return;
  }
  const { id: _id, ...editableFields } = existing;
  contractForm.value = editableFields;
}

/** Loads the properties visible to the current session. */
async function loadProperties(): Promise<void> {
  properties.value = await propertyService.listForUser(authStore.user);
}

/** Validates and persists the contract, then returns to the list. */
async function saveContract(): Promise<void> {
  const validationError = findValidationError();
  if (validationError) {
    formError.value = validationError;
    return;
  }
  try {
    if (isEditing.value) {
      await contractService.update(contractId.value, contractForm.value);
    } else {
      await contractService.create(contractForm.value);
    }
  } catch (error) {
    formError.value = HttpClient.apiErrorMessage(error);
    return;
  }
  router.push({ name: 'contracts' });
}

// --- Lifecycle ---
onMounted(() => void loadProperties());
watch(contractId, () => void loadFormFromRoute(), { immediate: true });
</script>

<template>
  <section
    class="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    <h1 class="font-brand mt-0 mb-1 text-2xl font-semibold text-ink">
      {{ isEditing ? 'Edit contract' : 'New contract' }}
    </h1>
    <p class="mt-0 mb-6 text-sm text-slate-500">Tenant, rent and term for a property agreement.</p>

    <p v-if="properties.length === 0" class="text-slate-500">
      Register a property first to create contracts.
    </p>

    <form v-else class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveContract">
      <SelectField
        v-model="contractForm.propertyId"
        class="col-span-full"
        label="Property"
        :options="propertyOptions"
      />
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Tenant</span>
        <input v-model="contractForm.tenantName" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Tenant contact</span>
        <input v-model="contractForm.tenantContact" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Monthly rent (COP)</span>
        <input v-model.number="contractForm.fixedRent" type="number" min="0" class="field-input" />
      </label>
      <SelectField v-model="contractForm.status" label="Status" :options="statusOptions" />
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Start date</span>
        <input v-model="contractForm.startDate" type="date" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">End date</span>
        <input v-model="contractForm.endDate" type="date" required class="field-input" />
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
          :to="{ name: 'contracts' }"
        >
          Cancel
        </router-link>
      </div>
    </form>
  </section>
</template>
