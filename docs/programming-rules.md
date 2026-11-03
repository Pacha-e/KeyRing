# Programming rules

These are course requirements for new changes, not claims of full compliance. Check deviations below. Sources: Global Rules, KeyRing Rules and professor feedback.

1. **Source order.**
   - Rule: Separate present sections with comments; external imports precede internal imports; alphabetize names within sections. Preserve semantic order in routes, CSS cascade, SFC blocks, decorators and initialization.
   - Why: navigation without changing behavior.
   - Verify: ESLint where configured and review. Example: `nuxt/eslint.config.mjs:10`.
2. **Names and language.**
   - Rule: Use descriptive English identifiers, comments, filenames and UI text, except source quotations or externally supplied data.
   - Why: consistent communication.
   - Verify: review text and names. Source: KeyRing Rules.
3. **Boundaries.**
   - Rule: Keep each responsibility in the folder below; do not put prohibited material there.
   - Why: isolate reasons for change.
   - Verify: inspect imports and folder contents against this map. Source: KeyRing Rules.

| Area | May contain | May not contain |
|---|---|---|
| SPA views | Screens, local state, event orchestration, direct service calls | HTTP transport, persistence, seed data |
| SPA components | Reusable UI, typed props and emits | Routes, HTTP clients, seeders, generic table |
| SPA router | Routes, metadata, guards | Business logic or store data |
| SPA stores | Pinia setup stores and configuration | HTTP, services, unrelated monolithic storage |
| SPA services | Static domain service classes | UI, seeds, separate localStorage implementation |
| SPA utils | Static technical utility classes, HTTP client | Stores, UI, enums, seeds |
| SPA interfaces, enums, DTOs | One appropriate type or enum per dedicated file | Persistence, unrelated types or runtime services |
| SPA seeders | Typed initial domain data | Services or unconditional mutations |
| SPA composables | Documented reusable reactive behavior | Undocumented service replacements or generic repositories |
| Backend domain folders | Domain module, controller, service, entity, DTOs | Unrelated domains or frontend |
| Backend DTO folders | Validated request classes | Repositories, entities or handlers |
| Backend database migrations and seeders | Versioned schema changes; separate initial data | Seeds in migration files or schema changes in seeds |
| Backend utils/config/tests | Shared technical classes; configuration; tests respectively | Domain handlers in utils, credentials in config/tests |
| Nuxt pages/components/layouts | Route screens; reusable UI; shared shells respectively | Server-only data, API handlers or secrets |
| Nuxt composables | Documented reusable reactive behavior | Secrets or undocumented service replacements |
| Nuxt server API/data | Request handlers; server-side property data respectively | Browser UI or browser storage |
| Nuxt app data/public | Public blog or tool data; public assets | Secrets or server-only property data |

4. **SPA services and utilities.**
   - Rule: Views call named static service methods; HTTP goes through `HttpClient` in utils. Utilities are classes with static methods, not loose functions.
   - Why: explicit ownership.
   - Verify: review view imports and service/util exports. Evidence: `frontend/src/services/property.service.ts:8`.
5. **Domain types.**
   - Rule: Place interfaces, request DTOs and enums in separate named files; use `userId`, never `ownerId`, and do not add a properties collection to User.
   - Why: stable contracts.
   - Verify: compare entity, DTO and interface. Evidence: `backend/src/properties/entities/property.entity.ts:51`.
6. **Pinia.**
   - Rule: Register one PiniaConfig instance, restore persisted state and deep-watch changes; guard browser storage.
   - Why: persistence without competing stores.
   - Verify: inspect `frontend/src/stores/PiniaConfig.ts:8` and reload after mutation.
7. **Composables.**
   - Rule: Document reusable reactive concern, inputs, outputs and callers; do not hide domain service calls there.
   - Why: clear boundaries.
   - Verify: review each composable and callers. Framework hooks are exceptions to class-only utilities. Source: KeyRing Rules.
8. **Controllers and DTOs.**
   - Rule: Controllers accept DTO classes, validate their fields with class-validator under the global ValidationPipe, validate each `:id` using `ParseUUIDPipe` and delegate to services.
   - Why: reject invalid requests at the boundary.
   - Verify: controller/DTO review and invalid-request integration tests. Evidence: `backend/src/main.ts:11` and `backend/src/properties/properties.controller.ts:17`.
