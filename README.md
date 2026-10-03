# Ladderle

A daily word-ladder game: climb from a start word to a target word, changing one letter at a time.

```
STAIR → STAID → STAND → STANK → STACK   (par 4)
```

## Rules

- Origin and target are common 5-letter words.
- Each step changes exactly one letter in place and must be a valid word.
- Revisiting words is allowed. There is no undo and no step limit — every accepted step counts.
- The score is total steps vs. **par**: the shortest possible ladder (BFS over the word graph).
- Rejected entries (not a word, not exactly one change) don't cost a step.
- **Give up** reveals a par-length ladder; on the daily puzzle it counts as a loss.
- Letters matching the target in position are green; each step's changed letter is outlined.

## Modes

- **Daily** — the same puzzle for everyone, from a precomputed list (`src/data/daily.json`) indexed by
  local calendar day since `LAUNCH_DATE` (`src/core/daily.ts`). Par 4–6, and at least one par-length
  ladder uses only common words. Rolls over at local midnight; cycles if the list runs out.
- **Practice** — unlimited puzzles generated in the browser. Easy (par 3–4), Medium (5–6), Hard (7–8).

Daily progress, streaks and an over-par distribution are stored in `localStorage` (`ladderle:*`).

## Development

```sh
npm install
npm run dev     # dev server
npm test        # Vitest (core logic)
npm run build   # type-check + production build into dist/
```

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`
(enable Pages with source "GitHub Actions" in the repo settings).

## Word data

| File | Source |
| --- | --- |
| `src/data/valid-words.txt` | 5-letter words from [ENABLE](https://github.com/dolph/dictionary) (public domain) |
| `src/data/common-words.txt` | SCOWL size ≤35 (English + American), ∩ ENABLE, minus simple plurals/past tenses. See `SCOWL-COPYRIGHT.txt` |
| `src/data/daily.json` | Generated daily puzzles (`"origin-target"`) |

Regenerate with:

```sh
node scripts/build-wordlists.ts <enable1.txt> <scowl-2020.12.07/final>
npm run daily            # optional: [days] [seed]
```

Regenerating `daily.json` changes past and future puzzles, so only do it before launch or append carefully.

## Layout

- `src/core/` — framework-free game logic (word graph/BFS, generator, daily selection, game state, stats, share text) with tests.
- `src/components/` — SolidJS UI.
- `scripts/` — offline data generation (run with Node ≥ 23, which strips TypeScript types natively).
