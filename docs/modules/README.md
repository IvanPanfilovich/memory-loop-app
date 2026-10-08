# Module reference

This section explains **every module** in the Memory Loop frontend — what it owns, where it
lives, and how it fits into the
[Feature-Sliced Design](../architecture.md#feature-sliced-design-layers) layers.

Each page follows the same shape: purpose → key files → responsibilities → notes.

## Layers

```
app        application shell: providers, routing, global styles
 ▲
pages      route-level screens
 ▲
widgets    composite blocks assembled from features + entities
 ▲
features   user-facing capabilities
 ▲
entities   domain models + data access
 ▲
shared     design system, hooks, constants, utilities
```

## Index

| Document | Source folder | What it covers |
| --- | --- | --- |
| [app.md](app.md) | `src/app`, `src/main.tsx`, `src/config` | App shell, providers, router, i18n bootstrap, OAuth config |
| [pages.md](pages.md) | `src/pages` | Every route screen and its URL |
| [widgets.md](widgets.md) | `src/widgets` | Sidebar, header, auth form, create-recap, delete-account |
| [features.md](features.md) | `src/features` | Cookie consent, password reset |
| [entities.md](entities.md) | `src/entities` | The `user` domain model, service and hooks |
| [services.md](services.md) | `src/services` | All API clients and cross-cutting services |
| [state-management.md](state-management.md) | `src/store`, `src/contexts` | Redux slices/hooks and React contexts |
| [hooks.md](hooks.md) | `src/hooks` | Reusable hooks (auth, theming, PWA, country, …) |
| [shared.md](shared.md) | `src/shared`, `src/utils`, `src/lib`, `src/types` | Constants, utilities, notifications, ambient types |
| [components.md](components.md) | `src/components` | App-specific components (recap, flashcard, upload, dialogs) |
| [ui-kit.md](ui-kit.md) | `src/shadcn` | shadcn-style design-system primitives |

## File-count at a glance

| Layer / folder | Files |
| --- | --- |
| `src/app` | 4 |
| `src/pages` | 32 |
| `src/widgets` | 25 |
| `src/components` | 19 |
| `src/services` | 11 |
| `src/shadcn` | 20 |
| `src/shared` | 10 |
| `src/features` | 8 |
| `src/contexts` | 7 |
| `src/hooks` | 7 |
| `src/entities` | 6 |
| `src/store` | 4 |
| `src/utils` | 2 |
| `src/config` | 1 |
| `src/lib` | 1 |
| `src/types` | 1 |
| `src/*` (root: `main.tsx`, `vite-env.d.ts`) | 2 |
