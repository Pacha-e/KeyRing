# KeyRing

Dashboard web para la gestión de propiedades de arriendo: alquileres cortos tipo **Airbnb** y
**contratos fijos**. Permite administrar propiedades, contratos e ingresos/gastos, con reportes
gráficos (Chart.js) y mapa de ubicaciones (Leaflet).

Proyecto del curso **Ingeniería de Desarrollo Web** — Equipo **KeyRing**.

## Características

- SPA en **Vue 3** (Composition API, `<script setup>`) + Vite, JavaScript plano.
- "Base de datos" en **LocalStorage** del navegador: se siembra con datos ficticios la primera vez
  que se abre la app.
- Autenticación ficticia con roles (`admin` / `user`) y rutas protegidas.
- 11 vistas, incluidas 2 exclusivas para administradores (Reportes y Usuarios).
- Componentes reutilizables: `DataTable`, `FilterSelect`, `ChartCard`, `StatCard`, `AppNavbar`,
  `AppFooter`.

## Requisitos

- Node.js 18 o superior

## Instalación y ejecución

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173/` (ruta principal `/`).

## Credenciales de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@keyring.co` | `admin123` |
| Usuario | `user@keyring.co` | `user123` |

Para reiniciar los datos de prueba, borra el LocalStorage del sitio en el navegador (o ejecuta
`resetDatabase()` desde `src/services/seed.js` en la consola).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | ESLint (flat config + eslint-plugin-vue) |
| `npm run format` | Prettier sobre `src/` y archivos raíz |

## Estructura del proyecto

```
src/
├── assets/main.css        # Tokens de diseño (variables CSS) y estilos base
├── components/            # Componentes reutilizables (PascalCase)
├── models/enums.js        # Constantes del dominio (objetos congelados) + etiquetas
├── router/index.js        # Rutas + guardas (requiresAuth / requiresAdmin)
├── services/              # camelCase: storage.js (repositorio genérico),
│                          # seed.js (datos ficticios), auth.service.js (sesión)
├── stores/auth.js         # Store Pinia de autenticación
├── views/                 # Una vista por ruta (PascalCase)
├── App.vue
└── main.js                # Siembra de datos + montaje de la app
```

## Rutas

| Ruta | Vista | Acceso |
| --- | --- | --- |
| `/` | Home | Pública |
| `/login` | Login | Pública |
| `/dashboard` | Dashboard | Autenticado |
| `/properties` | Lista de propiedades | Autenticado |
| `/properties/new`, `/properties/:id/edit` | Formulario de propiedad | Autenticado |
| `/contracts` | Contratos | Autenticado |
| `/transactions` | Transacciones | Autenticado |
| `/map` | Mapa (Leaflet) | Autenticado |
| `/reports` | Reportes (Chart.js) | Solo admin |
| `/admin/users` | Administración de usuarios | Solo admin |

## Convenciones

- Componentes y vistas en **PascalCase**; servicios y stores en **camelCase**.
- Todo el texto de la UI en **español**; comentarios de código mínimos y en español.
- Antes de subir cambios: `npm run lint` y `npm run format`.
