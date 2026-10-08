# `pages` — route screens

**Path:** [`src/pages`](../../src/pages) — 32 files across 14 route folders.

Each page is a self-contained folder with a public barrel (`index.ts`) and a `ui/`
implementation. Pages compose widgets, features and shared UI into a route-level screen and
should hold as little business logic as possible.

## Route map

| Route | Page | Auth | Notes |
| --- | --- | --- | --- |
| `/` | `landing` | public | Marketing landing page; opens the sign-in dialog and routes authenticated users inward |
| `/auth` | `auth` | public | Sign-in / sign-up screen built on the `auth-form` widget |
| `/signup` | `signup` | public | Sign-up screen, handles referral codes |
| `/auth/callback` | `oauth-callback` | public | Google OAuth redirect handler; exchanges the code and refreshes tokens |
| `/email-confirmation` | `email-confirmation` | public | Post-verification confirmation screen (backend redirect target) |
| `/api/auth/confirm/*`, `/auth/verify-email` | `verify-email` | public | Legacy verification links; forward the token to the backend |
| `/reset-password` | `reset-password` | public | Password reset (request + reset forms) |
| `/dashboard` | `dashboard` → `DashboardPage` | **guarded** | The library: create recaps, search, filter, group by time |
| `/dashboard/themes` | `dashboard` → `DashboardThemesPage` | **guarded** | Topic/theme selection step of the recap flow |
| `/dashboard/:id` | `dashboard` → `DashboardMaterialPage` | **guarded** | A single recap: text, audio, flashcards, analytics, editing |
| `/profile` | `profile` | **guarded** | Account settings, subscription, referral, theme, sign-out, delete account |
| `/paywall` | `paywall` | public | Credits / subscription checkout screen |
| `/faq` | `faq` | public | FAQ content |
| `/privacy-policy` | `privacy-policy` | public | Legal |
| `/terms-and-conditions` | `terms-and-conditions` | public | Legal |
| `*` | `not-found` | public | 404 |

## Page by page

- **`landing`** — hero, animated background, feature highlights and CTAs; decides whether to
  send an authenticated visitor straight to the dashboard.
- **`auth` / `signup`** — thin wrappers around the `auth-form` widget. `signup` reads referral
  codes from the URL.
- **`oauth-callback`** — handles the Google redirect: exchanges the code via
  `/api/auth/refresh`, stores the user and navigates onward; surfaces errors inline.
- **`email-confirmation` / `verify-email`** — the friendly "email confirmed" state and the
  legacy redirect shim to the backend confirm endpoint.
- **`reset-password`** — uses the `features/reset-password` slice for both the request and the
  reset steps.
- **`dashboard`** — three screens sharing one slice:
  - `DashboardPage`: create a recap (YouTube link or file upload), browse the library, search,
    filter and group by Pinned / Today / This week / This month / Earlier.
  - `DashboardThemesPage`: the topic-selection step between `process` and `generate`.
  - `DashboardMaterialPage`: the finished recap — text, audio player, flashcards, recall
    analysis, edit and delete.
- **`profile`** — profile editing, subscription status, referral code, custom theme, sign-out
  and account deletion (handled by the `delete-account` widget).
- **`paywall`** — credit/subscription upsell and checkout entry point.
- **`faq`**, **`privacy-policy`**, **`terms-and-conditions`** — content pages. The FAQ copy is
  loaded from `public/faq/faq.md`, with translations under `public/locales/*`.
- **`not-found`** — the 404 screen.

## Conventions

- A page's public surface is its `index.ts` barrel; import pages through it.
- Route guards live in the router, not inside pages — pages can assume an authenticated user
  when the route is protected.
