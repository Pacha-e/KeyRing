# Style guide

This guide describes the current repository structure; deployment must be verified separately. Paths are relative to the repository root.

## TypeScript

### What

Typed application language.

### How

Define explicit domain shapes. Evidence: `backend/src/domain/enums/property-status.ts:2`.

```text
export enum PropertyStatus {
  Active = 'ACTIVE',
  Vacant = 'VACANT',
}
```

### When

Use for domain contracts and application logic.

### Where

`backend/src/domain/enums/property-status.ts`.

## Vue 3 SFC

### What

Single-file view and component format.

### How

Keep script, template and style in framework order. Evidence: `nuxt/app/pages/properties/index.vue:1`.

```text
<script setup lang="ts">
```

### When

Use for screens and reusable UI.

### Where

`frontend/src/views/PropertyForm.vue`.

## Vue Router

### What

SPA navigation and guards.

### How

Use history mode and explicit route records. Evidence: `frontend/src/router/index.ts:21`.

```text
history: createWebHistory(),
```

### When

Use for SPA navigation.

### Where

`frontend/src/router/index.ts`.

## Pinia + PiniaConfig

### What

Reactive SPA session state and browser persistence.

### How

Create one Pinia instance and restore saved state. Evidence: `frontend/src/stores/PiniaConfig.ts:8`.

```text
const pinia = createPinia();
```

### When

Use for shared session state.

### Where

`frontend/src/stores/auth.ts`.

## Axios via HttpClient

### What

Central SPA HTTP transport.

### How

Call the configured Axios instance from domain services. Evidence: `frontend/src/services/property.service.ts:30`.

```text
const { data } = await HttpClient.instance.get<PropertyInterface[]>('/api/properties');
```

### When

Use for SPA REST operations.

### Where

`frontend/src/utils/HttpClient.ts`.

## Nuxt 4

### What

Hybrid Vue application framework.

### How

Fetch server data in a page and render pending/error states. Evidence: `nuxt/app/pages/properties/index.vue:6`.

```text
const { data: properties, error, pending } = await useFetch<Property[]>('/api/properties');
```

### When

Use for property SSR, blog prerendering and client tools.

### Where

`nuxt/nuxt.config.ts`.

## NestJS

### What

Backend modular HTTP framework.

### How

Controllers receive DTOs and delegate to injected services. Evidence: `backend/src/properties/properties.controller.ts:18`.

```text
return this.propertiesService.create(createPropertyDto);
```

### When

Use for REST endpoints and business services.

### Where

`backend/src/properties/properties.controller.ts`.

## TypeORM + SQLite

### What

ORM and persistent SQLite database.

### How

Apply migrations, not automatic synchronization. Evidence: `backend/src/database/data-source.ts:23`.

```text
synchronize: false,
```

### When

Use for backend persistence and schema evolution.

### Where

`backend/src/database/data-source.ts`.

## class-validator

### What

Runtime DTO validation decorators.

### How

Decorate request properties and enable the global pipe. Evidence: `backend/src/contracts/dto/create-contract.dto.ts:11`.

```text
@IsInt() @Min(1) fixedRent: number;
```

### When

Use on backend request DTOs.

### Where

`backend/src/main.ts`.

## bcryptjs / password security

### What

Password hashing and verification through the static `PasswordHasher` utility.

### How

Hash passwords before storage and compare login attempts against the stored hash. Evidence: `backend/src/common/utils/password-hasher.ts:6`.

```typescript
static hash(password: string): Promise<string> {
  return hash(password, 10);
}
```

### When

Use for user creation, password changes, login verification, seed data, and migration of legacy plaintext passwords. Exclude passwords from user responses.

### Where

`backend/src/common/utils/password-hasher.ts`, `backend/src/users/users.service.ts`, `backend/src/database/seeders/user.seeder.ts`, and `backend/src/database/migrations/1793595073943-HashPlaintextPasswords.ts`.

## ESLint

### What

Static source checks.

### How

Keep framework block order and imports configured. Evidence: `nuxt/eslint.config.mjs:21`.

```text
'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
```

### When

Run the lint script when changing code.

### Where

`nuxt/eslint.config.mjs`.

## Prettier

### What

Consistent formatting.

### How

Use the checked-in format-check script. Evidence: `nuxt/package.json:17`.

```text
"format:check": "prettier --check .",
```

### When

Check formatting before review.

### Where

`nuxt/package.json`.

## Playwright

### What

Browser end-to-end tests.

### How

Assert visible behavior and navigation. Evidence: `nuxt/tests/e2e/home.spec.ts:6`.

```text
await page.goto('/');
```

### When

Use for browser journeys.

### Where

`nuxt/tests/e2e/home.spec.ts`.

## pnpm

### What

Package manager for the Nuxt project.

### How

Use the version recorded by the project. Evidence: `nuxt/package.json:5`.

```text
"packageManager": "pnpm@11.10.0",
```

### When

Use the project scripts for development and checks.

### Where

`nuxt/package.json`.

## Docker

### What

Container build and runtime.

### How

Build Nuxt output in one stage and run it in another. Evidence: `nuxt/Dockerfile:30`.

```text
CMD ["node", ".output/server/index.mjs"]
```

### When

Use for the Nuxt production image.

### Where

`nuxt/Dockerfile`.

## GitHub Actions

### What

Hosted CI automation for pull requests and pushes.

### How

Run the configured verification job and review its result. Evidence: `.github/workflows/nuxt.yml:23`.

```yaml
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm typecheck
```

### When

Use for changes matching the workflow's path filters.

### Where

`.github/workflows/nuxt.yml` and `.github/workflows/frontend.yml`.

## Git

### What

Version control and collaborative review.

### How

Use the issue-to-branch-to-PR workflow. CI checks out the revision under review (`.github/workflows/nuxt.yml:20`):

```yaml
- uses: actions/checkout@v4
```

### When

Use for every coordinated change.

### Where

Repository branches and pull requests; CI configuration: `.github/workflows/nuxt.yml`.
