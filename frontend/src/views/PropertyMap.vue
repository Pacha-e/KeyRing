<script setup lang="ts">
// Mapa Leaflet con marcadores de las propiedades sembradas.
// Coordenadas fijas por ciudad + pequeño desplazamiento para no superponer marcadores.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import * as propertyService from '../services/property.service'
import { PropertyStatusLabel } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { PropertyInterface } from '../interfaces/PropertyInterface'

const auth = useAuthStore()

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

/**
 * Construye el contenido del popup con nodos del DOM.
 * Se usa textContent (no HTML crudo) para que un nombre de propiedad
 * con etiquetas no pueda inyectar marcado en el mapa.
 * @param property propiedad a describir
 * @returns elemento listo para pasarle a bindPopup
 */
function buildPopup(property: PropertyInterface): HTMLElement {
  const contenedor = document.createElement('div')

  const titulo = document.createElement('strong')
  titulo.textContent = property.name
  contenedor.appendChild(titulo)
  contenedor.appendChild(document.createElement('br'))

  const direccion = document.createElement('span')
  direccion.textContent = `${property.address}, ${property.city}`
  contenedor.appendChild(direccion)
  contenedor.appendChild(document.createElement('br'))

  const estado = document.createElement('span')
  estado.textContent = `Estado: ${PropertyStatusLabel[property.status] ?? property.status}`
  contenedor.appendChild(estado)

  return contenedor
}

onMounted(() => {
  if (!mapEl.value) return
  const properties = propertyService.listForUser(auth.user)

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
    L.marker(coords).addTo(map!).bindPopup(buildPopup(p))
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
