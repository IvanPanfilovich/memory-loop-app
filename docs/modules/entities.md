# `entities` — domain models

**Path:** [`src/entities`](../../src/entities) — 6 files.

The entities layer holds business domain models together with the data access needed to read
and change them. Today there is a single entity, `user`, reflecting that most of the domain
lives server-side.

## `user`

| File | Responsibility |
| --- | --- |
| `index.ts` | Barrel for the entity: re-exports the `User` / `AuthResponse` types, `useUser` and `deleteUserAccount` |
| `types/User.ts` | The `User` type (identity, profile, billing/credits, subscription and Stripe fields) and `AuthResponse` |
| `types/index.ts` | Type barrel |
| `api/userService.ts` | Data access: `fetchUserById` (`GET /api/users/{id}`) and `deleteUserAccount` |
| `hooks/useUser.ts` | Hook that exposes the current user |
| `hooks/index.ts` | Hook barrel |

## How the entity is used

- Components read the current user from Redux (`authSlice.user`) or via the `useAuth()` context.
- Profile updates run through [`src/services/userService.ts`](services.md) (`PUT /api/users/{id}`)
  and the `useUpdateUser` hook; `transformBackendUser` normalises the backend shape into `User`.
- The `User` type is imported by the auth services and the store so the shape stays consistent
  across every flow.

## Adding a new entity

Follow the same shape: `types/` for the model, `api/` for data access, `hooks/` for React
integration, and an `index.ts` barrel. Everything the entity exports should be reachable from
that barrel.
