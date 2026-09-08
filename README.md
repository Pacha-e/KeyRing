# KeyRing

Dashboard web para la gestión de propiedades de arriendo: alquileres cortos tipo **Airbnb** y
**contratos fijos**. Permite administrar propiedades, contratos e ingresos/gastos, con reportes
gráficos (Chart.js) y mapa de ubicaciones (Leaflet).

Proyecto del curso **Ingeniería de Desarrollo Web** — Equipo **KeyRing**.

## Características

- SPA en **Vue 3** (Composition API, `<script setup>`) + Vite + **TypeScript** (estricto).
- Estilos con **Tailwind CSS v4** (plugin de Vite) y tema claro.
- Estado con **Pinia**; "base de datos" en **LocalStorage** del navegador, sembrada con datos
  ficticios la primera vez que se abre la app.
- Arquitectura por capas: `interfaces/` (modelos + enums), `dtos/`, `services/`, `stores/`,
  `router/`, `components/`, `views/`.
- Autenticación ficticia con roles (`admin` / `user`) y rutas protegidas.
- 13 páginas más la de «no encontrada», incluidas 2 exclusivas para administradores (Reportes y
  Usuarios).
- Cuatro CRUD completos: propiedades, contratos, transacciones y usuarios.
- Componentes reutilizables: `DataTable`, `SelectField`, `FilterSelect`, `FilterBar`, `ChartCard`,
  `StatCard`, `StatusBadge`, `PageHeader`, `AppIcon`, `AppNavbar`, `AppFooter`, `PublicHeader`.

## Requisitos

- Node.js 18 o superior

## Instalación y ejecución

El proyecto Vue vive en la carpeta `frontend/`, siguiendo la estructura de proyectos del curso.
Desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

La app queda en **`http://localhost:5173/`** y la **ruta principal que se debe invocar es `/`**
(página Home, pública). Desde ahí se entra con el botón *Ingresar* usando las credenciales de
prueba de la siguiente sección.

## Credenciales de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@keyring.co` | `admin123` |
| Usuario | `user@keyring.co` | `user123` |

En la pantalla de ingreso las dos cuentas aparecen como botones que rellenan el formulario, así que
no hace falta teclearlas.

Para volver a los datos de prueba, abre la consola del navegador (F12) y ejecuta:

```js
localStorage.clear()
```

Luego recarga: la siembra vuelve a correr. Los datos también se resiembran solos la primera vez que
se abre una versión del proyecto con datos de ejemplo nuevos, porque la bandera de siembra lleva
número de versión (`keyring_seeded_v2`).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run type-check` | Verificación de tipos con `vue-tsc --noEmit` |
| `npm run lint` | ESLint (flat config + eslint-plugin-vue + typescript-eslint) |
| `npm run format` | Prettier sobre `src/` y archivos raíz |
| `npm run verify` | Las tres suites de verificación: servicios, guardas y vistas |

## Estructura del repositorio

```
KeyRing/
├── .gitignore             # Reglas del repositorio (dist/ SÍ se versiona, ver Despliegue)
├── README.md              # Este archivo
└── frontend/              # Proyecto Vue 3 (SPA)
    ├── Dockerfile         # Imagen nginx:alpine que sirve el build
    ├── nginx.conf         # Fallback a index.html para las rutas del router
    ├── dist/              # Build de producción versionado (lo consume el despliegue)
    └── src/
