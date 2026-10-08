# Memory Loop

<p align="center">
  <img src="public/assets/favicon/android-chrome-512x512.png" alt="Memory Loop" width="120" height="120">
</p>

**Turn long-form educational content into a mini-course you actually remember.**

Memory Loop is a web app (installable PWA) that takes a YouTube video or a document and turns it
into a personalised learning recap: a short AI-generated recap podcast, a written summary, and a
deck of flashcards for active recall and spaced repetition.

> **Status:** the hosted deployment is currently offline, so run the app locally with the steps
> below — nothing in the app depends on the hosted instance being up. Architecture and a
> module-by-module reference live in [`docs/`](./docs/README.md).

## What it does

1. **Add material** — paste a YouTube link or upload a PDF/DOCX document.
2. **Pick your angle** — choose the themes you actually care about, or let the app pick.
3. **Get a recap** — the backend transcribes, summarises and narrates a short recap podcast.
4. **Lock it in** — review the summary, run the flashcard deck, and track your streak on the dashboard.

### Feature highlights

- **Recap generation** from YouTube links and uploaded documents (PDF/DOCX, converted client-side).
- **AI audio summaries** with an in-app player, plus background generation that keeps running while
  you navigate — the app polls request status and notifies you when a recap is ready.
- **Flashcards & spaced repetition** with per-material stats and review scheduling.
- **Dashboard** for organising materials, plus per-material views.
- **Accounts** with email/password and Google OAuth, email verification, password reset, referral
  codes, credits and a subscription paywall.
- **Personalisation** — light/dark theme plus a custom colour customiser that syncs to the backend.
- **Internationalisation** — full English and Russian UI.
- **PWA** — installable, offline shell, auto-updating service worker.

Full product walkthrough: [`MEMORY_LOOP_CAPABILITIES.md`](./MEMORY_LOOP_CAPABILITIES.md).
Architecture, API surface and a module-by-module reference: [`docs/`](./docs/README.md).

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 + shadcn/Radix primitives |
| State | Redux Toolkit (+ `redux-persist`) for auth/theme, TanStack Query for server state |
| Routing | React Router 7 |
| Forms | React Hook Form |
| i18n | i18next (`en`, `ru`) |
| Rich text | `react-markdown`, `mammoth` + `jszip` for client-side document conversion |
| PWA | `vite-plugin-pwa` (Workbox) |
| Lint/format | ESLint 9 (flat config) + Prettier |

## Project structure

The codebase follows a feature-sliced layout:

```
src/
├── app/          # app shell, router, global styles, i18n bootstrap
├── pages/        # route-level composition (landing, dashboard, auth, profile, …)
├── widgets/      # large composite blocks (header, sidebar, auth form, create-recap, …)
├── features/     # user-facing features (reset-password, cookie-consent)
├── entities/     # domain models and their API/hooks (user)
├── contexts/     # React context providers (auth, dialogs, guards)
├── components/   # app-level presentational components (player, flashcards, dialogs, …)
├── services/     # API clients and platform services (auth, credits, theme, OAuth, …)
├── hooks/        # shared hooks
├── store/        # Redux store and slices
├── config/       # runtime configuration (OAuth endpoints)
├── shared/       # constants, validation, small utilities and UI helpers
├── shadcn/       # generated shadcn/ui primitives
├── lib/          # tiny generic helpers (`cn`)
├── types/        # ambient type declarations
└── utils/        # generic helpers
```

`emails/` contains the transactional email templates used by the backend (branded HTML).

### Module reference

