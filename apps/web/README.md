# Public Web

The public Next.js application for `steve-lab.uk`. It server-renders published posts from the Spring Boot API and must not contain editorial routes or credentials.

## Run Locally

```bash
cd ../..
docker compose up -d postgres minio
cd apps/api && ./gradlew bootRun # terminal 1
```

```bash
cd ../web # terminal 2
npm run dev
```

Open `http://localhost:3000`.

## API Access

- Use `INTERNAL_API_URL` for server-rendered fetches. Docker Compose supplies `http://api:8080`; direct local development normally uses `http://localhost:8080`.
- Use `NEXT_PUBLIC_API_BASE_URL` only for browser-visible URLs, including media URLs embedded in post Markdown.
- The public API returns published posts, their optional featured image, and their tags. Post bodies are Markdown rendered by `src/lib/markdown.ts`; raw HTML is escaped.

## Checks

```bash
npm run lint
npm run build
```

The Markdown unit test is `src/lib/markdown.test.ts`; run it through the project's configured test tooling when one is added. The raw Node test runner does not resolve the project's extensionless TypeScript imports.

## Deployment

`NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` are build-time variables. Rebuild the app after changing either value.
