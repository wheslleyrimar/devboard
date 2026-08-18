# API

No auth — single-user app (see `docs/decisions/0001-migration-from-localstorage.md`).

## `GET /api/projects`

Lists projects, sorted by `updatedAt` desc.

Query params (optional):
- `status` — `active` | `paused` | `completed`. Omit or pass `all` for no filter.
- `search` — case-insensitive substring match against `name`, `desc`, or any `stack` entry.

Each project includes `tasks` as `{ id }` only (for the task-count badge), not full task data.

## `POST /api/projects`

Body: `{ name, desc, stack: string[], status }`. All required; `status` must be one of the allowed values. Returns `201` with the created project (empty `tasks: []`), or `400` on validation failure.

## `GET /api/projects/:id`

Returns one project including full `tasks`, ordered by `createdAt` desc. `404` if not found.

## `POST /api/projects/:id/tasks`

Body: `{ title, desc, priority, status }`. All required; `priority`/`status` must be one of the allowed values. Returns `201` with the created task, or `404` if the project doesn't exist, or `400` on validation failure.

Side effect: bumps the parent project's `updatedAt`, which changes its position in the `GET /api/projects` ordering.

## Not implemented

No update or delete endpoints for projects or tasks — the original app never supported editing or deleting either, so none were added during the migration.
