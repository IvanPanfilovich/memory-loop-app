# `services` — API clients & cross-cutting services

**Path:** [`src/services`](../../src/services) — 11 files.

Thin, framework-agnostic modules that talk to the backend or manage cross-cutting browser
concerns. They contain no JSX; components reach them through hooks or context. All requests use
the native `fetch` API and build their URL from `SERVER_URL`.

## Auth & tokens

| File | Exports | Purpose |
| --- | --- | --- |
| `authService.ts` | `initiateGoogleLogin` | Redirects the browser to the backend Google OAuth entry point, deriving the callback URL from the current origin |
| `googleOAuthService.ts` | `GoogleOAuthService` class, `googleOAuthService` singleton | Parses the OAuth callback payload and resolves the authenticated user |
| `reduxTokenService.ts` | `getAuthToken`, `clearAuthTokens` | Read the in-memory access token from the Redux store and clear the session on logout |

The interactive login/logout/refresh flows themselves live in
[`src/contexts/AuthProvider.tsx`](state-management.md), which reads and writes the auth cookies.

## Domain data

| File | Exports | Endpoints |
| --- | --- | --- |
| `recapService.ts` | `useRecapService` (+ `Recap`, `Topic`, `Summary`, `Flashcard` and request types) | The full recap + flashcard surface (create, upload, process, topics, generate, summary, TTS, recall analysis) |
| `creditsService.ts` | `getCreditsBalance`, `CreditsBalance` | `GET /api/credits/balance` |
| `subscriptionService.ts` | `useSubscriptionService` (+ status/checkout types) | `GET /api/subscriptions/status`, `POST /api/subscriptions/{create,cancel}` |
| `referralService.ts` | `getReferralCode`, `ReferralCodeResponse` | `GET /api/referrals/code` |
| `themeService.ts` | `getUserTheme`, `updateUserTheme`, `resetUserTheme` (+ types) | `GET/PUT /api/theme`, `POST /api/theme/reset` |
| `userService.ts` | `updateUser`, `transformBackendUser` (+ types) | `PUT /api/users/{id}` plus normalisation of the backend user shape |

See [api-integration.md](../api-integration.md) for request/response detail.

## Cross-cutting

| File | Exports | Purpose |
| --- | --- | --- |
| `backgroundRequestTracker.ts` | `getActiveRequests`, `addBackgroundRequest`, `removeBackgroundRequest`, `initializeBackgroundTracking`, `cleanupOldRequests` (+ types) | A small registry of in-flight background jobs (uploads, TTS, generation) so the UI can show progress, keep polling after navigation and avoid duplicate work |
| `countryDetection.ts` | `detectUserCountry` (+ `CountryDetectionResult`) | Best-effort country detection used to localise pricing and content |

## Conventions

- One file per external concern; export plain functions or a `useXService()` factory.
- Services return typed data and let hooks own loading/error state.
- No component calls a raw endpoint — everything goes through a service or the auth context.
