# UI kit (`src/shadcn`)

**Path:** [`src/shadcn`](../../src/shadcn) — 20 primitives.

The design system. Every primitive is a shadcn-style component — Radix UI behaviour wrapped in
Tailwind classes and exposed through a small, composable API. `components.json` configures the
shadcn CLI against this folder, and `src/lib/utils.ts` provides the `cn()` helper every
primitive uses.

## Design tokens

Tokens are CSS variables in [`src/app/index.css`](../../src/app/index.css) and are consumed by
Tailwind. The palette is overridable per user at runtime — `themeSlice` + `useThemeColors` write
the variables, so every primitive below re-themes instantly.

## Primitives

| Category | Components |
| --- | --- |
| Layout & surfaces | `card`, `separator`, `scroll-area`, `sidebar`, `sheet` |
| Navigation | `tabs`, `dropdown-menu`, `hamburger-menu`, `collapsible` |
| Forms & inputs | `input`, `textarea`, `label`, `slider` |
| Overlays | `dialog`, `tooltip` |
| Feedback | `progress`, `skeleton` |
| Content & media | `avatar`, `carousel`, `button` |

Full list (20 files): `avatar`, `button`, `card`, `carousel`, `collapsible`, `dialog`,
`dropdown-menu`, `hamburger-menu`, `input`, `label`, `progress`, `scroll-area`, `separator`,
`sheet`, `sidebar`, `skeleton`, `slider`, `tabs`, `textarea`, `tooltip`.

## Conventions

- Primitives are **presentational**: no API calls, no business logic, no app state.
- Keep them close to upstream shadcn so the CLI can regenerate diffs; put app-specific variants
  in the consuming component instead.
- Customise through `className`, variant props (`cva`) and the CSS-variable tokens, not by
  hardcoding colours.
