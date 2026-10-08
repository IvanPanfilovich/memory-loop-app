# Memory Loop — documentation

This folder documents how the Memory Loop web app is put together: the runtime
architecture, every REST endpoint the frontend talks to, the build/deploy setup, and a
page-per-layer reference covering **every module** in the source tree.

New here? Read the [project README](../README.md) first, then
[architecture.md](architecture.md).

## Contents

| Document | What you'll find |
| --- | --- |
| [architecture.md](architecture.md) | Runtime topology, boot sequence, Feature-Sliced Design layers, data flow, authentication, the recap pipeline, theming, i18n and the PWA |
| [api-integration.md](api-integration.md) | Every REST endpoint the frontend calls, grouped by domain, with methods and payload notes |
| [deployment.md](deployment.md) | Production build, Docker image, nginx configs, Railway / Vercel, healthchecks and caching strategy |
| [modules/](modules/README.md) | Module reference — one page per source layer and folder |

## Module reference

| Layer | Doc | Source |
| --- | --- | --- |
| Application shell | [modules/app.md](modules/app.md) | [`src/app`](../src/app) |
| Route screens | [modules/pages.md](modules/pages.md) | [`src/pages`](../src/pages) |
| Composite blocks | [modules/widgets.md](modules/widgets.md) | [`src/widgets`](../src/widgets) |
| User capabilities | [modules/features.md](modules/features.md) | [`src/features`](../src/features) |
| Domain models | [modules/entities.md](modules/entities.md) | [`src/entities`](../src/entities) |
| API clients & services | [modules/services.md](modules/services.md) | [`src/services`](../src/services) |
| State management | [modules/state-management.md](modules/state-management.md) | [`src/store`](../src/store), [`src/contexts`](../src/contexts) |
| Reusable hooks | [modules/hooks.md](modules/hooks.md) | [`src/hooks`](../src/hooks) |
| Constants & utilities | [modules/shared.md](modules/shared.md) | [`src/shared`](../src/shared), [`src/utils`](../src/utils) |
| App components | [modules/components.md](modules/components.md) | [`src/components`](../src/components) |
| UI kit | [modules/ui-kit.md](modules/ui-kit.md) | [`src/shadcn`](../src/shadcn) |

## Related

- [MEMORY_LOOP_CAPABILITIES.md](../MEMORY_LOOP_CAPABILITIES.md) — long-form product capabilities
  and user-flow guide.
