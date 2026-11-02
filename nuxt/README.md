# KeyRing Nuxt application

This application provides the Nuxt 4 shell for Entregable 2. Feature routes will be added separately.

## Rendering map

| Route            | Mode                  | Why                                        |
| ---------------- | --------------------- | ------------------------------------------ |
| `/`              | Server-side rendering | Deliver the shell as HTML on request.      |
| `/blog/**`       | Static prerendering   | Serve published articles as prebuilt HTML. |
| `/properties/**` | Server-side rendering | Render property content on request.        |
| `/tools/**`      | Client-side rendering | Run interactive tools in the browser.      |

`/blog` is listed as a prerender seed but does not exist yet. The temporary `failOnError: false` allows the scaffold to build and may hide other prerender failures; remove it when the blog route is added and verify the generated HTML. Production uses `pnpm build` and the Nitro server, not `pnpm generate`.

## Scripts

- `pnpm dev`: start the development server.
- `pnpm build`: build the production server.
- `pnpm generate`: generate a static site for exploration, not production deployment.
- `pnpm preview`: preview the production build.
- `pnpm lint` / `pnpm lint:fix`: check / fix lint violations.
- `pnpm format` / `pnpm format:check`: format / check formatting.
- `pnpm typecheck`: check TypeScript and Vue types.
- `pnpm test:e2e`: run Playwright against an existing production build.

## Folder responsibilities

| Path             | Responsibility                                           |
| ---------------- | -------------------------------------------------------- |
| `app/app.vue`    | Root layout and page outlet.                             |
| `app/layouts/`   | Shared application shell.                                |
| `app/pages/`     | File-based routes.                                       |
| `tests/e2e/`     | Browser smoke tests.                                     |
| `nuxt.config.ts` | Modules, rendering rules, and application configuration. |
