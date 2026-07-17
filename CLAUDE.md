# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Swipe Words" (plugin id `swipe-words`) is an Obsidian plugin. It opens a
Tinder/Anki-style card view over a folder of notes: each note is a flashcard
(filename = front, note body = back), and swiping/tapping marks a frontmatter
boolean column as remembered or forgotten. It is built with Bun + React 19 +
Tailwind and packaged as a single CJS bundle Obsidian loads (`main.js` +
`styles.css`).

## Commands

- `bun install` — install deps
- `bun run dev` — watch build (`build.ts` via `bun --watch`)
- `bun run build` — one-off build: TS bundle (`build:ts`) + Tailwind CSS (`build:css`)
- `bun run build:release` — `NODE_ENV=development` build, then zips `dist/main.js dist/main.css dist/styles.css manifest.json` into `swipe-card.zip` (this is what CI runs on release)
- `bun test` — run all tests (Bun's built-in test runner, files matched as `*.test.ts`)
- `bun test src/x/index.test.ts` — run a single test file
- No lint/typecheck script is defined; use `bunx tsc --noEmit` if you need to typecheck manually

There is no `test` npm script — always invoke `bun test` directly.

Releases are cut by bumping the `version` in `manifest.json` and manually
running the `Release` GitHub Actions workflow (`workflow_dispatch` only, see
`.github/workflows/release.yaml`); it reads the version from `manifest.json`
and uploads `swipe-card.<version>.zip` to a GitHub Release with that tag.

## Architecture

The code is split into three layers, and dependencies only point one
direction: `core/` ← `obsidian/` ← UI (`App.tsx`, `flash-card/`, `hooks/`).

- **`src/core/`** — plain TypeScript, no Obsidian or React imports. Domain
  logic for spaced repetition: `rating.ts` (`Rating` = again/hard/good/easy),
  `review.ts` (`ReviewState`, ease/interval scheduling à la SM-2), `log.ts`
  (`ReviewLog`, built with a fluent/telescoping builder), `iso-string.ts`
  (branded `ISOString` type), `diff.ts` (`{from, to}` shape used by
  `ReviewLog` fields). This SRS scheduling logic is not yet wired into the
  card flow — the live plugin currently tracks memorized/forgotten as a
  single frontmatter boolean (see `findForgotFiles`/`checkColumn` in
  `obsidian/app.ts`), not full ease/interval scheduling. When extending
  review logic, keep it here and keep it Obsidian-free so it stays unit
  testable with `bun test`.
- **`src/obsidian/`** — the only layer allowed to import the `obsidian` API.
  - `app.ts`: `ObsidianRepository` implements `IObsidianRepository` — reads
    files from the configured `quizzDirectory`, filters "forgot" files by
    frontmatter `column`, reads/writes that column via
    `app.fileManager.processFrontMatter`.
  - `api.ts`: `ObsidianUI` implements `UIAPI` — thin wrapper around
    `Notice` and `MarkdownModal` (obsidian's markdown modal, used to reveal
    a card's answer).
  - `context.tsx`: React contexts (`RepositoryContext`, `UIAPIContext`) that
    inject the above two into the component tree.
  - `view.tsx`: `SwipeWordsView extends ItemView` — mounts the React root
    and provides the context values from the plugin instance.
  - `settings.ts` / `settings-tab.ts` / `folder-suggestion.ts`: plugin
    settings (`quizzDirectory`, `column`) and their settings-tab UI,
    including a folder-path autocomplete.
  - `markdown-modal.ts`, `x.ts` (file/folder helpers).
- **`src/main.ts`** — `SwipeWordsPlugin extends Plugin`, the Obsidian entry
  point. Registers the view, the "Open Swipe words view" command, and the
  settings tab; owns `settings` and persists them via `saveData`/`loadData`.
  Implements `SaveableSetting`/`OfferableSetting` (defined here), which is
  the interface `obsidian/app.ts` and `obsidian/settings-tab.ts` depend on
  instead of importing the concrete plugin class.
- **UI** (`App.tsx`, `flash-card-component.tsx`, `hooks/useFlashCards.tsx`,
  `flash-card/*`) — React components, styled with Tailwind utility classes.
  `useFlashCards` pulls `IObsidianRepository`/`UIAPI` out of context via
  `use()`, loads forgotten files into `FlashCardProps[]`, and exposes
  swipe/remember/forget handlers and a "show answer" modal trigger.
  `flash-card-stack.tsx` renders up to 3 stacked cards with a
  scale/translate effect; `flash-card.tsx` handles the swipe-away animation
  before calling `onForget`/`onRemember`.
- **`src/x/`** — small generic utilities not specific to Obsidian or the
  domain (currently `XArray.shuffle`).

Everything in `obsidian/` and `core/` is defined behind an interface
(`IObsidianRepository`, `UIAPI`, `SaveableSetting`) so the React layer never
imports Obsidian types directly — keep new features following that pattern
rather than reaching for `app.vault`/`app.workspace` from components.

`build.ts` bundles only `src/main.ts` as the entrypoint with `obsidian`
marked `external` (Obsidian provides it at runtime) and CJS/`node` target,
matching how Obsidian loads plugins.
