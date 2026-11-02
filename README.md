# KeyRing

KeyRing is a property-management dashboard for short-term rentals and fixed contracts. It provides authentication, property and contract CRUD, transactions, reports, and a map view. The project is developed for the *Ingeniería de Desarrollo Web* course.

The repository is a monorepo with three applications:

- **backend/** — NestJS REST API with TypeORM and SQLite.
- **frontend/** — Vue 3 single-page application served by nginx in production.
- **nuxt/** — Nuxt 4 hybrid shell (SSR, prerendered blog, and CSR tools).

Compiled output is **not** versioned. Production images are built with multi-stage Dockerfiles.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `backend/` | NestJS API, entities, DTOs, migrations, and seeders. |
| `frontend/` | Vue SPA source, public assets, and nginx configuration. |
| `nuxt/` | Nuxt 4 application pages, layouts, server API, and rendering rules. |
| `docs/assets/` | Source assets such as the original logo. |
| `.github/` | Pull request and issue templates. |
| `tools/` | Helper scripts, e.g. `build-logo-assets.py`. |
| `docker-compose.yml` | Full-stack local orchestration. |
| `.editorconfig`, `.gitignore`, `.nvmrc` | Shared editor and version-control settings. |

## Prerequisites

- Node.js 26 (see `.nvmrc`)
- pnpm 11 or later (managed by `packageManager` fields)
- Docker and Docker Compose (for the containerized stack)

## Local development

Run each app in its own terminal from the repository root.

### Backend

```bash
cd backend
pnpm install
pnpm dev
```

API base URL: `http://localhost:3000/api`

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Development server: `http://localhost:5173`

The frontend expects the API at `http://localhost:3000/api`. To change this, create `frontend/.env` from `frontend/.env.example` and set `VITE_API_BASE_URL`.

### Nuxt

```bash
cd nuxt
pnpm install
pnpm dev --port 3001
```

Development server: `http://localhost:3001`

## Quality gates

Run the relevant checks before opening a pull request.

| App | Lint | Format check | Type check | Build | E2E tests |
| --- | --- | --- | --- | --- | --- |
| backend | `pnpm lint` | `pnpm format:check` | `pnpm build` (includes TypeScript) | `pnpm build` | — |
| frontend | `pnpm lint` | `pnpm format:check` | `pnpm typecheck` | `pnpm build` | `pnpm test:e2e` |
| nuxt | `pnpm lint` | `pnpm format:check` | `pnpm typecheck` | `pnpm build` | `pnpm test:e2e` |

## Docker Compose

Build and run the whole stack locally:

```bash
docker compose up --build -d
```

| Service | URL | Notes |
| --- | --- | --- |
| backend | `http://localhost:3000/api` | SQLite data persists in the `keyring-data` volume. |
| frontend | `http://localhost` | Static SPA served by nginx. |
| nuxt | `http://localhost:3001` | Node server running the Nitro output. |


## Deployment on GCP

The course deployment uses a Google Compute Engine VM:

1. Create a VM (e.g. `e2-micro` or `e2-medium`) with Debian 13 and allow HTTP/HTTPS traffic.
2. Add a firewall rule that exposes port `3000` for the API.
3. Install Docker and the Docker Compose plugin on the VM.
4. Clone the repository and move into the project root.
5. Set `VITE_API_BASE_URL` to the VM external IP (either in `frontend/.env.production` or as a Docker build argument).
6. Run `docker compose up --build -d`.
7. Verify the public IP over HTTP:
   - Frontend: `http://<VM_IP>`
   - API: `http://<VM_IP>:3000/api`

For a larger team or heavier builds, use an `e2-medium` instance and build inside Docker instead of committing compiled `dist/` folders.

## Branch and pull-request workflow

1. Create an issue describing the change.
2. Create a feature or chore branch from `main`.
3. Make focused commits that keep generated files and build output out of version control.
4. Open a pull request using the template in `.github/PULL_REQUEST_TEMPLATE.md`.
5. Ensure CI checks and the verification checklist pass.
6. Request a review and merge only after approval.

## Documentation

- [Pull request template](.github/PULL_REQUEST_TEMPLATE.md)
- [Feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- [Bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- [Source logo asset](docs/assets/logo-original.jpeg)
