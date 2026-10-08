# `app` — application shell

**Path:** [`src/app`](../../src/app), with the entry point at
[`src/main.tsx`](../../src/main.tsx) and static config in [`src/config`](../../src/config).

The `app` layer wires the whole application together: it mounts React, installs every provider,
declares the routes, boots i18n and holds the global stylesheet. It sits at the top of the FSD
graph and may import from any layer.

## Files

| File | Responsibility |
| --- | --- |
| `src/main.tsx` | React entry point. Creates the root and wraps the app in the Redux `Provider`, `PersistGate` and `BrowserRouter`. |
| `src/app/index.tsx` | The `App` / `AppInner` shell: provider stack, theme application, global error handling, background-request tracking, scroll reset, and the landing-vs-app layout split. |
| `src/app/router.tsx` | Declarative route table; wraps protected routes in `AuthGuard`. |
| `src/app/i18n.ts` | i18next initialisation (languages, detection, HTTP backend). |
| `src/app/index.css` | Global stylesheet and Tailwind entry point (design tokens). |
| `src/config/oauth.ts` | Static OAuth configuration — Google login URL, pinned callback URL, provider list. |

## Boot chain

```
index.html
  └─ src/main.tsx
        Provider(store) → PersistGate → BrowserRouter
          └─ src/app/index.tsx
                QueryClientProvider → CookiesProvider → AuthProvider →
                SignInDialogProvider → NoCreditsDialogProvider → AppInner
                    ├─ src/app/router.tsx  (Routes)
                    └─ src/app/i18n.ts     (side-effect import)
```

## What `AppInner` does

- Applies the theme mode class (`light` / `dark`) to `<html>` and pushes the user's custom
  palette into CSS variables via `useThemeColors`.
- Installs global `unhandledrejection` / `error` listeners and funnels fetch failures through
  [`src/utils/fetchErrorHandler.ts`](../../src/utils/fetchErrorHandler.ts).
- Starts background request tracking (`cleanupOldRequests` → `initializeBackgroundTracking`).
- Forces scroll-to-top on every route change (with delayed retries to survive async content).
- Renders the **landing page** without chrome, and every other route inside the `SidebarProvider`
  shell: sidebar + header + scroll area + `<Footer/>` + `<Notifications/>`, plus the
  `StateBasedSignInDialog` and the cookie-consent banner.

## Routes

See [pages.md](pages.md) for the full route map. The router also keeps two legacy email-verification
routes (`/api/auth/confirm/*`, `/auth/verify-email`) that forward the token to the backend.

## Notes

- The `QueryClient` defaults to `retry: 1` for all queries.
- The Google OAuth callback is pinned to the production domain in `src/config/oauth.ts`,
  independent of the current origin.
- `AuthProvider` performs the silent refresh, session bootstrap, and the credits/theme fetches that
  run once a session exists.
