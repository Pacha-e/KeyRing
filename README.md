# KeyRing

Dashboard web para la gestión de propiedades de arriendo: alquileres cortos tipo **Airbnb** y
**contratos fijos**. Permite administrar propiedades, contratos e ingresos/gastos, con reportes
gráficos (Chart.js) y mapa de ubicaciones (Leaflet).

Proyecto del curso **Ingeniería de Desarrollo Web** — Equipo **KeyRing**.

## Características

- SPA en **Vue 3** (Composition API, `<script setup>`) + Vite + **TypeScript** (estricto).
- API en **Nest.js** con **TypeORM** sobre **SQLite**: los datos ya no viven en el navegador.
- Frontend ↔ API por **axios**, con la URL base en `VITE_API_BASE_URL` (`src/config/app.config.ts`).
- Estilos con **Tailwind CSS v4** (plugin de Vite) y tema claro.
- Estado con **Pinia** (sesión) y carga de datos asíncrona en `onMounted`.
- Arquitectura por capas: `interfaces/` (modelos + enums), `dtos/`, `services/`, `stores/`,
  `router/`, `components/`, `views/`; en el backend: entidades, DTOs class-validator,
  servicios con las reglas de dominio, controladores y módulos Nest.
- Autenticación con roles (`admin` / `user`) validada en el servidor; rutas protegidas.
- 13 páginas más la de «no encontrada», incluidas 2 exclusivas para administradores (Reportes y
  Usuarios).
- Cuatro CRUD completos: propiedades, contratos, transacciones y usuarios.
- Componentes reutilizables: `DataTable`, `SelectField`, `FilterSelect`, `FilterBar`, `ChartCard`,
  `StatCard`, `StatusBadge`, `PageHeader`, `AppIcon`, `AppNavbar`, `AppFooter`, `PublicHeader`.

## Requisitos

- Node.js 18 o superior
- Backend: ver `backend/README` abajo; el frontend espera la API en `http://localhost:3000`

## Instalación y ejecución

El proyecto tiene dos partes: `frontend/` (SPA Vue) y `backend/` (API Nest.js), siguiendo la
estructura de proyectos del curso. Desde la raíz del repositorio:

```bash
# 1. API (terminal 1)
cd backend
npm install
npm run start        # http://localhost:3000/api

# 2. Frontend (terminal 2)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

La primera vez que arranca, la API siembra SQLite con los datos ficticios del proyecto.

## Credenciales de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@keyring.co` | `admin123` |
| Usuario | `user@keyring.co` | `user123` |

En la pantalla de ingreso las dos cuentas aparecen como botones que rellenan el formulario, así que
no hace falta teclearlas.

Para volver a los datos de prueba, borra la base de datos y reinicia la API:

```bash
cd backend
rm database.sqlite
npm run start
```

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
├── docker-compose.yml     # API + frontend juntos en dos contenedores (Tutorial 08)
├── backend/               # API Nest.js (TypeORM + SQLite)
│   ├── Dockerfile         # Multi-stage: build TS + runtime solo con deps de producción
│   └── src/               # main, app.module, módulo por entidad + seed
└── frontend/              # Proyecto Vue 3 (SPA)
    ├── Dockerfile         # Imagen nginx:alpine que sirve el build
    ├── nginx.conf         # Fallback a index.html para las rutas del router
    ├── dist/              # Build de producción versionado (lo consume el despliegue)
    └── src/
```

## Estructura de `frontend/src`

```
src/
├── assets/main.css        # Entrada Tailwind v4 (@import "tailwindcss") + tokens de marca
├── components/            # Componentes reutilizables (PascalCase)
├── dtos/                  # DTOs de creación (campos de la entidad menos id)
├── interfaces/            # UserInterface, PropertyInterface, ContractInterface,
│                          # TransactionInterface y enums.ts (enums TS + etiquetas en español)
├── router/index.ts        # Rutas + guardas (requiresAuth / requiresAdmin)
├── services/              # camelCase: http.ts (axios compartido + apiErrorMessage),
│                          # auth.service.ts (sesión) y un servicio por entidad:
│                          # property, contract, transaction y user. Ninguna vista
│                          # toca axios: solo los servicios conocen el transporte
├── stores/auth.ts         # Store Pinia de autenticación (tipado)
├── utils/                 # finance.ts (aritmética del negocio, funciones puras),
│                          # format.ts (formato del peso colombiano) y
│                          # badges.ts (color de cada estado del dominio)
├── config/                # app.config.ts (variables de entorno) y
│                          # chart.config.ts (paleta de los gráficos)
├── views/                 # Una vista por ruta (PascalCase)
├── env.d.ts               # Tipos de Vite
├── App.vue
└── main.ts                # Montaje de la app
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
del frontend se construye a partir del build ya compilado, por eso `frontend/dist/` se versiona.

Antes de desplegar, desde `frontend/`:

```bash
npm run build
```

Con Docker instalado en la máquina virtual, el stack completo (API + frontend) se levanta con
docker-compose desde la raíz del repo:

```bash
sudo git clone https://github.com/Pacha-e/KeyRing.git
cd KeyRing
sudo docker compose up --build -d
# API:      http://<IP-VM>:3000/api
# Frontend: http://<IP-VM>:8081
```

Para que el frontend desplegado hable con la API de la VM, define `VITE_API_BASE_URL` con la IP
externa antes de compilar (los valores quedan embebidos en el bundle):

```bash
# frontend/.env.production (no se versiona)
VITE_API_BASE_URL=http://<IP-VM>:3000
```

Y en el contenedor de la API, el origen del frontend debe estar en `CORS_ORIGIN`
(ver `docker-compose.yml`).

La aplicación está desplegada en **http://34.58.221.78** (instancia `keyring-vm`, Compute Engine,
`us-central1-a`) usando **HTTP** (no HTTPS: la instancia no tiene certificado). Para publicar
cambios: `npm run build`, commit del nuevo `dist/`, `git pull` en la máquina virtual y reconstruir
con `docker compose up --build -d`.

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
