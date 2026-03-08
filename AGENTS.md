# Grimwhite — AI Agent Documentation

## Project Overview

Grimwhite is a **dark-fantasy TTRPG random character generator** for a homebrew tabletop RPG system. It is a SvelteKit 2 web app (Svelte 5, TypeScript, TailwindCSS 4) that procedurally creates characters from randomised content tables. The design philosophy is **fast, chaotic, OSR-vibe** — one-click generation with no partial rerolls, but full editing after saving.

The only runtime dependency beyond SvelteKit is **compromise** (NLP library) used for grammatically correct character summaries.

Inspirations: [scvmbirther](https://scvmbirther.makedatanotlore.dev/), [shadowdarklings](https://shadowdarklings.net/create).

---

## Feature Requirements & Implementation Status

### Core Features

| #   | Feature                                                                       | Status       | Notes                                                                                                                                      |
| --- | ----------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Random character generation (level 1)                                         | **DONE**     | `generateCharacter()` in `src/lib/generator/generateCharacter.ts`                                                                          |
| 2   | Three archetypes: Strong, Deft, Wise                                          | **DONE**     | Random selection, archetype-specific moves                                                                                                 |
| 3   | 4 attributes (Brawns, Agility, Wits, Presence) starting at 1, +1 random       | **DONE**     |                                                                                                                                            |
| 4   | Ancestry (50% human default, non-human → 2 attribute assignments)             | **DONE**     |                                                                                                                                            |
| 5   | Vocation + 1 attribute assignment                                             | **DONE**     |                                                                                                                                            |
| 6   | 1 Affiliation + 1 attribute assignment                                        | **DONE**     |                                                                                                                                            |
| 7   | 2 Move slots at level 1 (archetype-specific)                                  | **DONE**     | Strong=Maneuver (prefix+weapon+suffix), Deft=Technique (non-combat utility), Wise=2 Miracles per slot (GrimWild/Knave2e generators)        |
| 8   | 2 Experiences from curated table                                              | **DONE**     | 400+ experiences available                                                                                                                 |
| 9   | Grit & Resolve starting at 1                                                  | **DONE**     |                                                                                                                                            |
| 10  | Name generation                                                               | **DONE**     | Prefix+suffix syllable combiner                                                                                                            |
| 11  | One-line character summary (NLP-powered)                                      | **DONE**     | Uses `compromise` for grammar                                                                                                              |
| 12  | Save character to localStorage                                                | **DONE**     | Store + import wired up                                                                                                                    |
| 13  | Character list page (`/characters`)                                           | **DONE**     | Lists preserved characters with summary                                                                                                    |
| 14  | Character sheet page (`/characters/[id]`)                                     | **DONE**     | Read-only sheet with all data, archetype feature, Essence Pool                                                                             |
| 15  | Editable character sheet (edit name, traits, moves, experiences, attributes)  | **DONE**     | Edit mode toggle with inline editing for all fields                                                                                        |
| 16  | Manual level-up (button, levels 1–10)                                         | **DONE**     | `levelUp()` in `src/lib/generator/leveling.ts`, UI on character sheet                                                                      |
| 17  | Attribute increase at L1, L3, L5, L7, L9, L10 (cap 3, L10 cap 4, total=10)    | **DONE**     | Picker UI with cap enforcement, `canIncreaseAttribute()`                                                                                   |
| 18  | New move slot at L2, L4, L6, L8, L10                                          | **DONE**     | Auto-added with empty prefix/suffix                                                                                                        |
| 19  | New experience at L4, L8, L10                                                 | **DONE**     | Auto-added with placeholder name                                                                                                           |
| 20  | Grit & Resolve increase at L3, L5, L7, L9 (formula: `1 + floor((level-1)/2)`) | **DONE**     | Recalculated via `calculateGritResolve()`                                                                                                  |
| 21  | Wise Essence Pool display (derived: `level + vocation attribute value`)       | **DONE**     | Shown on character sheet for Wise characters                                                                                               |
| 22  | Archetype features display (Consequences of Conflict, One of the Best)        | **DONE**     | Rendered on character sheet page                                                                                                           |
| 23  | Notes/items textarea                                                          | **DONE**     | Editable textarea in edit mode on character sheet                                                                                          |
| 24  | Portrait placeholder / image upload                                           | **DONE**     | Placeholder with silhouette icon, image display ready                                                                                      |
| 25  | Dark medieval themed UI with custom fonts                                     | **DONE**     | Cinzel (headings), EB Garamond (body), Uncial Antiqua (title). CSS variable theming with gold accents, wax-seal badges, parchment textures |
| 26  | Light/dark mode toggle                                                        | **DONE**     | `themeStore` with localStorage persistence, class strategy on `<html>`                                                                     |
| 27  | JSON export/import of characters                                              | **NOT DONE** | Nice-to-have per spec                                                                                                                      |
| 28  | XP tracking with level-up thresholds                                          | **DONE**     | XP tracker on character sheet with +/− buttons, fill-to-threshold, `canLevelUp()` checks XP                                                |

### Known Bugs

None currently.

---

## Open TODOs (Implementation Order)

### Phase 1 — Fix Bugs & Complete Persistence ✅ DONE

1. ~~**Fix `characterStore` import** in `src/routes/+page.svelte`~~
2. ~~**Remove `(character as any).summary`** — use `character.summary` directly~~
3. ~~**Create `/characters/[id]` route** — character sheet page that loads a character from the store by ID~~
4. ~~**Build character sheet UI** displaying all character data~~
5. ~~**Display archetype feature text** (Consequences of Conflict / One of the Best)~~
6. ~~**Display Wise Essence Pool** as derived value~~

### Phase 2 — Character Sheet Editing ✅ DONE

7. ~~**Inline editing** for: name, ancestry, vocation, affiliation, moves, experiences, attribute assignments~~
8. ~~**Notes textarea** — large editable textarea for freeform notes/items~~
9. ~~**Portrait placeholder** — display area with future image upload support~~

### Phase 3 — Leveling System ✅ DONE

10. ~~**Implement `levelUp()` function** in `src/lib/generator/leveling.ts`~~
11. ~~**Level-up button** on character sheet with attribute selection UI~~
12. ~~**Validation**: enforce attribute caps and level 10 total constraint~~

### Phase 4 — Theming & Polish ✅ DONE

13. ~~**Add custom fonts**: Cinzel (headings), EB Garamond (body), rune-like accents (Uncial Antiqua)~~
14. ~~**Dark medieval visual design**: parchment textures, gold accents (`#b89f5d`), engraved attribute badges~~
15. ~~**Light/dark mode toggle** with Tailwind dark mode class strategy~~
16. ~~**Navigation**: add header/nav with links between generator and character list~~

### Phase 5 — Nice-to-Have

17. **JSON export/import** for character backup
18. **Mobile-responsive** layout refinements

---

## Game System Rules Reference

### Attributes

- 4 attributes: Brawns, Agility, Wits, Presence
- All start at 1
- Attribute value = number of d6 rolled for checks
- Trait assignment (ancestry/vocation/affiliation) = +1d6 when applicable
- Increases at levels: 1, 3, 5, 7, 9, 10 (6 total increases)
- Cap: 3 normally, one attribute may reach 4 at level 10
- Level 10 total must equal 10

### Archetypes

- **Strong**: Combat Maneuvers. Feature: "Consequences of Conflict" — after battle, choose one of: Special Interest (note an experience), Substance (harvest material), Supernatural (gain enemy ability if killed with last attack). Only one active at a time. Uses = level when gained.
- **Deft**: Special Techniques. Feature: "One of the Best" — once per session per technique, auto-Perfect on an applicable roll.
- **Wise**: Miracles (2 per slot, one active/one inactive). Essence Pool = Level + Vocation Attribute.

### Level Progression Table

| Level | XP Required | Attribute Increase | New Move | New Experience | Grit/Resolve |
| ----- | ----------- | ------------------ | -------- | -------------- | ------------ |
| 1     | 0           | +1 (during gen)    | 2 slots  | 2 (during gen) | 1            |
| 2     | 10          |                    | +1 slot  |                | 1            |
| 3     | 25          | +1                 |          |                | 2            |
| 4     | 50          |                    | +1 slot  | +1             | 2            |
| 5     | 85          | +1                 |          |                | 3            |
| 6     | 90          |                    | +1 slot  |                | 3            |
| 7     | 105         | +1                 |          |                | 4            |
| 8     | 115         |                    | +1 slot  | +1             | 4            |
| 9     | 140         | +1                 |          |                | 5            |
| 10    | 170         | +1 (cap 4 allowed) | +1 slot  | +1             | 5            |

### Content Tables

- Ancestries: 5 (Human default 50%, 4 non-human with 2 attribute assignments)
- Vocations: ~117
- Affiliations: 8
- Experiences: ~403
- Strong move words: 30 prefixes, 31 weapons (40% inclusion), 24 suffixes
- Deft technique words: 36 prefixes, 40 suffixes (non-combat utility/social focus)
- Miracles: dual generator — GrimWild (Style/Essence/Form, 25 each) and Knave2e (12 formula templates, 5 tables with compound sub-tables)

---

## Directory Structure

```
src/
├── app.d.ts                  # SvelteKit ambient types
├── app.html                  # HTML shell (Google Fonts, dark class)
├── demo.spec.ts              # Placeholder server-side unit test
├── lib/
│   ├── index.ts              # Barrel (currently empty)
│   ├── assets/
│   │   └── favicon.svg       # App icon
│   ├── components/
│   │   └── TiptapEditor.svelte  # Rich-text editor for notes (tiptap)
│   ├── content/              # Static data tables (the "game system")
│   │   ├── affiliations.ts   # 8 faction/guild names
│   │   ├── ancestries.ts     # 5 ancestry definitions (Human default + 4 non-human)
│   │   ├── archetypes.ts     # Archetype definitions with feature descriptions
│   │   ├── experiences.ts    # ~403 grimdark backstory strings
│   │   ├── vocations.ts      # ~117 vocation/class names
│   │   └── moves/
│   │       ├── strong.ts     # Combat Maneuver word lists (prefix/weapon/suffix)
│   │       ├── deft.ts       # Special Technique word lists (non-combat utility)
│   │       ├── wise.ts       # Legacy miracle word lists (unused — see miracles/)
│   │       └── miracles/     # Miracle name generation module
│   │           ├── index.ts      # Entry point: generateMiracleName() — 50/50 GrimWild vs Knave2e
│   │           ├── tables.ts     # Shared TableEntry/TableMap types + sub-table resolver
│   │           ├── grimwild.ts   # GrimWild method: Style × Essence × Form (pick 2)
│   │           └── knave2e.ts    # Knave2e method: 12 formula templates, 5+ tables
│   ├── generator/            # Character generation logic (pure functions)
│   │   ├── generateCharacter.ts  # Main entry: assembles a full Character
│   │   ├── generateName.ts       # Random fantasy name from prefix+suffix
│   │   ├── leveling.ts           # Level-up logic, XP thresholds, progression tables
│   │   └── utils.ts              # randomFrom, randomUnique, NLP preposition, generateId
│   ├── models/
│   │   └── character.ts      # TypeScript types/interfaces for Character
│   └── stores/
│       ├── characterStore.ts # Svelte writable store backed by localStorage
│       └── themeStore.ts     # Dark/light mode toggle with localStorage persistence
└── routes/
    ├── +layout.svelte        # Root layout with global sticky nav bar, theme init
    ├── layout.css            # TailwindCSS entry + CSS variable theming (dark/light)
    ├── +page.svelte          # Home page — generator UI
    ├── page.svelte.spec.ts   # Component test for home page
    └── characters/
        ├── +page.svelte      # Preserved characters list page
        └── [id]/
            └── +page.svelte  # Full character sheet with edit mode, XP tracker, level-up
```

---

## Character Model (`src/lib/models/character.ts`)

| Field              | Type                            | Description                                               |
| ------------------ | ------------------------------- | --------------------------------------------------------- |
| `id`               | `string`                        | UUID v4                                                   |
| `name`             | `string`                        | Procedurally generated fantasy name                       |
| `level`            | `number`                        | Always starts at 1                                        |
| `archetype`        | `'strong' \| 'deft' \| 'wise'`  | Determines move type and class feature                    |
| `attributes`       | `Record<AttributeName, number>` | brawns, agility, wits, presence (base 1, one randomly +1) |
| `grit`             | `number`                        | Health-like stat (starts at 1)                            |
| `resolve`          | `number`                        | Mental health stat (starts at 1)                          |
| `bloodied`         | `boolean`                       | Tracked on character sheet                                |
| `rattled`          | `boolean`                       | Tracked on character sheet                                |
| `markedAttributes` | `AttributeName[]`               | Attributes marked during play                             |
| `spark`            | `[boolean, boolean]`            | Two spark checkboxes                                      |
| `ancestry`         | `Trait`                         | Race/species with attribute bonuses                       |
| `vocation`         | `Trait`                         | Class/job with one bonus attribute                        |
| `affiliations`     | `Trait[]`                       | Faction memberships with bonus attributes                 |
| `experiences`      | `Experience[]`                  | Randomly chosen backstory events                          |
| `moves`            | `MoveSlot[]`                    | Archetype-specific move slots                             |
| `xp`               | `number`                        | Experience points (starts at 0, threshold-gated leveling) |
| `notes`            | `string`                        | Free-text field (empty initially)                         |
| `portrait`         | `string?`                       | Base64 image data from upload                             |
| `summary`          | `string?`                       | NLP-generated one-line description                        |
| `createdAt`        | `number`                        | Timestamp                                                 |

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

Vitest with two test projects:

- **client** — Browser tests via Playwright (headless Chromium). Matches `src/**/*.svelte.{test,spec}.{js,ts}`.
- **server** — Node environment tests. Matches `src/**/*.{test,spec}.{js,ts}`.
  All tests require assertions (`expect.requireAssertions: true`).

---

## Conventions

- Pure functions for all generation logic — no side effects, easy to test.
- Content data separated from logic in `content/` directory. To extend the generator, just add entries to arrays.
- CSS variable theming system (`--bg-base`, `--bg-surface`, `--color-gold`, etc.) defined in `layout.css`. Dark mode by default, light mode via `html:not(.dark)`.
- Google Fonts: Cinzel (headings), EB Garamond (body), Uncial Antiqua ("Grimwhite" logo only).
- Svelte 5 runes syntax (`$state`, `$effect`, `$props`, `$derived`, `untrack`); `onclick` handlers.
- localStorage persistence only — no backend, no API calls. Keys: `grimwhite-characters`, `grimwhite-theme`.
- OSR design philosophy: chaos during birth, control after preservation. No partial rerolls.
- Miracle generation uses a reusable sub-table mechanism (`TableEntry = string | { table: string }`) for recursive table lookups.
