# `shared` — constants, utilities & shared UI

**Path:** [`src/shared`](../../src/shared) — 10 files, plus supporting helpers in
[`src/utils`](../../src/utils), [`src/lib`](../../src/lib) and [`src/types`](../../src/types).

The shared layer is the bottom of the FSD graph: it may import nothing from the layers above it.
It holds the notification/toast system, constants, validators, formatters and ambient types.

## `src/shared`

| Path | Contents |
| --- | --- |
| `index.ts` | Barrel: re-exports the notification system, `getInitials`, `getProviderLink`, `calculatePasswordStrength`, the validation constants and `SERVER_URL` |
| `constants/server.ts` | `SERVER_URL` — the single source of truth for the API host (`VITE_API_BASE_URL` with a hosted fallback) |
| `constants/validation.ts` | Email/password/display-name regexes and lengths, plus `validateEmail`, `emailFieldValidation`, `passwordFieldValidation`, `displayNameFieldValidation`, `passwordConfirmFieldValidation` |
| `ui/notifications.tsx` / `ui/notifications.css` | The in-app notification list component (`Notifications`) and its styles |
| `ui/index.ts` | Barrel for the notification UI + helpers |
| `utils/notificationUtils.ts` | The store behind the toast/notification layer: `addNotification`, `removeNotification`, `useNotifications` (custom list) and `showToast` (sonner) |
| `utils/getInitials.ts` | Derives avatar initials from a name |
| `utils/getProviderLink.ts` | Maps an email domain to its webmail inbox URL for "check your email" screens |
| `utils/passwordStrength.ts` | Presentational password-strength meter (`calculatePasswordStrength`) with a Tailwind colour class |

## `src/utils` (app-level utilities)

| File | Purpose |
| --- | --- |
| `documentConversion.ts` | Client-side document handling for the upload flow: `createDocxFileFromText` (builds a `.docx` with `jszip`) and `extractRawTextFromDocxFile` (reads raw text with `mammoth`) |
| `fetchErrorHandler.ts` | `handleFetchError` — normalises network/fetch failures into a user-facing toast |

## `src/lib`

| File | Purpose |
| --- | --- |
| `utils.ts` | The `cn()` class-merge helper (clsx + tailwind-merge) used by every UI primitive |

## `src/types`

| File | Purpose |
| --- | --- |
| `global.d.ts` | Ambient declarations (globals, module shims) |
