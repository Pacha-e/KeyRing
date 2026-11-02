// --- External imports ---
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// --- Exported members ---
export default defineConfig({
  plugins: [vue(), tailwindcss()],
});
