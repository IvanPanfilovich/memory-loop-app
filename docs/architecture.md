# Architecture

Memory Loop is a **client-side single-page application**. It renders entirely in the browser and
talks to a separately hosted REST API over HTTPS/JSON. There is no server-side rendering and no
Node runtime in production — the build output in `dist/` is a set of static files served by
nginx, a CDN, or any static host.

## Runtime topology

```
┌────────────────────────────────────┐        HTTPS / JSON        ┌───────────────────────────────┐
│  Memory Loop SPA  (this repository) │ ─────────────────────────▶ │  Memory Loop API              │
│  React 19 · Vite 7 · Workbox PWA    │                            │  auth · users · recaps        │
│  Redux Toolkit · TanStack Query     │ ◀───────────────────────── │  flashcards · tts · recall    │
└───────────────┬────────────────────┘                            │  credits · billing · referrals│
                │ browser storage                                   └───────────────────────────────┘
     ┌──────────┴────────────┐
     │ cookies    → access + refresh tokens (set by AuthProvider)
     │ localStorage → redux-persist, whitelisted to `auth.user` only
     └───────────────────────┘
```

The API host is a single constant:
[`src/shared/constants/server.ts`](../src/shared/constants/server.ts) exports `SERVER_URL`, which
reads `VITE_API_BASE_URL` and falls back to `https://api.memoryloop.co`. Everything that talks to
the backend is built on top of it.

## Boot sequence

1. **`index.html`** mounts `#root` and loads `src/main.tsx` as a module.
2. **`src/main.tsx`** creates the React root and wraps the app in three providers:
   Redux `Provider` → `PersistGate` (rehydrates the persisted slice) → `BrowserRouter`.
3. **`src/app/index.tsx`** (`App`) composes the remaining providers, outer-first:

   ```
   QueryClientProvider → CookiesProvider → AuthProvider
       → SignInDialogProvider → NoCreditsDialogProvider → AppInner
   ```

4. **`AppInner`** owns the once-per-app concerns:

   - applies the theme mode class (`light`/`dark`) to `<html>` and the user's custom palette
     through `useThemeColors`
   - installs global `unhandledrejection` / `error` listeners and routes fetch failures through
     [`src/utils/fetchErrorHandler.ts`](../src/utils/fetchErrorHandler.ts)
   - starts background-request tracking (`cleanupOldRequests` → `initializeBackgroundTracking`)
   - forces scroll-to-top on every route change
   - splits rendering: the **landing page** renders bare, every other route renders inside the
     sidebar + header + scroll-area app shell, with `<Footer/>` and `<Notifications/>`

5. **`src/app/router.tsx`** declares all routes; protected routes are wrapped in `AuthGuard`.
6. **`src/app/i18n.ts`** initialises i18next (English / Russian) with the HTTP backend that loads
   bundles from `public/locales/*`.

## Feature-Sliced Design layers

The source tree follows **Feature-Sliced Design (FSD)**. The rule is directional: a layer may
import only from the layers *below* it.

```
app        application shell: providers, routing, global styles        (may import anything below)
 ▲
pages      route-level screens                                         (widgets, features, entities, shared)
 ▲
widgets    composite blocks assembled from features + entities         (features, entities, shared)
 ▲
features   user-facing capabilities                                    (entities, shared)
 ▲
entities   domain models + their API/hooks                             (shared)
 ▲
shared     design system, hooks, constants, utilities                  (nothing above it)
```

| Layer | Path | Responsibility |
| --- | --- | --- |
| `app` | `src/app` | Providers, router, i18n bootstrap, global CSS |
| `pages` | `src/pages` | One folder per route; composes widgets/features into a screen |
| `widgets` | `src/widgets` | Reusable UI blocks (sidebar, header, auth form, create-recap, delete-account) |
| `features` | `src/features` | Behaviour tied to a user action (cookie consent, password reset) |
| `entities` | `src/entities` | The `user` domain model plus its service and hooks |
| `shared` | `src/shared` | UI glue, notifications, constants, validation, formatters, types |

Two folders deliberately sit **outside** the FSD layers and are treated as shared infrastructure:

- **`src/components`** — app-specific components (recap card, flashcard carousel, audio player,
  uploader, dialogs, footer) that are not yet assigned to a slice.
- **`src/shadcn`** — the design-system primitives (Radix UI + Tailwind), the lowest-level
  building blocks used everywhere.

See [modules/](modules/README.md) for a page-per-layer breakdown and the file counts.

## Data flow: creating a recap end-to-end

```
User pastes a YouTube link / uploads documents
        │
        ▼
CreateRecapWidget ──▶ recapService.createRecap()  ──▶ POST /api/recaps
        │                                              (or POST /api/recaps/upload)
        ▼
POST /api/recaps/{id}/process        → server transcribes + extracts candidate topics
        │
        ▼
GET  /api/recaps/{id}/topics         → topic list shown to the user
POST /api/recaps/{id}/topics/select  → user picks the themes that matter
        │
        ▼
POST /api/recaps/{id}/generate       → server generates the recap body
POST /api/tts/generate               → audio version of the recap
        │
        ▼
GET  /api/recaps, GET /api/flashcards            → dashboard + review deck
POST /api/flashcards/{id}/review                 → spaced-repetition grading
POST /api/analyze/recall                         → free-text recall analysis
```