| Module | Responsibility |
| --- | --- |
| `app/` | Composition root: `index.tsx` mounts providers and the router, `router.tsx` declares routes, `i18n.ts` bootstraps i18next, `index.css` holds the Tailwind layer and design tokens. |
| `pages/` | One folder per route, split into `ui/` components and an `index.ts` barrel — landing, dashboard (list, material, themes), auth, signup, email confirmation, OAuth callback, paywall, profile, FAQ, reset-password and legal pages. |
| `widgets/` | Composite, self-contained blocks reused across pages: `header`, `sidebar`, `auth-form` (sign-in / sign-up / reset dialogs), `create-recap` and `delete-account`. |
| `features/` | Cross-cutting user features that are not tied to a single page: `reset-password` (API + hooks) and `cookie-consent`. |
| `entities/` | Domain layer. `user/` holds the `User` and `AuthResponse` types, the `useUser` hook and `deleteUserAccount`. |
| `contexts/` | React contexts and providers: `AuthContext` / `AuthProvider` (session and bootstrap), `AuthGuard` (route protection) and the `SignInDialog` / `NoCreditsDialog` context-provider pairs. |
| `components/` | App-level presentational components — recap cards and dialogs, the flashcard carousel and stats dialog, the custom audio player, theme customiser, document upload, invite/referral dialogs, Google login button and shared footer. |
| `services/` | Typed API clients and platform services: `recapService`, `creditsService`, `subscriptionService`, `themeService`, `referralService`, `userService`, `googleOAuthService`, `authService`, `countryDetection` and `backgroundRequestTracker` — the last keeps long-running generation jobs alive after navigation and raises a toast on completion. |
| `hooks/` | Reusable hooks: `useAuthTokens`, `useUpdateUser`, `useBackgroundRequests`, `useCountryDetection`, `useThemeColors`, `usePWAInstall`, `useIsMobile`. |
| `store/` | Redux Toolkit store: `authSlice` (session, persisted with `redux-persist`) and `themeSlice` (custom colours), plus typed `useAppDispatch` / `useAppSelector` hooks. |
| `config/` | `oauth.ts` — OAuth endpoint URLs and the pinned Google callback URL. |
| `shared/` | `constants/` (`SERVER_URL`, validation), `ui/` (toast notifications), `utils/` (initials, provider links, password strength, notification helpers) and shared types. |
| `shadcn/` | Generated shadcn/ui primitives (button, dialog, dropdown, sheet, …) built on Radix. |
| `lib/` | `utils.ts` — the `cn` class-name helper. |
| `types/` | Ambient declarations (`global.d.ts`). |
| `utils/` | `documentConversion.ts` (client-side PDF/DOCX → text via `mammoth` + `jszip`) and `fetchErrorHandler.ts`. |

## Getting started

Requirements: **Node.js ≥ 20.19** and **npm ≥ 10**.

```bash
npm install
npm run dev        # http://localhost:3000
```

The app talks to the hosted API by default. To point it at your own backend, create `.env.local`:

```bash
VITE_API_BASE_URL=https://your-api.example.com
```

See [`.env.example`](./.env.example). Nothing else is required to run the frontend locally.

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc`) and build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint over the project |
| `npm run lint:fix` | ESLint with autofix |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

## Deployment

The production build is a static bundle in `dist/`, so it can be served from any static host. This
repo ships the two configurations used in practice:

- **Docker / nginx** — `Dockerfile` builds the app and serves `dist/` through nginx with SPA
  fallback, long-lived hashed assets, correct caching for service worker/manifest, and security
  headers (`nginx.docker.conf`). `PORT` is respected via `docker-entrypoint.sh`, and
  `healthcheck.sh` backs the container health check.

  ```bash
  docker build -t memory-loop .
  docker run -p 8080:80 memory-loop
  ```

- **Vercel** — `vercel.json` rewrites all routes to `index.html` for client-side routing.
  `railway.json` / `railway.dockerfile.json` are provided for Railway's Docker builder.

### Routing notes

The SPA owns routes such as `/auth/callback`, `/email-confirmation` and legacy
`/api/auth/confirm/*` links; the nginx config redirects the legacy email-confirmation path back to
the API. Google OAuth callbacks are pinned to `https://app.memoryloop.co/auth/callback` in
`src/config/oauth.ts`.

## License

Copyright (c) Ivan Panfilovich. All rights reserved. See [LICENSE](./LICENSE).
