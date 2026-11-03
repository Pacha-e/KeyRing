# KeyRing

KeyRing is a property-management dashboard for short-term rentals and fixed contracts. It provides credential-based login, property and contract CRUD, transactions, reports, and a map view. The project is developed for the *Ingeniería de Desarrollo Web* course.

The repository is a monorepo with three applications:

- **backend/** — NestJS REST API with TypeORM and SQLite.
- **frontend/** — Vue 3 single-page application served by nginx in production.
- **nuxt/** — Nuxt 4 mini-application with an SSG blog, SSR properties, and CSR tools.

Compiled output is **not** versioned. Production images are built with multi-stage Dockerfiles.

Login returns `{ user, token }`. The SPA sends the opaque token as `Authorization: Bearer <token>`; protected requests without a valid token receive `401`. Sessions live in server memory for up to 12 hours and are invalidated by logout or a backend restart. The API reloads the user's role and enforces role and property ownership on the server. These sessions are not shared between backend instances.

On a completely empty database, the seed creates fixed demonstration accounts documented in [the backend guide](backend/README.md#demo-users). They are for the course demonstration and must not be used for real production data.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `backend/` | NestJS API, entities, DTOs, migrations, and seeders. |
| `frontend/` | Vue SPA source, public assets, and nginx configuration. |
| `nuxt/` | Nuxt 4 application pages, layouts, server API, and rendering rules. |
| `docs/` | Style guide, programming rules, architecture and class diagrams. |
| `docs/assets/` | Source assets such as the original logo. |
| `.github/` | CI workflows, pull request templates, and issue templates. |
| `tools/` | Helper scripts, e.g. `build-logo-assets.py`. |
| `docker-compose.yml` | Full-stack local orchestration. |
| `.editorconfig`, `.gitignore`, `.nvmrc` | Shared editor and version-control settings. |

## Prerequisites

- Node.js 26 for local development (see `.nvmrc`; the application Dockerfiles also use Node 26)
- pnpm 11.10.0 (pinned by each application's `packageManager` field)
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

The frontend expects the API at `http://localhost:3000/api`. To change this during local development, create `frontend/.env` from `frontend/.env.example` and set `VITE_API_BASE_URL` to the backend origin, for example `http://localhost:3000`, without `/api`. The services add the `/api` prefix themselves. Restart the development server after changing the environment file.

### Nuxt

```bash
cd nuxt
pnpm install
pnpm dev --port 3001
```

Development server: `http://localhost:3001`

| Nuxt route | Content | Rendering |
| --- | --- | --- |
| `/blog` and `/blog/<slug>` | Three articles and their detail pages | SSG: prerendered during the build |
| `/properties` and `/properties/<id>` | Demo properties served by the Nuxt server API | SSR: rendered on the server |
| `/tools`, `/tools/rent-calculator`, `/tools/faq` | Tools index, calculator, and FAQ | CSR: rendered in the browser |

The Nuxt property data is defined in `nuxt/server/data/`; it is separate from the Nest API and its SQLite database, as required by the hybrid assignment.

## Quality gates

Run the relevant checks before opening a pull request.

| App | Lint | Format check | Type check | Build | Integration / E2E tests |
| --- | --- | --- | --- | --- | --- |
| backend | `pnpm lint` | `pnpm format:check` | `pnpm build` (includes TypeScript) | `pnpm build` | `pnpm test:integration` |
| frontend | `pnpm lint` | `pnpm format:check` | `pnpm typecheck` | `pnpm build` | `pnpm test:e2e` |
| nuxt | `pnpm lint` | `pnpm format:check` | `pnpm typecheck` | `pnpm build` | `pnpm test:e2e` |

Run commands from the corresponding app directory. Before the first E2E run, install its Chromium browser with `pnpm exec playwright install chromium`, then build the app before running `pnpm test:e2e`. Nuxt E2E starts its own server on port `3000`, which must be free during the test.

Build the backend before running `pnpm test:integration`. Its temporary SQLite tests cover authentication, ownership, validation, concurrent administrator changes, and seed rollback; the latest local run passed 23 authentication checks and 4 seed checks. They do not establish production readiness or replace deployment verification.

## Docker Compose

Build and run the whole stack locally:

```bash
docker compose up --build -d
```

| Service | URL | Notes |
| --- | --- | --- |
| backend | `http://localhost:3000/api` | SQLite data persists in the `keyring-data` volume. |
| frontend | `http://localhost` | Static SPA served by nginx. |
| nuxt | `http://localhost:3001/blog` | Node server running the hybrid Nitro output. |

The default Compose configuration is for local use: it embeds `http://localhost:3000` in the frontend build and allows local browser origins through backend CORS. Use the deployment override below for remote access.

## Deployment on GCP

Use the course Google Compute Engine VM with Docker and the Docker Compose plugin installed. Expose ports `80` (SPA), `3000` (API), and `3001` (Nuxt) through the VM firewall.

1. Check out the reviewed revision and enter the repository root. Record its commit with `git rev-parse HEAD`.
2. Save the following override outside the checkout, for example as `../keyring.production.yml`. Replace every `<VM_IP>` with the VM's external IP:

   ```yaml
   services:
     backend:
       environment:
         CORS_ORIGIN: "http://<VM_IP>,http://<VM_IP>:3001"
     frontend:
       build:
         args:
           VITE_API_BASE_URL: "http://<VM_IP>:3000"
   ```

   The build argument overrides the local URL in `docker-compose.yml`. Changing `frontend/.env.production` alone does not override that explicit build argument. The browser origin must also be allowed by backend CORS.

3. Validate the combined configuration, build the services sequentially, and start them using the same override:

   ```bash
   docker compose -f docker-compose.yml -f ../keyring.production.yml config --quiet
   docker compose -f docker-compose.yml -f ../keyring.production.yml build backend
   docker compose -f docker-compose.yml -f ../keyring.production.yml build frontend
   docker compose -f docker-compose.yml -f ../keyring.production.yml build nuxt
   docker compose -f docker-compose.yml -f ../keyring.production.yml up -d
   docker compose -f docker-compose.yml -f ../keyring.production.yml ps
   ```

   Small VMs need enough RAM or swap for the builds. Preserve the existing `keyring-data` volume when updating the deployment.

4. Verify the public URLs over HTTP:
   - Frontend: `http://<VM_IP>/`
   - API: `http://<VM_IP>:3000/api/properties`
   - Nuxt: `http://<VM_IP>:3001/blog`, `/properties`, and `/tools/faq`

   An anonymous request to the API properties URL should return `401`. Sign in through the SPA with a course demo account, verify that login returns `{ user, token }`, and check that subsequent API requests include the Bearer token and return only the resources authorized for that user. Test logout and confirm that the old token no longer grants access. The demo accounts are created only when all four database tables are empty; an existing volume may contain different accounts.

   Check article and property content in the returned HTML, and FAQ rendering in the browser. HTTP status alone does not verify those flows. HTTPS requires a separately configured TLS endpoint.

5. Submit the repository and deployed Nuxt URLs through the course's authorized delivery channel before the deadline. Keep the assessed revision and deployment frozen after the cutoff until grading is complete.

## Branch and pull-request workflow

1. Create an issue describing the change.
2. Create a feature or chore branch from `main`.
3. Make focused commits that keep generated files and build output out of version control.
4. Open a pull request using the template in `.github/PULL_REQUEST_TEMPLATE.md`.
5. Ensure CI checks and the verification checklist pass.
6. Request a review and merge only after approval.

## Documentation

- [Style guide](docs/style-guide.md)
- [Programming rules](docs/programming-rules.md)
- [Class diagram](docs/diagrams/class-diagram.md)
- [Architecture diagram](docs/diagrams/architecture.md)
- [Pull request template](.github/PULL_REQUEST_TEMPLATE.md)
- [Feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- [Bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- [Source logo asset](docs/assets/logo-original.jpeg)