While processing runs, the recap carries a `processing_status` that drives the UI:

```
pending → transcribing → extracting_topics → generating → completed
                                                         ↘ failed
```

Long-running steps (uploads, TTS, generation) are registered with
[`backgroundRequestTracker`](../src/services/backgroundRequestTracker.ts) so the UI can keep
polling after the user navigates away and raise a toast when a recap is ready.

## State management

State is split by concern rather than centralised:

| Kind of state | Tool | Notes |
| --- | --- | --- |
| Session user | Redux Toolkit (`authSlice`) | Only `auth.user` is persisted; tokens are **never** persisted |
| Auth tokens | Redux in-memory + cookies | Written by `AuthProvider`; cookies are `Secure`, `SameSite=Lax` |
| Theme | Redux Toolkit (`themeSlice`) | Colour tokens + light/dark mode, mirrored to cookies and the API |
| Server data | TanStack Query + native `fetch` | Queries, caching, retries (`retry: 1`) |
| Cross-cutting UI | React Context | Sign-in dialog, no-credits dialog, auth guard |

The persisted store is configured in [`src/store/index.ts`](../src/store/index.ts):
`persistReducer` wraps the `auth` slice with a whitelist of `['user']`, and the root persist
config opts out entirely so slices opt in individually.

## Authentication

All flows converge on the Redux auth slice plus secure cookies, and are orchestrated by
[`src/contexts/AuthProvider.tsx`](../src/contexts/AuthProvider.tsx):

1. **Email + password** — `AuthProvider.login()` calls `POST /api/auth/login`, stores the
   returned tokens in cookies and dispatches `loginSuccess`.
2. **Google OAuth** — `initiateGoogleLogin()` (in `src/services/authService.ts`) redirects to the
   backend's `/api/auth/google/login`. The backend returns to `/auth/callback`, where
   `OAuthCallback` exchanges the code through `POST /api/auth/refresh` and stores the user.
3. **Silent refresh** — on mount, `AuthProvider` posts the refresh token to
   `POST /api/auth/refresh`, rotates the cookies, and restores the session. A
   `user_logged_out` flag in `localStorage` short-circuits the refresh after an explicit logout.

When a session is established, `AuthProvider` also fetches the credit balance
(`GET /api/credits/balance`) and the user's theme (`fetchThemeFromBackend`).

Route protection is centralised in
[`src/contexts/AuthGuard.tsx`](../src/contexts/AuthGuard.tsx), which reads the auth context and
redirects unauthenticated users away from `/dashboard*` and `/profile`.

## Theming

Two layers of theming:

- **Mode** — `themeSlice.defaultMode` toggles the `light`/`dark` class on `<html>`.
- **Custom colours** — each user can define a palette persisted server-side via
  `GET/PUT /api/theme` and `POST /api/theme/reset`. `useThemeColors` writes the palette into CSS
  variables so every Tailwind/shadcn token updates instantly.

The selected colours are mirrored to cookies so they can be applied before the API responds.

## Internationalisation

`i18next` boots in [`src/app/i18n.ts`](../src/app/i18n.ts) with
`i18next-browser-languagedetector` and `i18next-http-backend`, loading the `translation` namespace
from `public/locales/{en,ru}/`. The `LanguageSwitcher` component lets users override the detected
language.

## PWA and caching

`vite-plugin-pwa` (Workbox) is configured in [`vite.config.ts`](../vite.config.ts):

- `registerType: 'autoUpdate'`, manifest served as `manifest.webmanifest`
- precache of `js/css/html/ico/png/svg/woff2/webp`
- runtime caching: **NetworkFirst** for `api.memoryloop.co` (50 entries, 24 h), **CacheFirst**
  for Google Fonts (10 entries, 1 year)
- SPA navigation fallback to `/index.html`, with `/api/*` excluded
- service worker enabled in dev so the install prompt can be tested locally

## Cross-cutting concerns

- **Error handling** — `src/utils/fetchErrorHandler.ts` normalises network failures; `AppInner`
  installs the global listeners.
- **Background request tracking** — `src/services/backgroundRequestTracker.ts` keeps a list of
  in-flight background requests (uploads, TTS, generation) surfaced through
  `useBackgroundRequests`.
- **Notifications / toasts** — `src/shared/ui/notifications.tsx` exposes `addNotification`,
  `showToast` and a `useNotifications` hook, rendered by `<Notifications/>` in the shell.
- **Cookie consent** — the `features/cookie-consent` banner gates analytics on explicit consent.

## Related documents

- [api-integration.md](api-integration.md) — the endpoint surface
- [deployment.md](deployment.md) — shipping the build
- [modules/](modules/README.md) — module reference
