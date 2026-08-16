# Steve's Lab

## Architecture

- `apps/web`: public Next.js site for `steve-lab.uk`.
- `apps/admin`: separately deployed, access-controlled Next.js administration app.
- `apps/api`: Spring Boot REST API; it owns PostgreSQL migrations and storage integrations.
- PostgreSQL is the source of truth. Media belongs in S3-compatible object storage, never in the database.
- Posts use Markdown bodies, optional featured media, and normalized reusable tags. The public API exposes published posts only.

## Local development

- Start dependencies: `docker compose up -d postgres minio`.
- Public site: `cd apps/web && npm run dev`.
- Admin: `cd apps/admin && npm run dev -- --port 3001`.
- API: `cd apps/api && ./gradlew bootRun`.
- Test the API without Docker: `cd apps/api && ./gradlew test`.
- Verify frontend changes with `npm run lint` and `npm run build` from the affected app.

## Conventions

- Keep API contracts explicit and versioned under `/api/v1` when endpoints are introduced.
- Use Flyway migrations for all PostgreSQL schema changes; do not use Hibernate schema generation.
- Map JPA entities to response DTOs inside a read-only service transaction when a response reads lazy relationships such as post tags.
- Treat tag values as lowercase slugs. The admin accepts comma-separated values and normalizes them before sending the request.
- Keep public server-rendered API requests on `INTERNAL_API_URL`; use `NEXT_PUBLIC_API_BASE_URL` only for browser-visible URLs such as media.
- Keep public and admin concerns separate. Do not put admin routes in `apps/web`.
- Never commit credentials. Add documented variables to `.env.example` when configuration changes.