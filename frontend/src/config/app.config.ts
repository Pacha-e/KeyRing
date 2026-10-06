// Configuración de la aplicación leída desde las variables de entorno.
//
// Ningún componente lee import.meta.env directamente: todos importan de aquí.
// Así hay un único punto donde se define el valor por defecto de cada variable,
// y si mañana cambia el nombre de una, se cambia en un solo sitio.
//
// El encadenado opcional (?.) permite importar este módulo también fuera del
// navegador (las pruebas de Node no tienen variables de entorno de Vite).

/** Nombre de la aplicación, visible en la pestaña del navegador y en la interfaz. */
export const APP_NAME: string = import.meta.env?.VITE_APP_NAME ?? 'KeyRing'

/** Plantilla de teselas del mapa de propiedades. */
export const MAP_TILE_URL: string =
  import.meta.env?.VITE_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

/** URL base de la API (Tutorial 08: al desplegar cambia por la IP de la VM). */
export const API_BASE_URL: string = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:3000'
