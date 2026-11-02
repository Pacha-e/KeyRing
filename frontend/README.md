# Frontend

Install dependencies with `pnpm install --frozen-lockfile`. Use the pnpm version in `package.json`. Copy `.env.example` to `.env` and configure the API URL before building.

## Scripts

- `pnpm dev`: start the development server.
- `pnpm lint` / `pnpm lint:fix`: check / fix lint findings.
- `pnpm format` / `pnpm format:check`: format / check formatting.
- `pnpm typecheck`: check TypeScript and Vue types.
- `pnpm build`: create the production bundle.
- `pnpm preview`: serve the production bundle.
- `pnpm test:e2e`: run Playwright smoke tests against the production bundle; build first and install the Playwright Chromium browser separately.

## Folder responsibilities

- `src/views`: route screens and interaction orchestration.
- `src/components`: reusable UI.
- `src/router`: routes and guards.
- `src/stores`: domain state.
- `src/seeders`: typed initial data.
- `src/services`: domain service classes and HTTP boundaries.
- `src/utils`: technical utility classes.
- `src/interfaces`, `src/enums`, `src/dtos`: domain types, finite values, and transfer types.
- `src/composables`: reusable Vue reactive behavior.
- `src/assets` and `public`: bundled and directly served assets.
- `tests`: browser-level smoke tests.

See `Agents-how-to-code/rules/keyring-rules.md:9` for the course responsibility map.

## Docker

Build with `docker build --build-arg VITE_API_BASE_URL=https://example.com -t keyring-frontend .`. Vite embeds this value at build time; do not place secrets in it.
