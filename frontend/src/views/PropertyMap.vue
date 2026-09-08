<script setup lang="ts">
// Mapa Leaflet con marcadores de las propiedades sembradas.
// Coordenadas fijas por ciudad + pequeño desplazamiento para no superponer marcadores.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import PageHeader from '../components/PageHeader.vue'
import * as propertyService from '../services/property.service'
import { MAP_TILE_URL } from '../config/app.config'
import { PropertyStatusLabel } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { PropertyInterface } from '../interfaces/PropertyInterface'

const authStore = useAuthStore()

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

// Cuánto se separa del centro de la ciudad cada marcador. Con menos de esto los
// inmuebles de una misma ciudad se apilan y parece haber menos de los que hay.
const SPREAD_DEGREES = 0.09

const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null

// Se lee fuera de onMounted para poder anunciar cuántos marcadores hay en la
// cabecera, sin esperar a que Leaflet termine de montarse.
const markedProperties = propertyService.listForUser(authStore.user)

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

  map = L.map(mapEl.value).setView([5.5, -74.5], 6)
  L.tileLayer(MAP_TILE_URL, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  // Los inmuebles de una misma ciudad se reparten en círculo alrededor de su
  // centro, en vez de en diagonal: así ninguno tapa a otro por muchos que haya.
  const seen: Record<string, number> = {}
  const placed: [number, number][] = []
  markedProperties.forEach((p) => {
    const base = CITY_COORDS[p.city] ?? FALLBACK
    const n = (seen[p.city] = (seen[p.city] ?? 0) + 1)
    const angle = (n - 1) * (Math.PI / 3)
    const coords: [number, number] = [
      base[0] + Math.sin(angle) * SPREAD_DEGREES,
      base[1] + Math.cos(angle) * SPREAD_DEGREES,
    ]
    placed.push(coords)
    L.marker(coords).addTo(map!).bindPopup(buildPopup(p))
  })

  // Se encuadra sobre los marcadores en vez de dejar la vista fija: con la
  // vista general de Colombia los inmuebles de una misma ciudad quedaban
  // superpuestos y parecía haber menos de los que dice la cabecera.
  if (placed.length > 0) {
    map.fitBounds(L.latLngBounds(placed), { padding: [48, 48], maxZoom: 12 })
  }
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <section>
    <PageHeader
      title="Mapa de propiedades"
      :subtitle="`${markedProperties.length} inmueble(s) ubicados de forma aproximada por ciudad`"
    />

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div ref="mapEl" class="map-container overflow-hidden rounded-lg"></div>
    </div>

    <p class="mt-3 mb-0 text-sm text-slate-500">
      Las coordenadas son el centro de cada ciudad con un pequeño desplazamiento, para que dos
      inmuebles de la misma ciudad no queden uno encima del otro. Toca un marcador para ver la
      dirección y el estado.
    </p>
  </section>
</template>
