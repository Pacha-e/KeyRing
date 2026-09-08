<script setup lang="ts">
// Mapa Leaflet con un marcador por propiedad.
//
// Cada inmueble se sitúa en sus propias coordenadas. Solo cuando no las tiene
// se cae al centro de su ciudad, y en ese caso se desplaza un poco para no
// taparse con otros inmuebles sin ubicar de esa misma ciudad.
// Al pulsar un marcador se abre la ficha de esa propiedad.
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
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
const router = useRouter()

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

// Cuánto se separa del centro de la ciudad un inmueble sin coordenadas. Con
// menos que esto los que caen en la misma ciudad se apilan y parece haber menos
// de los que hay.
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
  contenedor.appendChild(document.createElement('br'))

  const pista = document.createElement('span')
  pista.textContent = 'Pulsa el marcador para abrir la ficha'
  pista.className = 'text-slate-400'
  contenedor.appendChild(pista)

  return contenedor
}

/**
 * Dónde dibujar el marcador de una propiedad.
 * @param property propiedad a situar
 * @param unlocatedIndex cuántos inmuebles sin coordenadas van ya en su ciudad
 * @returns par [latitud, longitud]
 */
function coordsFor(property: PropertyInterface, unlocatedIndex: number): [number, number] {
  if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
    return [property.latitude, property.longitude]
  }
  const base = CITY_COORDS[property.city] ?? FALLBACK
  const angle = unlocatedIndex * (Math.PI / 3)
  return [base[0] + Math.sin(angle) * SPREAD_DEGREES, base[1] + Math.cos(angle) * SPREAD_DEGREES]
}

onMounted(() => {
  if (!mapEl.value) return

  map = L.map(mapEl.value).setView([5.5, -74.5], 6)
  L.tileLayer(MAP_TILE_URL, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  // Solo se lleva la cuenta de los inmuebles sin coordenadas: son los únicos
  // que hay que repartir alrededor del centro de su ciudad.
  const unlocatedByCity: Record<string, number> = {}
  const placed: [number, number][] = []

  markedProperties.forEach((property) => {
    const hasOwnCoords =
      typeof property.latitude === 'number' && typeof property.longitude === 'number'
    const unlocatedIndex = hasOwnCoords
      ? 0
      : (unlocatedByCity[property.city] = (unlocatedByCity[property.city] ?? 0) + 1) - 1

    const coords = coordsFor(property, unlocatedIndex)
    placed.push(coords)

    const marker = L.marker(coords).addTo(map!).bindPopup(buildPopup(property))

    // El popup se muestra al pasar por encima y el clic navega, que es lo que
    // se espera de un marcador que representa algo con ficha propia.
    marker.on('mouseover', () => marker.openPopup())
    marker.on('mouseout', () => marker.closePopup())
    marker.on('click', () => {
      void router.push({ name: 'property-edit', params: { id: property.id } })
    })
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
      :subtitle="`${markedProperties.length} inmueble(s) en el mapa`"
    />

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div ref="mapEl" class="map-container overflow-hidden rounded-lg"></div>
    </div>

    <p class="mt-3 mb-0 text-sm text-slate-500">
      Pasa por encima de un marcador para ver la dirección y el estado, y púlsalo para abrir la
      ficha de esa propiedad. Los inmuebles registrados sin coordenadas se sitúan cerca del centro
      de su ciudad.
    </p>
  </section>
</template>
