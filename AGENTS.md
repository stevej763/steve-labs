# Steve's Lab

## Architecture

- `apps/web`: public Next.js site for `steve-lab.uk`.
- `apps/admin`: separately deployed, access-controlled Next.js administration app.
- `apps/api`: Spring Boot REST API; it owns PostgreSQL migrations and storage integrations.
- PostgreSQL is the source of truth. Media belongs in S3-compatible object storage, never in the database.

## Local development

- Start dependencies: `docker compose up -d postgres minio`.
- Public site: `cd apps/web && npm run dev`.
- Admin: `cd apps/admin && npm run dev -- --port 3001`.
- API: `cd apps/api && ./gradlew bootRun`.
- Test the API without Docker: `cd apps/api && ./gradlew test`.

## Conventions

- Keep API contracts explicit and versioned under `/api/v1` when endpoints are introduced.
- Use Flyway migrations for all PostgreSQL schema changes; do not use Hibernate schema generation.
- Keep public and admin concerns separate. Do not put admin routes in `apps/web`.
- Never commit credentials. Add documented variables to `.env.example` when configuration changes.