```

En el Entregable 2 se añadirá una carpeta `fullstack/` con la API, al lado de `frontend/`.

## Estructura de `frontend/src`

```
src/
├── assets/main.css        # Entrada Tailwind v4 (@import "tailwindcss") + tokens de marca
├── components/            # Componentes reutilizables (PascalCase)
├── dtos/                  # DTOs de creación (campos de la entidad menos id)
├── interfaces/            # UserInterface, PropertyInterface, ContractInterface,
│                          # TransactionInterface y enums.ts (enums TS + etiquetas en español)
├── router/index.ts        # Rutas + guardas (requiresAuth / requiresAdmin)
├── services/              # camelCase: storage.ts (repositorio genérico tipado),
│                          # seed.ts (datos ficticios), auth.service.ts (sesión) y
│                          # un servicio por entidad: property, contract,
│                          # transaction y user. Ninguna vista toca storage.ts
├── stores/auth.ts         # Store Pinia de autenticación (tipado)
├── utils/                 # finance.ts (aritmética del negocio, funciones puras),
│                          # format.ts (formato del peso colombiano) y
│                          # badges.ts (color de cada estado del dominio)
├── config/                # app.config.ts (variables de entorno) y
│                          # chart.config.ts (paleta de los gráficos)
├── views/                 # Una vista por ruta (PascalCase)
├── env.d.ts               # Tipos de Vite
├── App.vue
└── main.ts                # Siembra de datos + montaje de la app
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
| `/contracts/new`, `/contracts/:id/edit` | Formulario de contrato | Autenticado |
| `/transactions` | Transacciones | Autenticado |
| `/map` | Mapa (Leaflet) | Autenticado |
| `/reports` | Reportes (Chart.js) | Solo admin |
| `/admin/users` | Administración de usuarios | Solo admin |

## Despliegue

El despliegue se hace sobre una máquina virtual de Google Cloud (Compute Engine `e2-micro`,
Debian 13, con tráfico HTTP y HTTPS permitido), siguiendo el tutorial del curso. La imagen Docker
se construye a partir del build ya compilado, por eso `frontend/dist/` se versiona.

Antes de desplegar, desde `frontend/`:

```bash
npm run build
```

Y en la terminal SSH de la máquina virtual, con Docker ya instalado:

```bash
sudo git clone https://github.com/Pacha-e/KeyRing.git
cd KeyRing/frontend
sudo docker image build -t vue-image .
sudo docker container run -d --name vue-container -p 80:80 vue-image
```

La aplicación queda disponible en la IP externa de la instancia usando **HTTP** (no HTTPS: la
instancia no tiene certificado). Para publicar cambios: `npm run build`, commit del nuevo `dist/`,
`git pull` en la máquina virtual y reconstruir la imagen y el contenedor.

El procedimiento completo —crear la instancia, abrir el firewall, instalar Docker y comprobar que
responde— está en la wiki:
[Despliegue en GCP](https://github.com/Pacha-e/KeyRing/wiki/Despliegue-en-GCP).

## Documentación

La [wiki del repositorio](https://github.com/Pacha-e/KeyRing/wiki) tiene el detalle:

| Página | Para qué |
| --- | --- |
| [Entregable](https://github.com/Pacha-e/KeyRing/wiki/Entregable) | Logo, modelo verbal, diagrama de clases y de arquitectura |
| [Arquitectura del código](https://github.com/Pacha-e/KeyRing/wiki/Arquitectura-del-codigo) | Recorrido archivo por archivo de todas las capas |
| [Reglas de programación](https://github.com/Pacha-e/KeyRing/wiki/Reglas-de-programacion) | Reglas por categoría: rutas, vistas, componentes, servicios |
| [Guía de estilo](https://github.com/Pacha-e/KeyRing/wiki/Guia-de-estilo) | Cómo se usan ESLint y Prettier |
| [Preguntas y respuestas](https://github.com/Pacha-e/KeyRing/wiki/Preguntas-y-respuestas) | Material de estudio del proyecto |
| [Pantallazos](https://github.com/Pacha-e/KeyRing/wiki/Pantallazos) | Capturas de las tres secciones principales |

## Convenciones

- Componentes y vistas en **PascalCase**; servicios y stores en **camelCase**; interfaces y DTOs en
  **PascalCase** (`UserInterface.ts`, `CreatePropertyDTO.ts`).
- Todo el texto de la UI en **español**; comentarios de código mínimos y en español.
- Antes de subir cambios: `npm run type-check`, `npm run lint` y `npm run format`.
