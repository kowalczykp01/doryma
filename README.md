# DoRyma

Multi-syllable rhyme highlighting for Polish rap lyrics. Type or paste lyrics verse by verse and DoRyma colors the syllables that rhyme by their vowels: the same vowel pattern gets the same color across the whole text. Rhymes are searched within quatrains (four verses) and across their borders.

- Runs entirely in the browser; the lyrics never leave the device.
- PWA: can be installed on a phone and used offline.
- Pronunciation of foreign words goes in asterisks: `power point *pałer pojnt*`. Numbers are read aloud automatically (`300` = "trzysta").
- Warns when the text does not look Polish and points out words that may need a pronunciation.
- The landing page (`/`) explains how the app works; the app itself lives at `/#/app`.

The user interface and the project documentation in `docs/` are in Polish.

## Getting started

Requires Node.js 20+.

```bash
npm ci
npm run dev
```

The app runs at http://localhost:5173.

| Command | Description |
| --- | --- |
| `npm test` | tests (Vitest) |
| `npm run typecheck` | type check |
| `npm run build` | production build to `dist/` |
| `npm run preview` | preview the build |

## Deployment

Static hosting of the `dist/` folder (e.g. Cloudflare Pages): build command `npm run build`, output directory `dist`.

## Documentation (Polish)

- [Rhyme specification](docs/rhyme-spec.md)
- [Product vision](docs/vision.md)
- [Architecture](docs/architecture.md)
- [User interface](docs/ui.md)
- [Architecture decision records](docs/adr/)
- [Feature specifications](docs/specs/)
