# Swipe Words

A Tinder/Anki-style flashcard view for [Obsidian](https://obsidian.md).
Point it at a folder of notes — each note becomes a flashcard — and swipe or tap through them with SM-2-style spaced repetition scheduling.

## Usage

1. Install the plugin and enable it.
2. In plugin settings, set **Quizz Directory** to the folder of notes you want to study.
3. Run the **"Open Swipe words view"** command (Command Palette) to open the swipe view.
4. Tap **Show** to flip a card and reveal its answer, then rate it **Again / Hard / Good / Easy** — this schedules when the card is next due.

### Note format

Each note in the quizz directory is one flashcard:

- **Front**: the note's `front` frontmatter field.
- **Back**: one row per `back-<label>` frontmatter key, shown in the order they're written in the file, e.g.:

  ```yaml
  ---
  tags: [vocab]
  front: example
  back-meaning: "a thing characteristic of its kind, or illustrating a rule"
  back-synonyms: "instance / illustration / case"
  ---
  ```

  Repeated labels need unique key names (e.g. `back-meaning①`/ `back-meaning②`).
- **Scheduling**: the plugin manages `sw-due`, `sw-interval`, `sw-ease` frontmatter automatically once you rate a card for the first time — don't edit these by hand.

## Development

- `bun install` — install dependencies
- `bun run dev` — watch build (writes to `dist/`)
- `bun run dev:web` — browser-only dev environment (`LocalRepository`/
  `LocalUI`, no real Obsidian needed) at `http://localhost:3000`
- `bun run build` — one-off build (TS bundle + Tailwind CSS)
- `bun test` — run the test suite (`bun test <file>` for a single file)

## Release

Bump `version` in `manifest.json`, then manually run the **Release**
GitHub Actions workflow (`workflow_dispatch`). It builds with `bun run build:release` and uploads `swipe-card.<version>.zip` to a GitHub Release.

## Roadmap / known limitations

- **No reshuffle after finishing the stack** — rating a card "Again" keeps it due today, but once the stack empties there's currently no way to bring those cards back in the same session; you have to reopen the view.
- **Review history isn't persisted** — `ReviewLog` (an ease/interval/due diff per review, `src/core/log.ts`) exists but nothing writes it anywhere yet.
- **No "detail view"** — there's no way to see a card's full note content beyond the flipped `back-*` summary. A fuller detail screen using Obsidian's native markdown rendering (`src/obsidian/markdown-modal.ts`) is planned but not wired up to any UI trigger yet.
- **No real swipe gesture** — despite the name, cards are advanced by tapping the Again / Hard / Good / Easy buttons; the fly-off animation is button-triggered. Touch-drag-to-swipe (`onTouchStart`/`onPointerMove`) isn't implemented yet.
- **No text-to-speech** — reading a card's front/back aloud (e.g. via the Web Speech API) for pronunciation practice is planned but not implemented.
