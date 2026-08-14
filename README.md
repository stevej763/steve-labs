# Steve's Lab

The platform behind [steve-lab.uk](https://steve-lab.uk): a public blog, a private editorial application, and a Java API.

## Components

| Component | Location | Responsibility |
| --- | --- | --- |
| Public web | `apps/web` | The reader-facing Next.js site. It renders published posts and must never contain administration routes or credentials. |
| Admin | `apps/admin` | A separately deployed Next.js application for drafting, editing, publishing, and managing media. It will require authenticated access before it handles real content. |
| API | `apps/api` | Spring Boot REST API and the only owner of blog business rules, authentication/authorization, database access, Flyway migrations, and object-storage integrations. API contracts are versioned beneath `/api/v1`. |
| PostgreSQL | Docker service `postgres` | Source of truth for posts and future structured editorial data. It stores metadata and content, not media files. |
| Object storage | MinIO locally; S3 in production | Stores images and attachments. The API will issue controlled upload/download access; the frontend apps do not access storage credentials. |

The web and admin apps communicate with the API through an explicit HTTP contract. This keeps the public site independently deployable while allowing the admin app to stay behind a separate access boundary.

## Services

| Service | Local address | Purpose |
| --- | --- | --- |
| Public blog | `http://localhost:3000` | Reader-facing Next.js site |
| Admin | `http://localhost:3001` | Private editorial workspace |
| API | `http://localhost:8080` | Spring Boot API; health at `/actuator/health` |
| PostgreSQL | `localhost:5432` | Content database |
| MinIO console | `http://localhost:9001` | Local S3-compatible object storage |

## Get running

### Full container stack

```bash
docker compose up --build -d
docker compose ps
```

This starts PostgreSQL, MinIO, the API, the public app, and admin. Stop it with `docker compose down`; append `--volumes` only when you deliberately want to discard local database and object-storage data.

### Run applications directly

Use this loop when you want fast frontend or backend reloads while keeping dependencies in containers:

1. Start PostgreSQL and MinIO: `docker compose up -d postgres minio`.
2. Run the API: `cd apps/api && ./gradlew bootRun`.
3. Run the public site: `cd apps/web && npm run dev`.
4. Run admin on its own port: `cd apps/admin && npm run dev -- --port 3001`.

Copy `.env.example` to `.env` before changing local connection or storage settings. Never commit `.env` or production credentials.

## Publishing roadmap

The first migration creates the `posts` table, but no content API or editor has been implemented yet. The work is intentionally sequenced so the public contract and access boundary are established before the editorial UI depends on them.

1. **Post contract and public read API**: define immutable response DTOs and implement `GET /api/v1/posts` plus `GET /api/v1/posts/{slug}`. Return only published posts, ordered newest first, with clear `404` handling and controller/service/repository tests.
2. **Editorial post API**: add protected create, update, list-all, publish, and unpublish operations. Define draft/published status transitions in the API, validate slugs, and add database-backed integration tests.
3. **Admin authentication**: replace the temporary HTTP Basic scaffold with a chosen identity model, beginning with a local administrator. Enforce authorization for every editorial route and add login/session handling in `apps/admin`.
4. **Admin editor**: connect the dashboard to the protected API, add post list, create/edit form, preview, explicit publish controls, loading/error states, and unsaved-change protection.
5. **Public blog integration**: replace the starter content in `apps/web` with API-backed post listing and slug pages, including empty, loading, and not-found states. Add metadata and canonical URLs for published posts.
6. **Media workflow**: add API-managed S3/MinIO uploads with content-type and size validation, then attach media references to posts. Keep binary data outside PostgreSQL.
7. **Production hardening**: configure deployment-specific CORS, credentials, secrets, backups, observability, rate limiting, and CI checks. Place admin behind its intended network/access controls.

Before starting step 3, choose the production identity provider or explicitly confirm a self-managed credential model. That decision determines how admin sessions and production authorization should work.

## Quality checks

```bash
cd apps/web && npm run lint
cd apps/admin && npm run lint
cd apps/api && ./gradlew test
```