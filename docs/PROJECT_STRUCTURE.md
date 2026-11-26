# Project structure

This app (Expo SDK 58, Expo Router, Zustand, TypeScript) follows a **feature + screen-folder** structure.
Every file has one obvious home; the rules below say where new code goes and who may import whom.

## Tree

```
<repo>/
├── app/                     Expo Router routes — thin files that only re-export a screen (+ the two _layout files)
├── app.json                 Expo config (native settings live here — ios/ and android/ are generated)
├── public/index.html        web template (mobile meta tags)
├── assets/                  app icon, splash
├── docs/                    this document
└── src/
    ├── screens/<Name>Screen/  one folder per route: <Name>Screen.tsx · .styles.ts · .data.ts · index.ts (+ part files)
    ├── features/<domain>/   everything one business domain needs
    │   ├── services/        pure logic, rules, labels — NO React
    │   ├── hooks/           React state over the store / services (use<Thing>)
    │   ├── context/         the domain's store slice (<domain>Slice.ts)
    │   ├── components/      UI only this domain uses (cards, forms)
    │   └── types.ts         the domain's models, inputs and slice interface
    ├── components/          UI any screen may use — NO business logic, data comes through props
    │   ├── common/          primitives: AppText, Button, IconButton, Card (the one base surface), Badge, Avatar, IconTile, BrandMark …
    │   ├── ui/              composed pieces: SectionHeader, Chips, StatCard, Charts, ProgressRing, TrendChart, Timeline, MessageThread, BottomSheet …
    │   ├── layout/          ScreenContainer, AppHeader, BrandHeader, ActionBar, AppBackground, TabBarInset
    │   ├── feedback/        States (Empty / Error / Loading), ToastHost, DialogHost, InlineNote
    │   └── forms/           AppInput, FormField, FormSelect, DateField, ChoiceChips, SearchInput, CommentInput, AttachmentPicker
    ├── navigation/          AppTabBar.tsx, navTabs.ts, AuthGate.tsx
    ├── config/              settings (brand.ts)
    ├── constants/           images.ts — the image table (one require() per bundled image)
    ├── context/             app-wide state: appStore.ts (composed store), uiStore.ts (toasts / dialogs), ThemeContext.tsx
    ├── hooks/               app-wide UI hooks: useAppTheme, useScreenLayout, useOverlays, useNow
    ├── theme/               every design token: colors, typography, spacing, borderRadius, shadows, layout, breakpoints, motion
    ├── types/               app-wide types: common.types.ts, store.types.ts, theme.types.ts
    ├── utils/               small pure helpers: format, dates, id, result, collections, timeline
    └── data/                in-memory mock data (the demo has no backend)
```

Rules: no files directly in `src/`; no other top-level folders in `src/`; a feature holds only `services/ hooks/ context/ components/ types.ts`;
`components/` holds only the five groups above; a screen folder has no subfolders.

### Routes (`app/` at the project root)
Expo Router needs a routes folder; it uses `src/app/` when that exists and the root `app/` otherwise, so the routes live in the root
`app/` and `src/` keeps only the folders above. Route files stay thin: `import { XScreen } from '@/screens/XScreen'; export default XScreen;`.
`app/` and `src/navigation/` are the only places that import screens. Do not create `src/app/` — Expo Router would switch to it.

### Documented exception
**`src/context/appStore.ts`** — the app keeps ONE in-memory Zustand store because actions cross domains (approving a proposal
   notifies people, starting a meeting notifies attendees, "reset demo data" touches everything). Each feature owns its slice in
   `features/<d>/context/<d>Slice.ts`; `appStore.ts` only composes them. Screens and components never read it directly — they use feature hooks.

## How data flows

```
screen ──► feature hook (features/<d>/hooks) ──► useAppStore (context/appStore) ──► slice actions (features/<d>/context) ──► data/ (mock)
   │                                                         └─► feature services (rules, permissions, labels)
   └─► components (common / ui / layout / feedback / forms) ──► theme tokens
```

There is no backend yet. When one is added: one fetch core in `src/lib/http/`, the API client (`call()` + `ApiError`) in
`features/auth/services/apiHttp.ts`, `process.env` read only in `src/config/env.ts`, and slices call feature services instead of mock data.

## Who may import whom

