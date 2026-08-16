# Editorial Admin

The private Next.js editorial application. It uses the browser-facing API URL and authenticated browser sessions to draft, edit, preview, publish, tag, and manage post media.

## Run Locally

```bash
cd ../..
docker compose up -d postgres minio
cd apps/api && ./gradlew bootRun # terminal 1
```

```bash
cd ../admin # terminal 2
npm run dev
```

Open `http://localhost:3000`, or use `npm run dev -- --port 3001` when the public app is also running.

## Editorial Contract

- All browser requests use `NEXT_PUBLIC_API_BASE_URL` with `credentials: "include"`.
- The API owns publishing lifecycle, authentication, media storage, and tag persistence. Do not duplicate these rules in the client.
- Tags are lowercase slugs. The editor accepts comma-separated values, then trims, lowercases, and de-duplicates them before saving.
- The media library inserts image Markdown into the post body. Do not add direct object-storage credentials to this application.

## Checks

```bash
npm run lint
npm run build
```

## Deployment

`NEXT_PUBLIC_API_BASE_URL` is embedded at build time. Rebuild the admin app after changing it.
