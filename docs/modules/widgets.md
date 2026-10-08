# `widgets` — composite UI blocks

**Path:** [`src/widgets`](../../src/widgets) — 25 files across 5 widgets.

Widgets are larger, reusable pieces of UI assembled from features, entities and the shared UI
kit. They are independent of any single route and can be dropped into several pages.

## Widgets

### `auth-form`

**Files:** 12 — the largest widget in the app.

| Group | Files | Purpose |
| --- | --- | --- |
| `api/` | `authService.ts`, `index.ts` | Request builders for `register` and `resendVerificationEmail` |
| `hooks/` | `useRegister`, `useResendVerificationEmail` | Form/mutation hooks with loading and error state |
| `ui/` | `resend-button.tsx` | Inline "resend verification email" button |
| `ui/reset-password/` | `RequestResetPasswordForm.tsx`, `ResetPasswordForm.tsx` | The two steps of password reset, on top of `features/reset-password` |
| `ui/sign-in-dialog/` | `sign-in-form.tsx`, `sign-up-form.tsx`, `state-based-sign-in-dialog.tsx`, `step.tsx` | A modal sign-in/sign-up flow driven by context state |

The widget is consumed through deep imports (e.g.
`@/widgets/auth-form/ui/sign-in-dialog/state-based-sign-in-dialog`), which is how `AppInner`
mounts the global sign-in dialog.

### `sidebar`

**Files:** `index.ts`, `ui/index.tsx`, `ui/profile.tsx`

The collapsible app navigation rail (built on the shadcn `sidebar` primitive) plus the profile
menu at its foot. Rendered by the app shell on every non-landing route.

### `header`

**Files:** `index.ts`, `ui/index.tsx`, `ui/theme.tsx`

The top bar: navigation controls, page context and the theme toggle (`ui/theme.tsx`).

### `create-recap`

**Files:** `index.ts`, `ui/CreateRecapWidget.tsx`, `ui/index.ts`

The recap-creation widget — YouTube link entry and document upload — used from the dashboard.

### `delete-account`

**Files:** `index.ts`, `ui/DeleteAccountWidget.tsx`, `ui/DeleteAccountDialog.tsx`,
`ui/ConfirmDeleteDialog.tsx`

A destructive-action flow with an explicit confirmation step, used from the profile page.

## Conventions

- Every widget exposes an `index.ts` barrel where it has a single public entry point; import
  widgets through it (`@/widgets/sidebar`, `@/widgets/create-recap`, …).
- Widgets may import features/entities/shared but never a page.
