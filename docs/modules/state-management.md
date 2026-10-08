# State management

Memory Loop splits state by concern instead of centralising it. This page covers the two folders
that implement client state: [`src/store`](../../src/store) (Redux) and
[`src/contexts`](../../src/contexts) (React Context).

## Redux — `src/store`

| File | Purpose |
| --- | --- |
| `index.ts` | Creates the store: `combineReducers({ auth, theme })`, wraps `auth` in a `persistReducer` that whitelists **only** `user`, configures the root persist config, exports `store`, `persistor`, `RootState`, `AppDispatch` |
| `hooks.ts` | Typed `useAppDispatch` / `useAppSelector` |
| `slices/authSlice.ts` | Session state: `user`, `token`, `refreshToken`, `isAuthenticated`, `isLoading`, `error`, `isDeletingAccount`; actions `loginSuccess`, `logout`, `updateUser`, `setLoading`, `setError`, `setDeletingAccount`, `clearError` |
| `slices/themeSlice.ts` | Theme mode (`light`/`dark`) and the custom colour palette; async thunks `fetchThemeFromBackend`, `saveThemeToBackend`, `updateDefaultMode`, `resetThemeOnBackend` |

### Why tokens are never persisted

`authPersistConfig` whitelists `['user']`, so `redux-persist` writes the profile to
`localStorage` but never the access or refresh token. Tokens live in Redux memory and in
`Secure` cookies written by `AuthProvider`.

### Theme slice

The theme slice is the app's theming engine:

1. `defaultMode` toggles the `light`/`dark` class on `<html>`.
2. A `ThemeColors` object maps every design token (background, primary, accent, border, …) to a
   value.
3. Async thunks call `themeService` to load/save/reset the palette server-side.
4. `useThemeColors` applies the palette as CSS variables so Tailwind/shadcn tokens update live.

## React Context — `src/contexts`

| Context | Files | Purpose |
| --- | --- | --- |
| **Auth** | `AuthContext.tsx`, `AuthProvider.tsx`, `AuthGuard.tsx` | Provides `user`, `token`, `isAuthenticated`, `isLoading`, `error`, `login`, `loginWithGoogle`, `logout`, `clearError`; `AuthProvider` runs the silent refresh/session bootstrap and the credits/theme fetches; `AuthGuard` redirects unauthenticated users away from protected routes |
| **Sign-in dialog** | `SignInDialogContext.tsx`, `SignInDialogProvider.tsx` | Lets any component open the global sign-in modal (`useSignInDialog`) |
| **No-credits dialog** | `NoCreditsDialogContext.tsx`, `NoCreditsDialogProvider.tsx` | Opens the "out of credits → upgrade" prompt from anywhere (`useNoCreditsDialog`) |

`AuthGuard` is the only context wired directly into routing; the dialog contexts are consumed by
widgets and the shell.

## Server state

Server data is fetched with **TanStack Query** (`QueryClientProvider` in `src/app/index.tsx`,
`retry: 1`). Query hooks live next to the data they fetch (services or entity hooks) rather than
in a central cache file.

## Choosing where state goes

| State | Where |
| --- | --- |
| Current user | Redux `auth` slice (+ `AuthContext` for access) |
| Auth tokens | Redux in-memory + `Secure` cookies |
| Theme | Redux `theme` slice (+ cookies) |
| Server data | TanStack Query |
| Modal / dialog open state | React Context |
| Transient form state | `react-hook-form` inside the component |
