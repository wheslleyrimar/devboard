# Project: DevBoard

DevBoard is a project and task management application built with JavaScript and Node.js.

Use PostgreSQL as the primary database and Prisma for database access and migrations. Prefer simple, production-oriented solutions and evolve the codebase incrementally.

## Key Commands

```bash
npm run dev
npm test
npm run lint
npm run build
docker compose up -d
npx prisma migrate dev
npx prisma generate
```

Prefer existing `package.json` scripts over invoking tools directly.

Run tests and lint after meaningful changes.

## Database

PostgreSQL is the source of truth.

Use Prisma for database access and schema migrations.

After changing `prisma/schema.prisma`, run:

```bash
npx prisma migrate dev
npx prisma generate
```

Never modify migrations already applied to shared or production environments. Create a new migration instead.

Use transactions when multiple writes must succeed or fail together.

Avoid N+1 queries and unnecessary data fetching.

## Testing

Test business rules and observable behavior rather than implementation details.

Bug fixes should include regression tests.

Use integration tests when behavior depends on PostgreSQL or other external infrastructure.

## Security

Never expose database credentials, API secrets, or privileged tokens to frontend code.

Keep secrets in environment variables and validate required configuration during application startup.

Authorization must be enforced on the server, even when the frontend already hides unavailable actions.

Use parameterized queries or ORM APIs for all database access.

## Caveats

- Do not put business logic directly in HTTP routes.
- Do not call Prisma throughout unrelated modules; keep persistence boundaries explicit.
- Do not bypass migrations for schema changes.
- Do not use Redis as permanent storage.
- Do not trust frontend validation for security or data integrity.
- Do not expose internal errors directly through API responses.
- Do not mix major architecture migrations with unrelated feature work.
- Do not add abstractions based on hypothetical future requirements.
- Do not duplicate formatting rules here; enforce them with ESLint, Prettier, and hooks.

## Engineering Principles

Favor:

- simple solutions
- small, reviewable changes
- separation of concerns
- explicit dependencies
- database integrity
- testable business logic
- backward-compatible migrations

Before adding a framework, dependency, queue, cache, service, or architectural layer, identify the concrete problem it solves.

## Documentation

Keep detailed documentation outside this file.

Use files such as:

```text
docs/database.md
docs/api.md
docs/decisions/
```

Keep `CLAUDE.md` concise and update it as the project evolves.