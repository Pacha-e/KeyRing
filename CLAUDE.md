# KeyRing — guía para agentes

SPA Vue 3 (Composition API, `<script setup>`) + Vite + TypeScript estricto + Tailwind v4 + Pinia.
La "base de datos" vive en LocalStorage y se siembra en la primera carga.

## Comandos

| Comando              | Uso                    |
| -------------------- | ---------------------- |
| `npm run dev`        | Servidor de desarrollo |
| `npm run type-check` | `vue-tsc --noEmit`     |
| `npm run lint`       | ESLint (flat config)   |
| `npm run format`     | Prettier               |
| `npm run build`      | Build de producción    |

Antes de cerrar cualquier tarea: `npm run type-check && npm run lint && npm run build` en verde.

## Arquitectura

```
src/
├── interfaces/   # Modelos del dominio + enums.ts (enums + etiquetas en español)
├── dtos/         # DTOs de creación (Omit<Entidad, 'id'>)
├── services/     # storage.ts (repositorio genérico), seed.ts, *.service.ts por entidad
├── utils/        # Funciones puras (cálculos financieros)
├── stores/       # Pinia (auth)
├── router/       # Rutas + guards requiresAuth / requiresAdmin
├── components/   # Reutilizables: DataTable, FilterSelect, ChartCard, StatCard,
│                 # StatusBadge, AppNavbar, PublicHeader, AppFooter
└── views/        # Una vista por ruta
```

Flujo de datos: **vista → `services/*.service.ts` → `services/storage.ts` → LocalStorage**.
Una vista nunca llama a `localStorage` ni a `storage.ts` directamente.

## Reglas de código

**KISS es el criterio de aceptación transversal.** Si una solución necesita explicación, es la
solución equivocada.

- **Nada de código muerto.** Cero funciones sin llamar, cero exports sin importar, cero props sin
  usar, cero código comentado, cero `console.log`, cero `TODO`.
- **Nada de sobreingeniería.** No factories, no wrappers de una línea, no capas de abstracción "por
  si acaso", no genéricos que solo se usan una vez, no manejo de casos que el enunciado no pide. La
  solución más obvia que pasa el criterio gana.
- **Nada de spaghetti.** Componente de vista = orquestación + template. La lógica de datos vive en
  `services/`, el estado compartido en `stores/`. Un componente no habla con LocalStorage
  directamente. Funciones cortas, una responsabilidad, sin anidamiento profundo.
- **Comentarios mínimos, en español.** Solo cuando el _por qué_ no es evidente del código.
  Prohibido comentar lo que el código ya dice (`// obtiene el usuario` sobre `getUser()`). Sin
  JSDoc decorativo.
- **TypeScript estricto de verdad.** Cero `any`, cero `@ts-ignore`, cero aserciones `as` que tapen
  un error. Los tipos salen de `interfaces/` y `dtos/`, no se redefinen inline.
- **Reutilizar antes que crear.** Si `DataTable` o `FilterSelect` sirven, se usan. Un componente
  nuevo solo si se usa en dos lugares o si la vista queda ilegible sin él.
- **Convenciones del repo:** componentes y vistas en PascalCase, servicios y stores en camelCase,
  UI 100% en español, Tailwind v4 con los tokens ya definidos en `assets/main.css` (nada de estilos
  inline ni CSS suelto).
- **Sin dependencias nuevas.** Chart.js y Leaflet ya están; no entra nada más.

## Credenciales sembradas

| Rol           | Correo             | Contraseña |
| ------------- | ------------------ | ---------- |
| Administrador | `admin@keyring.co` | `admin123` |
| Usuario       | `user@keyring.co`  | `user123`  |
