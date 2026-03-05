# Grimwhite — AI Agent Documentation

## Project Overview

Grimwhite is a **dark-fantasy TTRPG random character generator**. It is a SvelteKit 2 web app (Svelte 5, TypeScript, TailwindCSS 4) that procedurally creates tabletop RPG characters from randomised content tables.

The only runtime dependency beyond SvelteKit is **compromise** (NLP library) used for grammatically correct character summaries.

---

## Directory Structure

```
src/
├── app.d.ts                  # SvelteKit ambient types
├── app.html                  # HTML shell
├── demo.spec.ts              # Placeholder server-side unit test
├── lib/
│   ├── index.ts              # Barrel (currently empty)
│   ├── assets/
│   │   └── favicon.svg       # App icon
│   ├── content/              # Static data tables (the "game system")
│   │   ├── affiliations.ts   # Faction / guild names
│   │   ├── ancestries.ts     # Ancestry definitions (Human, Ashen-Blooded, …)
│   │   ├── archetypes.ts     # Archetype definitions with feature descriptions
│   │   ├── experiences.ts    # 400+ grimdark backstory strings
│   │   ├── vocations.ts      # 120+ vocation/class names
│   │   └── moves/
│   │       ├── strong.ts     # Combat Maneuver word lists (prefix/suffix)
│   │       ├── deft.ts       # Special Technique word lists
│   │       └── wise.ts       # Miracle word lists
│   ├── generator/            # Character generation logic (pure functions)
│   │   ├── generateCharacter.ts  # Main entry: assembles a full Character
│   │   ├── generateName.ts       # Random fantasy name from prefix+suffix
│   │   └── utils.ts              # Helpers: randomFrom, randomUnique, NLP preposition
│   ├── models/
│   │   └── character.ts      # TypeScript types/interfaces for Character
│   └── stores/
│       └── characterStore.ts # Svelte writable store backed by localStorage
└── routes/
    ├── +layout.svelte        # Root layout (imports TailwindCSS, favicon)
    ├── layout.css            # TailwindCSS entry point
    ├── +page.svelte          # Home page — generator UI
    ├── page.svelte.spec.ts   # Component test for home page
    └── characters/
        └── +page.svelte      # Preserved characters list page
```

---

## Key Concepts

### Character Model (`src/lib/models/character.ts`)

The `Character` interface is the central data type:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 |
| `name` | `string` | Procedurally generated fantasy name |
| `level` | `number` | Always starts at 1 |
| `archetype` | `'strong' \| 'deft' \| 'wise'` | Determines move type and class feature |
| `attributes` | `Record<AttributeName, number>` | Four attributes: brawns, agility, wits, presence (base 1, one randomly +1) |
| `grit` | `number` | Health-like stat (starts at 1) |
| `sanity` | `number` | Mental health stat (starts at 1) |
| `ancestry` | `Trait` | Race/species with attribute bonuses |
| `vocation` | `Trait` | Class/job with one bonus attribute |
| `affiliations` | `Trait[]` | Faction membership(s) with one bonus attribute |
| `experiences` | `Experience[]` | Two randomly chosen backstory events |
| `moves` | `MoveSlot[]` | Two archetype-specific move slots |
| `notes` | `string` | Free-text field (empty initially) |
| `summary` | `string?` | NLP-generated one-line description |
| `createdAt` | `number` | Timestamp |

### Archetypes

- **Strong** — gets two Combat Maneuver slots (1 move each). Feature: "Consequences of Conflict" (post-battle bonuses).
- **Deft** — gets two Special Technique slots (1 move each). Feature: "One of the Best" (auto-perfect on technique roll).
- **Wise** — gets two Miracle slots (2 moves each: one active, one inactive). No documented feature yet.

### Content Tables

All content lives in `src/lib/content/`. Files export plain arrays/objects of strings. To expand the generator, add entries to these arrays:

- **ancestries.ts** — `ANCESTRIES` array. Each ancestry has a name, optional `attributeCount`, and `isDefault` flag (Human is default, 50% chance).
- **vocations.ts** — `VOCATIONS` flat string array (120+ entries).
- **affiliations.ts** — `AFFILIATIONS` flat string array.
- **experiences.ts** — `EXPERIENCES` flat string array (400+ dark-fantasy backstory lines).
- **moves/{strong,deft,wise}.ts** — prefix/suffix word lists combined to generate move names.

### Generator (`src/lib/generator/`)

- `generateCharacter()` — main entry point. Returns a complete `Character` object. All randomisation uses `Math.random()`.
- `generateName()` — combines random prefix + suffix syllables.
- `utils.ts` — `randomFrom(array)`, `randomUnique(array, count)`, `capitalize()`, `generateId()` (crypto.randomUUID), `prepositionForExperience()` (uses compromise NLP to pick "is a" / "is an" / "was").

### Store (`src/lib/stores/characterStore.ts`)

A Svelte writable store wrapping `localStorage` under key `ttrpg-characters`. Methods: `add`, `updateCharacter`, `remove`, `clear`.

### Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `routes/+page.svelte` | Generator page — "Birth the Wretch" button, character card display, "Preserve This Soul" save button |
| `/characters` | `routes/characters/+page.svelte` | Lists all preserved characters from localStorage |

---

## Development

```sh
npm install
npm run dev          # Start dev server at localhost:5173
npm run test         # Run all unit tests
npm run check        # Type-check
npm run lint         # Lint + format check
npm run format       # Auto-format
```

### Testing

Vitest is configured with two test projects in `vite.config.ts`:

- **client** — Browser tests via Playwright (headless Chromium). Matches `src/**/*.svelte.{test,spec}.{js,ts}`. Excludes `src/lib/server/**`.
- **server** — Node environment tests. Matches `src/**/*.{test,spec}.{js,ts}`. Excludes svelte component tests.

All tests require assertions (`expect.requireAssertions: true`).

---

## Conventions

- Pure functions for all generation logic — no side effects, easy to test.
- Content data separated from logic in `content/` directory.
- TailwindCSS utility classes directly in Svelte templates (dark neutral palette, amber accents).
- Svelte 5 runes syntax in layout (`$props()`); classic `on:click` event handlers in page components.
- localStorage persistence only — no backend, no API calls.