| Layer | May import | Must NOT import |
|---|---|---|
| `app/` (routes, project root) | screens, navigation, components, features, context (root layout only) | — |
| `screens/` | features (hooks, services, components, types), components, hooks, theme, config, constants, utils, types, data, its own folder | another screen; `context/`; `zustand`; `fetch` |
| `navigation/` | screens (via routes), components, features, hooks, theme | — |
| `features/<d>/hooks` | `context/appStore`, its own + other features' services/hooks, utils, types | screens |
| `features/<d>/context` (slices) | its own + other features' services, utils, types, data | React, screens |
| `features/<d>/services` | other features' services, utils, types | React, screens, components |
| `features/<d>/components` | components, hooks, theme, features' hooks/services/types | screens, `context/` |
| `components/` | theme, hooks, utils, types, config, constants, other components | features, screens, `context/` |
| `hooks/` | `context/` (UI state, theme), theme, types | features, screens |
| `theme/` | nothing | everything |
| `utils/` | types, other utils | React state, features |

## Where new code goes

| You are adding… | Put it in |
|---|---|
| A new route | `src/screens/<Name>Screen/` + a thin `app/<path>.tsx` |
| Text shown on a screen | `<Name>Screen.data.ts` (`<name>Copy`) |
| A style or measured number | `<Name>Screen.styles.ts` (`createStyles(theme)`, named constants at the top) |
| A colour, font size, spacing, radius, shadow, duration | a token in `src/theme/` |
| A business rule / permission / label | `features/<d>/services/` |
| State or an action | the domain slice `features/<d>/context/<d>Slice.ts` (+ its interface in `features/<d>/types.ts`) and a hook in `features/<d>/hooks/` |
| UI used by one domain | `features/<d>/components/` |
| UI used by several domains | `src/components/<group>/` (data via props) |
| A small pure helper used by 2+ domains | `src/utils/` |
| A bundled image | `src/assets/images/` + one line in `src/constants/images.ts` |

## Design system

- Tokens: `src/theme/` (`colors.ts` incl. gradients / tones / identity & chart palettes, `typography.ts`, `spacing.ts`, `borderRadius.ts`,
  `shadows.ts`, `layout.ts` incl. sizes, `breakpoints.ts`, `motion.ts`). `appTheme` bundles them; `useAppTheme()` returns it.
- Screens: `const theme = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);`. Components may import token groups from `@/theme`.
- Text: always `<AppText variant="…">`. Arabic is set in Noto Sans Arabic; numbers and Latin runs are switched to Poppins automatically.
  `NUMERAL_STYLE` in `theme/typography.ts` switches Western ↔ Arabic-Indic digits app-wide.
- Responsive: phone layouts follow the 430pt design; size from `useScreenLayout()` (breakpoints in `theme/breakpoints.ts`), never from `Dimensions`.
- The navy-outlined translucent card is `components/common/Card.tsx` — build on it, never re-create it.

## Worked example — adding a "polls" feature

1. `src/features/polls/types.ts`: `Poll`, `PollInput`, `PollsSlice` (`createPoll`, `vote`).
2. `src/features/polls/context/pollsSlice.ts`: `export const createPollsSlice: SliceCreator<PollsSlice> = (set, get) => ({ … })` —
   check permissions with `features/auth/services/permissions`, return `ok()` / `fail()` from `utils/result`.
3. Register it: add `polls: Poll[]` to `DataState` and `PollsSlice` to `AppState` in `src/types/store.types.ts`, seed data in `src/data/`,
   and spread `...createPollsSlice(...a)` in `src/context/appStore.ts`.
4. `src/features/polls/hooks/usePolls.ts`: `usePolls()`, `usePoll(id)`, `usePollActions()` (copy the pattern from any other feature's hooks).
5. `src/features/polls/components/PollCard.tsx` (uses `Card`, `AppText`, theme tokens).
6. `src/screens/PollsScreen/` (`PollsScreen.tsx`, `.styles.ts`, `.data.ts`, `index.ts`) and `app/polls/index.tsx` re-exporting it.
7. Run the checks below.

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor

# no raw colours / font sizes outside theme
grep -rnE "['\"\`]#[0-9a-fA-F]{3,8}['\"\`]|['\"\`](rgba?|hsla?)\(" src | grep -v "^src/theme/"
grep -rnE "fontSize:[[:space:]]*[0-9]" src | grep -v "^src/theme/"
# only routes / navigation import screens; screens never import each other
grep -rnE "from '@/screens/" src | grep -vE "^src/navigation/"
grep -rnE "from '@/screens/" src/screens
# components never import features, screens or the store
grep -rnE "from '@/(features|screens|context)/" src/components
# screens never read the store directly
grep -rnE "from '@/context/|from 'zustand" src/screens
# no React in services
grep -rnE "from 'react'" src/features/*/services
# fetch / process.env (none today; when added: only lib/http and config/env.ts)
grep -rnE "(^|[^.[:alnum:]_])fetch\(|process\.env" src
# no files directly in src/, and no routes folder inside src/
find src -maxdepth 1 -type f
ls -d src/app 2>/dev/null
```
Each grep should print nothing.
