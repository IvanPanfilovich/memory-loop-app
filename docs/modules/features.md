# `features` — user capabilities

**Path:** [`src/features`](../../src/features) — 8 files across 2 slices.

A *feature* is a slice of behaviour tied to something the user does. The folder is intentionally
small; most interaction logic still lives in `widgets` and `components`.

## Slices

### `cookie-consent`

| File | Purpose |
| --- | --- |
| `index.ts` | Barrel |
| `ui/CookieConsent.tsx` | Cookie-consent banner that gates analytics on explicit consent |

Rendered once by `AppInner` on every route.

### `reset-password`

A vertical slice implementing the two-step password reset behind a set of hooks.

| Group | Files | Purpose |
| --- | --- | --- |
| `api/` | `requestPasswordReset.ts`, `resetPassword.ts`, `index.ts` | `POST /api/auth/request-reset` and `POST /api/auth/reset-password` |
| `hooks/` | `useRequestPasswordReset.tsx`, `useResetPassword.tsx`, `index.ts` | Mutation hooks exposing loading/error state |

The slice deliberately has **no UI of its own** — the forms live in
[`widgets/auth-form/ui/reset-password`](widgets.md#auth-form) and
[`pages/reset-password`](pages.md), and both consume the hooks from here.

## Conventions

- A feature owns its API calls and hooks; the UI may live in a widget or page that consumes them.
- Features may import entities and shared, never widgets or pages.
