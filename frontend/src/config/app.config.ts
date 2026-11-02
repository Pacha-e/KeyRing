// --- Constants ---
export const API_BASE_URL: string = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:3000';
export const APP_NAME: string = import.meta.env?.VITE_APP_NAME ?? 'KeyRing';
export const MAP_TILE_URL: string =
  import.meta.env?.VITE_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
