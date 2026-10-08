# Deployment

The app builds to a set of static files in `dist/`, so it can be served by any static host,
container or CDN. This repository ships first-class support for **Docker/nginx**, **Railway**
and **Vercel**.

## Local production build

```bash
npm install
npm run build        # tsc + vite build  →  dist/
npm run preview      # serve dist/ at http://localhost:3000
```

## Docker

[`Dockerfile`](../Dockerfile) is a two-stage build:

1. **Builder** — `node:20-alpine`, install dependencies, `npm run build`.
2. **Runtime** — `nginx:alpine` serving `/usr/share/nginx/html`, with `wget` installed for the
   healthcheck.

The image ships [`nginx.docker.conf`](../nginx.docker.conf) as the default server block, adds
[`docker-entrypoint.sh`](../docker-entrypoint.sh) (which substitutes the runtime `PORT` into the
nginx config) and registers [`healthcheck.sh`](../healthcheck.sh) as the container
`HEALTHCHECK`. The container binds whichever `PORT` the platform provides.

```bash
docker build -t memory-loop .
docker run -p 8080:8080 -e PORT=8080 memory-loop
```

Three nginx configurations ship in the repo:

| File | Use |
| --- | --- |
| `nginx.conf` | Static-host baseline |
| `nginx.docker.conf` | Container default for Docker/Railway |
| `nginx.dynamic-port.conf` | Listens on the injected `PORT` |

All three apply SPA fallback, long-lived caching for hashed assets, and short caching for the
service worker and manifest.

## Railway

- [`railway.json`](../railway.json) — build/deploy settings for the standard flow.
- [`railway.dockerfile.json`](../railway.dockerfile.json) — Dockerfile-based variant.

Railway injects `PORT`; the entrypoint rewrites the nginx listen directive, and the healthcheck
polls the injected port.

## Vercel

[`vercel.json`](../vercel.json) configures the SPA rewrite so client-side routes resolve to
`index.html` (deep links such as `/dashboard/:id` keep working). Build command: `npm run build`,
output directory: `dist`.

## Environment

```dotenv
VITE_API_BASE_URL=https://api.example.com
```

`.env.example` documents the variable. The app reads it in
[`src/shared/constants/server.ts`](../src/shared/constants/server.ts) and falls back to the hosted
API when it is unset. Nothing else is required to run the frontend.

## PWA, caching and the service worker

[`vite.config.ts`](../vite.config.ts) configures `vite-plugin-pwa`:

- manifest (`manifest.webmanifest`): name **Memory Loop**, theme colour `#2563eb`, portrait,
  categories `education`, `productivity`, `lifestyle`, maskable icons
- precache globs: `js, css, html, ico, png, svg, woff2, webp`
- runtime caching:
  - `https://api.memoryloop.co/*` → **NetworkFirst**, 50 entries, 24 h
  - Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) → **CacheFirst**, 1 year
- `navigateFallback: /index.html` with `/api/*` excluded, so SPA routes work offline but API
  calls never resolve to HTML
- the service worker is enabled in dev (`devOptions.enabled`) so the install prompt can be
  tested locally

Because asset filenames are content-hashed (`assets/[name]-[hash].js`), new deploys invalidate
caches automatically, and `registerType: 'autoUpdate'` keeps installed clients fresh.

## Release checklist

1. `npm install`
2. `npm run lint`
3. `npm run build`
4. `npm run preview` and smoke-test the main flows (auth, create recap, dashboard, review)
5. Deploy the container or static output; confirm the healthcheck passes and both `/` and a deep
   link load.
