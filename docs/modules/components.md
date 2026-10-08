# `components` — app components

**Path:** [`src/components`](../../src/components) — 19 files.

Large, app-specific components that are not (yet) assigned to an FSD slice. They sit alongside
the layers and are imported directly by pages and widgets. Everything here is Memory-Loop
specific — generic primitives live in [`src/shadcn`](ui-kit.md).

> There is no barrel here on purpose: import each component by its own path
> (e.g. `@/components/RecapCard`).

## Learning components

| Component | Purpose |
| --- | --- |
| `RecapCard.tsx` | The library card for a single recap (title, status, duration, flashcard count, actions); prefetches `GET /api/recaps/{id}` before navigation |
| `RecapCardDialogs.tsx` | Dialogs attached to a recap card (rename, pin, delete confirmations) |
| `Flashcard.tsx` | A single, flippable flashcard |
| `FlashcardCarousel.tsx` | Swipeable deck for review sessions (`embla-carousel`) |
| `FlashcardStatsDialog.tsx` | Review statistics (accuracy, streak, scheduling) |
| `CustomAudioPlayer.tsx` | The audio-recap player; resolves relative audio URLs against `SERVER_URL` |
| `DocumentUpload.tsx` | Drag-and-drop PDF/DOCX upload with validation and progress |
| `ThemeCustomizer.tsx` | Colour-theme editor driven by the theme slice |

## Account & growth

| Component | Purpose |
| --- | --- |
| `InviteFriendDialog.tsx` | Share / invite flow |
| `ReferralCodeDialog.tsx` | Shows and copies the user's referral code |
| `ConfirmDialog.tsx` | Generic confirmation dialog |
| `NoCreditsDialog.tsx` | Out-of-credits upsell dialog (paired with the no-credits context) |
| `GoogleLoginButton.tsx` | Google-branded sign-in button |
| `LanguageSwitcher.tsx` | English / Russian switcher |
| `Footer.tsx` | App footer |

## Shell, loading & decoration

| Component | Purpose |
| --- | --- |
| `AppLoader.tsx` | Top-level loading progress indicator |
| `LoadingScreen.tsx` | Full-screen initial loader |
| `AnimatedLines.tsx` | Decorative animated background element |
| `AnimatedQuestionMarks.tsx` | Decorative animated element for the landing page |
