/// <reference types="vite/client" />

// Variables de entorno del proyecto. Declararlas aquí hace que TypeScript las
// conozca: si alguien lee una que no existe, el error salta al compilar y no en
// tiempo de ejecución. Solo las que empiezan por VITE_ llegan al navegador; el
// resto Vite las descarta a propósito, para no filtrar configuración al cliente.
interface ImportMetaEnv {
  /** Nombre de la aplicación, visible en la pestaña del navegador y en la interfaz. */
  readonly VITE_APP_NAME: string
  /** Plantilla de teselas del mapa. Permite cambiar de proveedor sin tocar el código. */
  readonly VITE_MAP_TILE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
