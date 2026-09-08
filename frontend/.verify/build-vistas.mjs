// Compila vistas.ts para poder ejecutarlo en Node.
//
// A diferencia de guards, esta prueba sí renderiza las vistas de verdad, así que
// los Single File Components tienen que compilarse. Se usa Vite en modo SSR, que
// ya trae el plugin de Vue configurado para el proyecto.
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

await build({
  // Sin configFile, Vite cargaría además vite.config.ts y registraría el plugin
  // de Vue dos veces: la segunda pasada recibiría JS ya transformado y fallaría
  // diciendo que el componente no tiene <template> ni <script>.
  configFile: false,
  plugins: [vue(), tailwindcss()],
  logLevel: 'error',
  build: {
    ssr: '.verify/vistas.ts',
    outDir: '.verify/ssr',
    emptyOutDir: true,
    rollupOptions: {
      output: { format: 'es', entryFileNames: 'vistas.js' },
    },
  },
})
