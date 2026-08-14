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

1. **Post contract and public read API**: complete. `GET /api/v1/posts` and `GET /api/v1/posts/{slug}` expose published posts only.
2. **Editorial post API**: complete. Protected draft creation, editing, listing, publishing, and unpublishing enforce slug validation and lifecycle rules.
3. **Admin authentication**: complete for local development. The API provides a configurable local administrator with a browser session login; `ADMIN_USERNAME` and `ADMIN_PASSWORD` must be changed outside local development.
4. **Admin editor**: complete as an initial usable editor. It supports login, list, draft creation/editing, and publish/unpublish. Preview and unsaved-change protection remain refinements.
5. **Public blog integration**: complete. The public site lists published API posts and includes loading, empty, not-found, and individual slug page states. Server-rendered metadata and canonical URLs remain an SEO refinement.
6. **Media workflow**: complete for featured images. Authenticated uploads go through the API to private MinIO/S3 storage with type and size limits; the admin editor supports upload, preview, removal, and post attachment, while public images are served through the API. Inline body images and a reusable media library remain future enhancements.
7. **Production hardening**: partially complete. CORS and environment-based configuration are present. Before deployment, use a production identity provider or hardened identity service, configure secret management, backups, rate limits, monitoring, and network restrictions for admin.

Before starting step 3, choose the production identity provider or explicitly confirm a self-managed credential model. That decision determines how admin sessions and production authorization should work.

## Quality checks

```bash
cd apps/web && npm run lint
cd apps/admin && npm run lint
cd apps/api && ./gradlew test
```