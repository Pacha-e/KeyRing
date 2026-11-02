<script setup lang="ts">
// --- External imports ---
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// --- Internal imports ---
import PageHeader from '../components/PageHeader.vue';
import { MAP_TILE_URL } from '../config/app.config';
import { PropertyStatusLabel } from '../enums/PropertyStatus';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import { PropertyService as propertyService } from '../services/property.service';
import { useAuthStore } from '../stores/auth';

// --- Constants ---
const CITY_COORDS: Record<string, [number, number]> = {
  Medellín: [6.244, -75.581],
  Bogotá: [4.711, -74.072],
  Cali: [3.437, -76.522],
};
const FALLBACK: [number, number] = [4.711, -74.072];
const SPREAD_DEGREES = 0.09;

// --- Stores ---
const authStore = useAuthStore();
const router = useRouter();

// --- State ---
let map: L.Map | null = null;
const mapEl = ref<HTMLElement | null>(null);
const markedProperties = ref<PropertyInterface[]>([]);

// --- Methods ---
/**
 * Builds the popup content with DOM nodes.
 * textContent avoids raw HTML injection from a property name.
 */
function buildPopup(property: PropertyInterface): HTMLElement {
  const container = document.createElement('div');

  const title = document.createElement('strong');
  title.textContent = property.name;
  container.appendChild(title);
  container.appendChild(document.createElement('br'));

  const address = document.createElement('span');
  address.textContent = `${property.address}, ${property.city}`;
  container.appendChild(address);
  container.appendChild(document.createElement('br'));

  const status = document.createElement('span');
  status.textContent = `Status: ${PropertyStatusLabel[property.status] ?? property.status}`;
  container.appendChild(status);
  container.appendChild(document.createElement('br'));

  const hint = document.createElement('span');
  hint.textContent = 'Click the marker to open the property details.';
  hint.className = 'text-slate-400';
  container.appendChild(hint);

  return container;
}

/** Fixes the default Leaflet marker icons for Vite. */
function configureLeafletIcons(): void {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}

/**
 * Returns the marker coordinates for a property.
 * Properties without coordinates fall back to their city center, spread outward
 * so unlocated properties in the same city do not stack.
 */
function coordsFor(property: PropertyInterface, unlocatedIndex: number): [number, number] {
  if (typeof property.latitude === 'number' && typeof property.longitude === 'number') {
    return [property.latitude, property.longitude];
  }
  const base = CITY_COORDS[property.city] ?? FALLBACK;
  const angle = unlocatedIndex * (Math.PI / 3);
  return [base[0] + Math.sin(angle) * SPREAD_DEGREES, base[1] + Math.cos(angle) * SPREAD_DEGREES];
}

/** Draws the map once properties have been loaded. */
function drawMap(): void {
  if (!mapEl.value) return;

  map = L.map(mapEl.value).setView([5.5, -74.5], 6);
  L.tileLayer(MAP_TILE_URL, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  const unlocatedByCity: Record<string, number> = {};
  const placed: [number, number][] = [];

  markedProperties.value.forEach((property) => {
    const hasOwnCoords =
      typeof property.latitude === 'number' && typeof property.longitude === 'number';
    const unlocatedIndex = hasOwnCoords
      ? 0
      : (unlocatedByCity[property.city] = (unlocatedByCity[property.city] ?? 0) + 1) - 1;

    const coords = coordsFor(property, unlocatedIndex);
    placed.push(coords);

    const marker = L.marker(coords).addTo(map!).bindPopup(buildPopup(property));

    marker.on('mouseover', () => marker.openPopup());
    marker.on('mouseout', () => marker.closePopup());
    marker.on('click', () => {
      void router.push({ name: 'property-edit', params: { id: property.id } });
    });
  });

  if (placed.length > 0) {
    map.fitBounds(L.latLngBounds(placed), { padding: [48, 48], maxZoom: 12 });
  }
}

/** Loads the properties visible for the current session. */
async function loadProperties(): Promise<void> {
  markedProperties.value = await propertyService.listForUser(authStore.user);
}

// --- Lifecycle ---
onBeforeUnmount(() => {
  map?.remove();
  map = null;
});

onMounted(async () => {
  configureLeafletIcons();
  await loadProperties();
  drawMap();
});
</script>

<template>
  <section>
    <PageHeader
      title="Property map"
      :subtitle="`${markedProperties.length} property(ies) on the map`"
    />

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div ref="mapEl" class="map-container overflow-hidden rounded-lg"></div>
    </div>

    <p class="mt-3 mb-0 text-sm text-slate-500">
      Hover over a marker to see the address and status, and click it to open the property details.
      Properties registered without coordinates are placed near their city center.
    </p>
  </section>
</template>
