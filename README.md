# Grimwhite

A dark-fantasy TTRPG random character generator built with SvelteKit 2, Svelte 5, TailwindCSS 4 and TypeScript.

Grimwhite generates complete player characters for a grim, low-fantasy tabletop RPG setting. Each character comes with a name, archetype, ancestry, vocation, affiliation, experiences, combat moves, attributes, and a one-line narrative summary.

## Features

- **One-click character generation** — press "Birth the Wretch" to get a fully randomised character.
- **Three archetypes** — Strong (Combat Maneuvers), Deft (Special Techniques), Wise (Miracles).
- **Rich content tables** — 100+ vocations, 400+ experiences, multiple ancestries, affiliations and procedurally named moves.
- **Preserve characters** — save generated characters to `localStorage` and browse them on the `/characters` page.
- **NLP-powered summaries** — uses [compromise](https://github.com/spencermountain/compromise) to build grammatically correct character summaries.

## Getting Started

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check with `svelte-check` |
| `npm run lint` | Lint & format check |
| `npm run format` | Auto-format with Prettier |
| `npm run test` | Run unit tests (Vitest) |

## Tech Stack

- **SvelteKit 2** + **Svelte 5** (runes)
- **TailwindCSS 4** with typography & forms plugins
- **TypeScript**
- **Vitest** (node + Playwright browser tests)
- **compromise** (NLP for summary generation)
