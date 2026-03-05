# Grimwhite — AI Agent Documentation

## Project Overview

Grimwhite is a **dark-fantasy TTRPG random character generator** for a homebrew tabletop RPG system. It is a SvelteKit 2 web app (Svelte 5, TypeScript, TailwindCSS 4) that procedurally creates characters from randomised content tables. The design philosophy is **fast, chaotic, OSR-vibe** — one-click generation with no partial rerolls, but full editing after saving.

The only runtime dependency beyond SvelteKit is **compromise** (NLP library) used for grammatically correct character summaries.

Inspirations: [scvmbirther](https://scvmbirther.makedatanotlore.dev/), [shadowdarklings](https://shadowdarklings.net/create).

---

## Feature Requirements & Implementation Status

### Core Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Random character generation (level 1) | **DONE** | `generateCharacter()` in `src/lib/generator/generateCharacter.ts` |
| 2 | Three archetypes: Strong, Deft, Wise | **DONE** | Random selection, archetype-specific moves |
| 3 | 4 attributes (Brawns, Agility, Wits, Presence) starting at 1, +1 random | **DONE** | |
| 4 | Ancestry (50% human default, non-human → 2 attribute assignments) | **DONE** | |
| 5 | Vocation + 1 attribute assignment | **DONE** | |
| 6 | 1 Affiliation + 1 attribute assignment | **DONE** | |
| 7 | 2 Move slots at level 1 (archetype-specific) | **DONE** | Strong=Maneuver, Deft=Technique, Wise=2 Miracles per slot |
| 8 | 2 Experiences from curated table | **DONE** | 400+ experiences available |
| 9 | Grit & Sanity starting at 1 | **DONE** | |
| 10 | Name generation | **DONE** | Prefix+suffix syllable combiner |
| 11 | One-line character summary (NLP-powered) | **DONE** | Uses `compromise` for grammar |
| 12 | Save character to localStorage | **PARTIAL** | Store exists but `+page.svelte` has a **BUG**: `characterStore` is used without being imported |
| 13 | Character list page (`/characters`) | **DONE** | Lists preserved characters with summary |
| 14 | Character sheet page (`/characters/[id]`) | **NOT DONE** | Route does not exist; list page links to it (dead links/404) |
| 15 | Editable character sheet (edit name, traits, moves, experiences, attributes) | **NOT DONE** | No editing UI exists |
| 16 | Manual level-up (button, levels 1–10) | **NOT DONE** | No leveling logic implemented |
| 17 | Attribute increase at L1, L3, L5, L7, L9, L10 (cap 3, L10 cap 4, total=10) | **NOT DONE** | |
| 18 | New move slot at L2, L4, L6, L8, L10 | **NOT DONE** | |
| 19 | New experience at L4, L8, L10 | **NOT DONE** | |
| 20 | Grit & Sanity increase at L3, L5, L7, L9 (formula: `1 + floor((level-1)/2)`) | **NOT DONE** | |
| 21 | Wise Essence Pool display (derived: `level + vocation attribute value`) | **NOT DONE** | |
| 22 | Archetype features display (Consequences of Conflict, One of the Best) | **NOT DONE** | Data exists in `archetypes.ts` but never rendered |
| 23 | Notes/items textarea | **NOT DONE** | `notes` field exists in model but no UI |
| 24 | Portrait placeholder / image upload | **NOT DONE** | `portrait?` field exists in model but no UI |
| 25 | Dark medieval themed UI with custom fonts | **NOT DONE** | Currently default Tailwind dark. No Cinzel/EB Garamond/rune fonts |
| 26 | Light/dark mode toggle | **NOT DONE** | Hardcoded dark theme only |
| 27 | JSON export/import of characters | **NOT DONE** | Nice-to-have per spec |

### Known Bugs

| Bug | Location | Description |
|-----|----------|-------------|
| Missing import | `src/routes/+page.svelte` | `characterStore` is referenced in `preserve()` but never imported. Add: `import { characterStore } from '$lib/stores/characterStore'` |
| `(character as any).summary` | `src/routes/+page.svelte` | `summary` is already on the `Character` interface (as optional). The `as any` cast is unnecessary |
| Dead links | `src/routes/characters/+page.svelte` | Links to `/characters/${character.id}` but that route does not exist |

---

## Open TODOs (Implementation Order)

### Phase 1 — Fix Bugs & Complete Persistence

1. **Fix `characterStore` import** in `src/routes/+page.svelte`
2. **Remove `(character as any).summary`** — use `character.summary` directly
3. **Create `/characters/[id]` route** — character sheet page that loads a character from the store by ID

### Phase 2 — Character Sheet & Editing

4. **Build character sheet UI** at `/characters/[id]/+page.svelte` displaying all character data
5. **Display archetype feature text** (Consequences of Conflict / One of the Best) from `archetypes.ts`
6. **Display Wise Essence Pool** as derived value: `level + attributes[vocation.assignedAttributes[0]]`
7. **Inline editing** for: name, ancestry, vocation, affiliation, moves, experiences, attribute assignments
8. **Notes textarea** — large editable textarea for freeform notes/items
9. **Portrait placeholder** — display area with future image upload support

### Phase 3 — Leveling System

10. **Implement `levelUp()` function** in `src/lib/generator/leveling.ts` (or similar):
    - Attribute increase at levels 3, 5, 7, 9, 10 (user selects which attribute)
    - Attribute caps: max 3 normally, max 4 for one attribute at level 10, total must equal `4 + number_of_increases`
    - New move slot at levels 2, 4, 6, 8, 10
    - New experience at levels 4, 8, 10
    - Grit & Sanity recalculation: `1 + floor((level - 1) / 2)`
11. **Level-up button** on character sheet with attribute selection UI
12. **Validation**: enforce attribute caps and level 10 total constraint

### Phase 4 — Theming & Polish

13. **Add custom fonts**: Cinzel (headings), EB Garamond (body), rune-like accents (Uncial Antiqua)
14. **Dark medieval visual design**: parchment textures, gold accents (`#b89f5d`), engraved attribute badges
15. **Light/dark mode toggle** with Tailwind dark mode class strategy
16. **Navigation**: add header/nav with links between generator and character list

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

| Level | Attribute Increase | New Move | New Experience | Grit/Sanity |
|-------|--------------------|----------|----------------|-------------|
| 1     | +1 (during gen)    | 2 slots  | 2 (during gen) | 1           |
| 2     |                    | +1 slot  |                | 1           |
| 3     | +1                 |          |                | 2           |
| 4     |                    | +1 slot  | +1             | 2           |
| 5     | +1                 |          |                | 3           |
| 6     |                    | +1 slot  |                | 3           |
| 7     | +1                 |          |                | 4           |
| 8     |                    | +1 slot  | +1             | 4           |
| 9     | +1                 |          |                | 5           |
| 10    | +1 (cap 4 allowed) | +1 slot  | +1             | 5           |

### Content Tables
- Ancestries: 5 (Human default 50%, 4 non-human with 2 attribute assignments)
- Vocations: ~117
- Affiliations: 8
- Experiences: ~403
- Move name words: prefix+suffix per archetype

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
│   │   ├── affiliations.ts   # 8 faction/guild names
│   │   ├── ancestries.ts     # 5 ancestry definitions (Human default + 4 non-human)
│   │   ├── archetypes.ts     # Archetype definitions with feature descriptions
│   │   ├── experiences.ts    # ~403 grimdark backstory strings
│   │   ├── vocations.ts      # ~117 vocation/class names
│   │   └── moves/
│   │       ├── strong.ts     # Combat Maneuver word lists (prefix/suffix)
│   │       ├── deft.ts       # Special Technique word lists
│   │       └── wise.ts       # Miracle word lists
│   ├── generator/            # Character generation logic (pure functions)
│   │   ├── generateCharacter.ts  # Main entry: assembles a full Character
│   │   ├── generateName.ts       # Random fantasy name from prefix+suffix
│   │   └── utils.ts              # randomFrom, randomUnique, NLP preposition, generateId
│   ├── models/
│   │   └── character.ts      # TypeScript types/interfaces for Character
│   └── stores/
│       └── characterStore.ts # Svelte writable store backed by localStorage
└── routes/
    ├── +layout.svelte        # Root layout (imports TailwindCSS, favicon)
    ├── layout.css            # TailwindCSS entry point
    ├── +page.svelte          # Home page — generator UI (has characterStore import bug)
    ├── page.svelte.spec.ts   # Component test for home page
    └── characters/
        └── +page.svelte      # Preserved characters list page (links to missing [id] route)
```

---

## Character Model (`src/lib/models/character.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 |
| `name` | `string` | Procedurally generated fantasy name |
| `level` | `number` | Always starts at 1 |
| `archetype` | `'strong' \| 'deft' \| 'wise'` | Determines move type and class feature |
| `attributes` | `Record<AttributeName, number>` | brawns, agility, wits, presence (base 1, one randomly +1) |
| `grit` | `number` | Health-like stat (starts at 1) |
| `sanity` | `number` | Mental health stat (starts at 1) |
| `ancestry` | `Trait` | Race/species with attribute bonuses |
| `vocation` | `Trait` | Class/job with one bonus attribute |
| `affiliations` | `Trait[]` | Faction memberships with bonus attributes |
| `experiences` | `Experience[]` | Randomly chosen backstory events |
| `moves` | `MoveSlot[]` | Archetype-specific move slots |
| `notes` | `string` | Free-text field (empty initially) |
| `summary` | `string?` | NLP-generated one-line description |
| `portrait` | `string?` | Future image upload support |
| `createdAt` | `number` | Timestamp |

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
- TailwindCSS utility classes directly in Svelte templates (dark neutral palette, amber accents).
- Svelte 5 runes syntax in layout (`$props()`); classic `on:click` event handlers in page components.
- localStorage persistence only — no backend, no API calls.
- OSR design philosophy: chaos during birth, control after preservation. No partial rerolls.
