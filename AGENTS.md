This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in the root `app/` folder (not `src/app/` — never create that, Expo Router would switch to it) and are **thin**: each route file only re-exports a screen from `src/screens/<Name>Screen/`; `_layout.tsx` files define navigators. Keep all other code (screens, components, hooks, utils) in `src/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Project structure (keep it — full guide: `docs/PROJECT_STRUCTURE.md`)

- `src/screens/<Name>Screen/` — one folder per route: `<Name>Screen.tsx` (composes components, calls hooks — no business rules),
  `<Name>Screen.styles.ts` (`export function createStyles(theme: AppTheme)`; measured numbers as named constants),
  `<Name>Screen.data.ts` (`<name>Copy` — every user-visible string), `index.ts`. Optional PascalCase part files; no subfolders.
- `src/features/<domain>/` — only `services/` (pure logic, no React), `hooks/` (`use<Thing>`), `context/` (the domain's store slice),
  `components/` (UI only this domain uses) and `types.ts`.
- `src/components/` — only `common/`, `ui/`, `layout/`, `feedback/`, `forms/`. No business logic and no imports from
  `features/`, `screens/` or `context/`: data comes through props.
- State: one Zustand store composed in `src/context/appStore.ts` from the feature slices (documented exception).
  Screens and components never import `@/context/*` or `zustand` — use feature hooks (`features/<d>/hooks`) and `@/hooks/useOverlays`
  (toast, dialogs, runResult, account switcher).
- Design tokens only from `src/theme/` (read in screens via `useAppTheme()`). No hex / `rgba()` strings or `fontSize: <number>`
  outside `src/theme/`. Text always through `<AppText variant>`. Bundled images through `src/constants/images.ts`.
- When code does not fit a folder, stop and ask — do not invent a new folder.
- Before finishing: `npx tsc --noEmit`, `npx expo lint` and the structure greps in `docs/PROJECT_STRUCTURE.md` (each prints nothing).

