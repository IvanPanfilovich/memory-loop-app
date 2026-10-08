# API integration

Every network call in the app goes through a thin service module under
[`src/services`](../src/services), [`src/entities/user/api`](../src/entities/user/api) or
[`src/features/*/api`](../src/features), or is issued directly by the auth bootstrap in
[`src/contexts/AuthProvider.tsx`](../src/contexts/AuthProvider.tsx). All of them build their URL
from `SERVER_URL` ([`src/shared/constants/server.ts`](../src/shared/constants/server.ts)).

The backend is a separate service and is **not** part of this repository.

## Auth

| Method | Path | Called from | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | `AuthProvider` | Email + password login; returns `user`, `token`, `refresh_token`, `expiresAt` |
| `POST` | `/api/auth/signup` | `widgets/auth-form/api` | Create an account |
| `POST` | `/api/auth/logout` | `AuthProvider` | Clear the server-side session |
| `POST` | `/api/auth/refresh` | `AuthProvider`, `OAuthCallback` | Exchange the refresh token for a rotated access/refresh pair |
| `GET` | `/api/auth/google/login` | `services/authService`, `config/oauth` | Google OAuth entry point (`?callback_url=`) |
| `POST` | `/api/auth/request-reset` | `features/reset-password/api` | Request a password-reset email |
| `POST` | `/api/auth/reset-password` | `features/reset-password/api` | Set a new password with a reset token |
| `GET` | `/api/auth/confirm` | `pages/verify-email` | Email verification redirect target (`?token=`) |
| `POST` | `/api/auth/resend-verification` | `widgets/auth-form/api` | Re-send the verification email |

## Users

| Method | Path | Called from | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/users/{id}` | `entities/user/api/userService.ts`, `services/userService.ts` | Fetch a user by id |
| `PUT` | `/api/users/{id}` | `services/userService.ts` → `useUpdateUser` | Update profile fields (display name, locale, …) |
| `DELETE` | `/api/users/{id}` | `entities/user/api/userService.ts` (`deleteUserAccount`) | Delete the account (soft delete server-side) |

## Recaps

Implemented in [`src/services/recapService.ts`](../src/services/recapService.ts) behind the
`useRecapService()` hook.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/recaps` | List recaps for the dashboard (query params drive search / filter) |
| `POST` | `/api/recaps` | Create a recap from a YouTube link |
| `POST` | `/api/recaps/upload` | Create a recap from uploaded documents (multipart) |
| `GET` | `/api/recaps/{id}` | Fetch a single recap |
| `PATCH` | `/api/recaps/{id}` | Update recap fields (e.g. pin / rename) |
| `DELETE` | `/api/recaps/{id}` | Delete a recap |
| `POST` | `/api/recaps/{id}/process` | Start transcription / topic extraction |
| `GET` | `/api/recaps/{id}/topics` | Fetch extracted candidate topics |
| `POST` | `/api/recaps/{id}/topics/select` | Persist the user's selected topics |
| `POST` | `/api/recaps/{id}/generate` | Generate the recap content |
| `GET` | `/api/recaps/{id}/summary` | Fetch the generated summary |
| `PATCH` | `/api/recaps/{id}/summary` | Update the generated summary |

### Processing lifecycle

The UI is driven by a recap's `processing_status`:

```
pending → transcribing → extracting_topics → generating → completed
                                                        ↘ failed
```

Recap objects also carry `is_pinned`, `recap_duration_minutes`, `flashcard_count` and
`last_reviewed_at`, which the dashboard uses for grouping and sorting.

## Flashcards

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/flashcards` | Fetch flashcards (query params scope to a recap / due date) |
| `POST` | `/api/flashcards/{id}/review` | Submit a spaced-repetition grade |
| `DELETE` | `/api/flashcards/{id}` | Delete a flashcard |

Each flashcard carries an SM-2-style scheduling state: `ease_factor`, `interval_days`,
`repetitions`, `next_review_at`, `times_correct`, `times_incorrect`.

## Media & analysis

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/tts/generate` | Generate audio for a recap (used by the custom audio player) |
| `POST` | `/api/analyze/recall` | Analyse a free-text recall answer against the source material |

## Credits, billing & referrals

| Method | Path | Called from | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/credits/balance` | `services/creditsService.ts` | Current credit balance |
| `GET` | `/api/subscriptions/status` | `services/subscriptionService.ts` | Subscription state |
| `POST` | `/api/subscriptions/create` | `services/subscriptionService.ts` | Start checkout |
| `POST` | `/api/subscriptions/cancel` | `services/subscriptionService.ts` | Cancel a subscription |
| `GET` | `/api/referrals/code` | `services/referralService.ts` | Fetch the user's referral code |

## Theme

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/theme` | Load the user's saved colour theme |
| `PUT` | `/api/theme` | Save a colour theme |
| `POST` | `/api/theme/reset` | Reset to the default theme |

Implementation: [`src/services/themeService.ts`](../src/services/themeService.ts), orchestrated by
`themeSlice` (Redux) and `useThemeColors`.

## Conventions

- **Auth** travels in cookies plus an `Authorization`-style token read from the Redux store
  (`getAuthToken()`), and every request sets `credentials: 'include'`. Tokens are never persisted
  to `localStorage`.
- **Errors** are surfaced by [`src/utils/fetchErrorHandler.ts`](../src/utils/fetchErrorHandler.ts)
  and the toast layer in [`src/shared/ui/notifications.tsx`](../src/shared/ui/notifications.tsx).
- **Loading** for long-running jobs (uploads, TTS, generation) is tracked by
  [`src/services/backgroundRequestTracker.ts`](../src/services/backgroundRequestTracker.ts) and
  exposed through `useBackgroundRequests`.
- **Configuration** — the API host is `import.meta.env.VITE_API_BASE_URL` with a hosted default,
  so a self-hosted build only needs to set that one variable.
