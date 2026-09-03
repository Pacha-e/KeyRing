<script setup lang="ts">
// Formulario de propiedad: sirve para crear (/properties/new) y editar (/properties/:id/edit).
// TODO equipo: validaciones más estrictas y selección de propietario.
import { reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { create, update, getById, KEYS } from '../services/storage'
import { PropertyType, RentalMode, PropertyStatus } from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { CreatePropertyDTO } from '../dtos/CreatePropertyDTO'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const propertyId = String(route.params.id ?? '')
const editing = computed(() => Boolean(propertyId))
const existente = editing.value
  ? getById<PropertyInterface>(KEYS.properties, propertyId)
  : null

const form = reactive<CreatePropertyDTO>({
  name: existente?.name ?? '',
  address: existente?.address ?? '',
  city: existente?.city ?? '',
  type: existente?.type ?? PropertyType.APARTMENT,
  rentalMode: existente?.rentalMode ?? RentalMode.AIRBNB,
  status: existente?.status ?? PropertyStatus.VACANT,
  estimatedMonthlyRent: existente?.estimatedMonthlyRent ?? 0,
  adminFee: existente?.adminFee ?? 0,
  otherFixedCosts: existente?.otherFixedCosts ?? 0,
  ownerId: existente?.ownerId ?? null,
})

const typeOptions = Object.values(PropertyType)
const modeOptions = Object.values(RentalMode)
const statusOptions = Object.values(PropertyStatus)

const inputClass =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'

function onSubmit() {
  const data: CreatePropertyDTO = { ...form, ownerId: form.ownerId ?? auth.user?.id ?? null }
  if (editing.value) {
    update<PropertyInterface>(KEYS.properties, propertyId, data)
  } else {
    create<PropertyInterface>(KEYS.properties, data)
  }
  router.push({ name: 'properties' })
}
</script>

<template>
  <section class="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h1 class="mb-4 text-2xl font-bold">{{ editing ? 'Editar propiedad' : 'Nueva propiedad' }}</h1>
    <form @submit.prevent="onSubmit">
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Nombre</span>
        <input v-model="form.name" required :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Dirección</span>
        <input v-model="form.address" required :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Ciudad</span>
        <input v-model="form.city" required :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Tipo</span>
        <select v-model="form.type" :class="inputClass">
          <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Modalidad de arriendo</span>
        <select v-model="form.rentalMode" :class="inputClass">
          <option v-for="m in modeOptions" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Estado</span>
        <select v-model="form.status" :class="inputClass">
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Arriendo mensual estimado (COP)</span>
        <input v-model.number="form.estimatedMonthlyRent" type="number" min="0" :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Cuota de administración (COP)</span>
        <input v-model.number="form.adminFee" type="number" min="0" :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Otros costos fijos (COP)</span>
        <input v-model.number="form.otherFixedCosts" type="number" min="0" :class="inputClass" />
      </label>
      <div class="flex gap-3">
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
          type="submit"
        >
          Guardar
        </button>
        <router-link
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 no-underline hover:bg-slate-50"
          :to="{ name: 'properties' }"
        >
          Cancelar
        </router-link>
      </div>
    </form>
  </section>
</template>
