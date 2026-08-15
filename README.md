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

`NEXT_PUBLIC_API_BASE_URL` is a Next.js build-time setting, not a container runtime setting. For a deployment, set it in the server `.env` before building, then rebuild `web` and `admin`; for example `NEXT_PUBLIC_API_BASE_URL=https://blog-api.steve-labs.uk`.

All API runtime values in `compose.yaml` use `${VARIABLE:-local-default}` syntax. A server `.env` beside Compose can therefore override database, S3, admin, and CORS configuration without editing the tracked Compose file. After changing API runtime values, run `docker compose up -d --force-recreate api`; after changing `NEXT_PUBLIC_API_BASE_URL`, rebuild `web` and `admin` as described above.

### Run applications directly

Use this loop when you want fast frontend or backend reloads while keeping dependencies in containers:

1. Start PostgreSQL and MinIO: `docker compose up -d postgres minio`.
2. Run the API: `cd apps/api && ./gradlew bootRun`.
3. Run the public site: `cd apps/web && npm run dev`.
4. Run admin on its own port: `cd apps/admin && npm run dev -- --port 3001`.

Copy `.env.example` to `.env` before changing local connection or storage settings. Never commit `.env` or production credentials.

## Publishing roadmap

1. **Post contract and public read API**: complete. `GET /api/v1/posts` and `GET /api/v1/posts/{slug}` expose published posts only.
2. **Editorial post API**: complete. Protected draft creation, editing, listing, publishing, and unpublishing enforce slug validation and lifecycle rules.
3. **Admin authentication**: complete for local development. The API provides a configurable local administrator with a browser session login; `ADMIN_USERNAME` and `ADMIN_PASSWORD` must be changed outside local development.
4. **Admin editor**: complete as an initial usable editor. It supports login, list, draft creation/editing, and publish/unpublish. Preview and unsaved-change protection remain refinements.
5. **Public blog integration**: complete. The public site lists published API posts and includes loading, empty, not-found, and individual slug page states. Server-rendered metadata and canonical URLs remain an SEO refinement.
6. **Media workflow**: complete for featured images. Authenticated uploads go through the API to private MinIO/S3 storage with type and size limits; the admin editor supports upload, preview, removal, and post attachment, while public images are served through the API. Inline body images and a reusable media library remain future enhancements.
7. **Production hardening**: partially complete. CORS and environment-based configuration are present. Before deployment, use a production identity provider or hardened identity service, configure secret management, backups, rate limits, monitoring, and network restrictions for admin.

## Next Session Backlog

Work through these in order. Each item is deliberately small enough to be designed, implemented, and validated as one coherent slice.

1. **Protect editorial work**: complete. The admin editor tracks unsaved changes, warns before discarding a draft or closing the page, and has a local preview mode for title, featured image, excerpt, and body.
2. **Make the public site SEO-ready**: render post data on the server, add per-post metadata, canonical URLs, Open Graph images, a sitemap, and `robots.txt`. The current browser-side data fetching is functional but not an ideal production blog surface.
3. **Improve the writing model**: choose Markdown as the first content format, render it safely on the public site, and add formatting assistance in the editor. Keep raw HTML disabled or sanitised.
4. **Expand the media workflow**: add a media library view with image metadata, reuse existing uploads, and support inserting images into Markdown body content. Define deletion rules so images referenced by posts cannot be removed accidentally.
5. **Add editorial organisation**: introduce tags first, then optional series/categories. Add corresponding public filtering and archive pages only after their API and database contracts are stable.
6. **Harden authentication for deployment**: choose an identity provider or a managed authentication approach, remove the local default credential fallback, and limit the admin deployment to its intended access boundary.
7. **Operationalise deployment**: add CI for API tests, frontend lint/build, and image builds; define production environment variables and secret storage; configure database backups, object-storage lifecycle rules, structured logs, and uptime/error monitoring.

The recommended next task is **server-rendered SEO**. It makes the public blog discoverable and shareable without committing the project to a content format or external identity provider.

## Quality checks

```bash
cd apps/web && npm run lint
cd apps/admin && npm run lint
cd apps/api && ./gradlew test
```