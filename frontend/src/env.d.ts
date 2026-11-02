/// <reference types="vite/client" />

// --- Types ---
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_MAP_TILE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
