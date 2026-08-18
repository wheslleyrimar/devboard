# DevBoard

DevBoard is a project and task management application built with JavaScript and Node.js.

## Tech Stack

- **Runtime:** Node.js (ESM), Express
- **Database:** PostgreSQL
- **ORM / Migrations:** Prisma
- **Testing:** Vitest, Supertest
- **Tooling:** ESLint, Prettier, Docker Compose

## Requirements

- Node.js
- Docker (for running PostgreSQL locally)

## Getting Started

1. Copy the environment file and adjust values if needed:

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Apply database migrations and generate the Prisma client:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

## Key Commands

```bash
npm run dev              # start the app in development mode (nodemon)
npm start                # start the app
npm test                 # run the test suite (Vitest)
npm run lint             # run ESLint
npm run build            # generate the Prisma client
docker compose up -d     # start PostgreSQL
npx prisma migrate dev   # create/apply a migration
npx prisma generate      # regenerate the Prisma client
npm run prisma:seed      # seed the database
```

## Project Structure

```
src/
  app.js               # Express app setup
  server.js            # server entry point
  config/              # env and Prisma client configuration
  routes/               # HTTP route definitions
  controllers/          # request/response handling
  services/             # business logic
  domain/                # domain constants and error types
  middlewares/           # Express middlewares (error handling, etc.)
  public/                 # static frontend (HTML/CSS/JS)
prisma/
  schema.prisma          # database schema
docs/
  api.md                 # API reference
  database.md             # database notes
  decisions/               # architecture decision records
```

## Data Model

- **Project:** `id`, `name`, `desc`, `stack` (string list), `status`, timestamps, and its `tasks`.
- **Task:** `id`, `title`, `desc`, `priority`, `status`, timestamps, and the `Project` it belongs to (cascade delete).

See [prisma/schema.prisma](prisma/schema.prisma) for the full schema.

## API

Single-user application, no authentication.

- `GET /api/projects` — list projects (supports `status` and `search` filters)
- `POST /api/projects` — create a project
- `GET /api/projects/:id` — get a project with its tasks
- `POST /api/projects/:id/tasks` — create a task under a project

Full details in [docs/api.md](docs/api.md).

## Testing

Tests run against a real PostgreSQL instance using `.env.test`. Run the suite with:

```bash
npm test
```

Bug fixes should include a regression test; behavior that depends on PostgreSQL should be covered with integration tests.

## Documentation

Further documentation lives under [docs/](docs/):

- [docs/api.md](docs/api.md) — API reference
- [docs/database.md](docs/database.md) — database notes
- [docs/decisions/](docs/decisions/) — architecture decision records
