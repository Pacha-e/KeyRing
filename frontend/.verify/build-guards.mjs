// Compila guards.ts para poder ejecutarlo en Node.
//
// El router carga sus vistas de forma diferida con import('../views/X.vue').
// esbuild no sabe compilar Single File Components, y para esta prueba tampoco
// hace falta: solo se comprueba a qué ruta se llega, no qué se dibuja. Por eso
// cada .vue se sustituye por un componente vacío.
import { build } from 'esbuild'

const stubDeVistas = {
  name: 'stub-de-vistas',
  setup(construccion) {
    construccion.onResolve({ filter: /\.vue$/ }, (args) => ({
      path: args.path,
      namespace: 'vista-stub',
    }))
    construccion.onLoad({ filter: /.*/, namespace: 'vista-stub' }, () => ({
      contents: 'export default { render: () => null }',
      loader: 'js',
    }))
  },
}

await build({
  entryPoints: ['.verify/guards.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: '.verify/guards-dist/guards.js',
  plugins: [stubDeVistas],
  logLevel: 'error',
})
