# `hooks` — reusable hooks

**Path:** [`src/hooks`](../../src/hooks) — 7 files.

Reusable React hooks shared across the app. They wrap browser APIs, services and Redux so
components stay declarative.

| Hook | What it does |
| --- | --- |
| `use-mobile.ts` → `useIsMobile` | Reports whether the viewport is below the mobile breakpoint; used to switch layouts and the sidebar mode |
| `useAuthTokens.ts` → `useAuthTokens` | Reads the current access/refresh tokens from the auth layer and reports `hasRefreshToken` |
| `useBackgroundRequests.ts` → `useBackgroundRequests` | Subscribes to `backgroundRequestTracker` and exposes the list of in-flight background jobs (optionally scoped to one recap) |
| `useCountryDetection.ts` → `useCountryDetection` | Wraps `countryDetection` with state so components can react to the detected country |
| `usePWAInstall.ts` → `usePWAInstall` | Captures the `beforeinstallprompt` event and exposes an install trigger |
| `useThemeColors.ts` → `useThemeColors` | Applies the Redux theme palette to CSS variables (the theming engine's runtime half) |
| `useUpdateUser.ts` → `useUpdateUser` | Mutation hook for updating the profile via `userService.updateUser` |

## Conventions

- Hooks in this folder should be **reusable**; anything tied to one component belongs beside it.
- Subscription-style hooks (`useBackgroundRequests`) must clean up their listeners on unmount.
