<script setup lang="ts">
// Mapa Leaflet con marcadores de las propiedades sembradas.
// Coordenadas fijas por ciudad + pequeño desplazamiento para no superponer marcadores.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getAll, KEYS } from '../services/storage'
import { PropertyStatusLabel } from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'

// Fix de íconos por defecto de Leaflet con Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const CITY_COORDS: Record<string, [number, number]> = {
  Medellín: [6.244, -75.581],
  Bogotá: [4.711, -74.072],
  Cali: [3.437, -76.522],
}
const FALLBACK: [number, number] = [4.711, -74.072] // Centro de Colombia aprox.

const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null

onMounted(() => {
  if (!mapEl.value) return
  const properties = getAll<PropertyInterface>(KEYS.properties)

  map = L.map(mapEl.value).setView([5.5, -74.5], 6)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  // Conteo por ciudad para desplazar marcadores de la misma ciudad
  const seen: Record<string, number> = {}
  properties.forEach((p) => {
    const base = CITY_COORDS[p.city] ?? FALLBACK
    const n = (seen[p.city] = (seen[p.city] ?? 0) + 1)
    const coords: [number, number] = [base[0] + n * 0.03, base[1] + n * 0.03]
    L.marker(coords)
      .addTo(map!)
      .bindPopup(
        `<strong>${p.name}</strong><br>${p.address}, ${p.city}<br>Estado: ${PropertyStatusLabel[p.status] ?? p.status}`,
      )
  })
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Mapa de propiedades</h1>
    <p class="mb-4 text-slate-500">Ubicación aproximada por ciudad de cada propiedad registrada.</p>
    <div ref="mapEl" class="map-container rounded-lg border border-slate-200"></div>
  </section>
</template>