9. **Entities and migration.**
   - Rule: Match entity metadata and the versioned migration; use migrations with synchronization disabled.
   - Why: reproducible schema changes.
   - Verify: compare `backend/src/database/data-source.ts:18` with `backend/src/database/migrations/1730000000000-InitialSchema.ts` and `backend/src/database/migrations/1793595073942-PropertyUserForeignKey.ts` and test migration/recovery on a disposable database.
10. **Seeders.**
   - Rule: Keep seeders separate and idempotent; do not repopulate existing data on startup.
   - Why: avoid duplicate or overwritten data.
   - Verify: run startup twice against a disposable database and compare counts. Evidence: `backend/src/database/seeders/property.seeder.ts:17`.
11. **Errors.**
   - Rule: Handle, report or propagate failures; never silently swallow exceptions.
   - Why: failures remain diagnosable.
   - Verify: inspect every catch and test its failure path. Evidence: `frontend/src/stores/PiniaConfig.ts:19`.
12. **Nuxt rendering.**
   - Rule: Keep properties SSR, blog prerendered and tools CSR; property pages fetch from server API, which reads server data.
   - Why: meet course rendering requirements.
   - Verify: inspect `nuxt/nuxt.config.ts:15` and run route/build tests against the current repository.
13. **Tests and delivery.**
   - Rule: Test behavior affected by the change, run available lint, format, typecheck and tests; move issue → branch → PR → CI → review, with no direct main change.
   - Why: reviewable and reproducible delivery.
   - Verify: scripts and PR checks. Evidence: `nuxt/package.json:10`, course requirements.

14. **Frontend transfer objects.**
   - Rule: Define request DTO shapes in dedicated files; views construct DTOs and pass them to service methods.
   - Why: request contracts stay explicit at the UI boundary.
   - Verify: review view construction, service signatures and DTO imports. Source: KeyRing Rules.
15. **Interfaces and enums.**
   - Rule: Put each domain interface and enum in its own appropriately named file; backend domain enums are TypeScript enums validated in DTOs with `@IsEnum`.
   - Why: contracts are discoverable without mixing runtime behavior.
   - Verify: review the dedicated folders and imports. Source: KeyRing Rules.
16. **Entity ownership.**
   - Rule: Entity classes represent persisted backend state; controllers do not access repositories directly.
   - Why: persistence and request handling have separate responsibilities.
   - Verify: compare entity metadata, service repository injection, and controller calls. Evidence: `backend/src/properties/entities/property.entity.ts` and `backend/src/properties/properties.controller.ts`.

17. **Password security.**
   - Rule: Hash passwords before storage with `PasswordHasher`; verify login attempts against the hash and never return passwords in user responses. Hash legacy plaintext passwords through the migration.
   - Why: Avoid storing plaintext credentials or exposing password hashes in API responses.
   - Verify: review user creation, updates, login and response stripping; test the migration on a disposable database. Evidence: `backend/src/users/users.service.ts:41`, `backend/src/common/utils/password-hasher.ts:5`, and `backend/src/database/migrations/1793595073943-HashPlaintextPasswords.ts:14`.

18. **Authentication and authorization.**
   - Rule: Protect Nest API routes with the authentication guard; use current database roles and property ownership for authorization. Login returns a user and opaque token; logout revokes the token.
   - Why: Browser state alone cannot authorize requests.
   - Verify: test unauthorized, cross-owner and admin requests, expiration and logout. Sessions are held in memory for 12 hours and are lost on backend restart. Evidence: `backend/src/auth/auth.service.ts`, `frontend/src/utils/HttpClient.ts`.

## Known deviations and limits

- CI workflows are present for the backend, frontend and Nuxt applications; a running deployment must be verified separately.
- Pinia restores existing state or uses store defaults; no frontend domain seeder is present in the supplied source inventory. Backend seeders check counts but concurrent startup idempotence and partial seed recovery are not established. `backend/src/database/seeders/property.seeder.ts:17`.
- Nuxt property data uses numeric IDs and its own enum values, unlike the backend UUID/enum model. `nuxt/shared/interfaces/Property.ts`, `backend/src/properties/entities/property.entity.ts`.
