# Database

PostgreSQL is the source of truth, accessed via Prisma (`prisma/schema.prisma`).

## Models

**Project**
- `id` — UUID, primary key
- `name`, `desc` — strings
- `stack` — `String[]`, free-form tags (no separate `Tag` table)
- `status` — one of `active` / `paused` / `completed` (validated in `src/services/projects.service.js`, not a Postgres enum yet)
- `createdAt` — set once on creation
- `updatedAt` — `@updatedAt`, bumped automatically by Prisma on every write to the row, including the touch update performed when a task is added (see below)
- `tasks` — one-to-many relation to `Task`, cascade delete

**Task**
- `id` — UUID, primary key
- `title`, `desc` — strings
- `priority` — one of `low` / `medium` / `high`
- `status` — one of `todo` / `in_progress` / `done`
- `createdAt` — set once on creation
- `projectId` — foreign key to `Project`, `onDelete: Cascade`

## Notes

- Single-user app: no `User` model, no ownership/authorization at the row level. If multi-user support is added later, `Project` needs an `ownerId` and every service query must scope by it.
- `status`/`priority` are plain strings, validated in the service layer, not Postgres enums — kept simple for the initial migration; converting to enums is a safe, additive follow-up.
- Creating a task explicitly sets `updatedAt: new Date()` on the parent project (`prisma.project.update({ where: { id }, data: { updatedAt: new Date() } })`) — Prisma's `@updatedAt` is only recalculated when the update payload is non-empty, so a bare `data: {}` would silently leave it unchanged. This is a deliberate behavior change from the original localStorage app, where the project's `updated` field never changed after creation.

## Migrations

Never edit a migration already applied to a shared/production environment — create a new one instead:

```bash
npx prisma migrate dev
npx prisma generate
```

## Seed

`prisma/seed.js` loads the same 8 demo projects the original app hardcoded in `seedProjects()`. It's a no-op if the `Project` table already has rows.

## Tests use a separate database

Integration tests (`tests/integration/`) call `prisma.project.deleteMany()` / `prisma.task.deleteMany()` between runs — pointing them at the dev database would wipe real data. `npm test` loads `.env.test` (via `node --env-file`), which targets `devboard_test`, not `devboard`.

`docker-compose.yml` creates `devboard_test` automatically on a fresh volume (`docker/initdb/01-create-test-db.sql`). On an existing volume, or after a schema change, apply migrations to it with `npm run test:migrate` before running tests.
