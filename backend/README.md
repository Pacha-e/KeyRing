# KeyRing backend

NestJS REST API with TypeORM and SQLite. Run commands from this directory.

## Configuration

Set `DATABASE_PATH` (default `data/keyring.sqlite`), `PORT` (default `3000`) and `CORS_ORIGIN` (comma-separated origins). `.env.example` documents these variables; export them in your shell or supply them through your deployment environment.

## Commands

- `pnpm build` compiles the application; `pnpm start` starts the compiled API at `/api`.
- `pnpm dev` starts development watch mode.
- `pnpm lint` and `pnpm format:check` check source quality.
- `pnpm build` followed by `pnpm test:integration` exercises authentication, ownership and seed behavior against temporary databases.
- `pnpm migration:generate -- src/database/migrations/ChangeName` generates a migration after building.
- `pnpm migration:run` applies pending migrations; `pnpm migration:revert` reverts the latest migration.

Migrations also run at startup. Back up existing databases before schema changes; the initial migration targets a fresh database and does not import earlier synchronized databases. Restore the backup if a migration fails. Seeders run together in one transaction only when all four tables are empty; any existing data prevents sample insertion.

## Structure

`src/database/data-source.ts` owns database configuration. `src/database/migrations/` owns schema history; `src/database/seeders/` owns initial sample data. Domain modules contain controllers, services, DTOs and entities. The Docker image builds with pnpm, runs migrations at startup and stores SQLite in the `/app/data` volume.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/email-taken` | Check whether an email is already in use |
| `POST` | `/api/users/login` | Authenticate with `{ email, password }`; returns `{ user, token }` on success or `401 Unauthorized` on invalid credentials |
| `GET` | `/api/users/:id` | Get a single user |
| `POST` | `/api/users` | Create a new user |
| `PATCH` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

## Demo users

| Email | Password |
|---|---|
| `admin@keyring.co` | `admin123` |
| `user@keyring.co` | `user123` |

The password migration is irreversible. Restore a database backup to recover its previous values.

Protected endpoints require `Authorization: Bearer <token>`. Sessions expire after 12 hours, are held in memory, and are invalidated on server restart. `POST /api/users/logout` revokes the current session. Anonymous registration can only create a normal user.
