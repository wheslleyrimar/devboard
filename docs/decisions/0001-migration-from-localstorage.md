# 0001 — Migration from localStorage to Node/Express/PostgreSQL/Prisma

## Context

DevBoard started as a static `index.html` + `app.js` pair with no build step and no backend, persisting state in the browser's `localStorage`. `CLAUDE.md` was introduced afterward, requiring a Node.js backend, PostgreSQL as the source of truth via Prisma, tests, lint, and server-side authorization. The two were out of sync.

## Decisions

- **Single-user, no auth.** The original app has no concept of users or ownership. Adding auth would be a new feature, not a migration, so it was left out. No `User` model, no `ownerId`.
- **`stack` is `String[]`**, not a normalized `Tag` table. The original app treated it as a free-form, comma-separated list; a relational table would add structure the app never had.
- **`updatedAt` is automatic (`@updatedAt`)**, not the original date-only `updated` field that only changed at creation. This is a deliberate, observable behavior change: adding a task to a project now bumps it to the top of the list (see `docs/database.md`). Everything else in the migration preserves the original app's observable behavior exactly.
- **No edit/delete endpoints.** The original app only ever created projects and tasks; the migration didn't add capabilities the app never had.
- **Client-side filter/search/sort kept as-is** in `src/public/app.js`; the frontend fetches the full project list once and filters in the browser, matching the original app's logic almost line-for-line. The server also supports `status`/`search` query params for future use (e.g. pagination), but the frontend doesn't rely on them yet.
