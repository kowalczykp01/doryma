# Architektura

## Kontekst

DoRyma to statyczna aplikacja React (PWA) działająca w całości w przeglądarce. Nie ma backendu, bazy danych ani kont (ADR 0001). Tekst nie opuszcza urządzenia; szkic zapisuje się w `localStorage`.

## Stack

| Warstwa | Technologia |
| --- | --- |
| UI | React 19, TypeScript (strict, `noUncheckedIndexedAccess`) |
| Build | Vite 6, `vite-plugin-pwa` (service worker `autoUpdate`, manifest) |
| Testy | Vitest 3 (środowisko `node`) |
| Hosting | statyczny (docelowo Cloudflare Pages) |

Nowa zależność runtime wymaga ADR.

## Moduły

```
src/
├── rhyme/                    logika, bez Reacta i DOM
│   ├── syllables.ts          sylabizacja, normalizacja, akcent, koda (S-01…S-06, R-01)
│   ├── numbers.ts            czytanie liczb (P-04, P-05)
│   ├── pronunciation.ts      adnotacje wymowy *…* i liczby jako wymowa (P-01…P-06)
│   ├── language.ts           czy tekst jest po polsku, podpowiedzi wymowy (L-01, L-02)
│   └── analyze.ts            kandydaci, wybór, grupy, kolory (R-02…R-08, W-01…W-04, K-01…K-03, K-05)
├── components/
│   ├── VerseEditor.tsx       edycja wers po wersie
│   ├── Landing.tsx           strona startowa z przykładem liczonym przez analizator
│   ├── RhymeView.tsx         animowany wynik, legenda, infotip i edycja wymowy liczb (ReadingForm)
│   ├── TextNotices.tsx       ostrzeżenie o języku i podpowiedzi wymowy
│   └── palette.ts            numer koloru → kolor CSS (K-04)
├── App.tsx                   widoki (strona startowa / aplikacja) i tryby: edycja, wklejanie, wynik
└── main.tsx                  start aplikacji i rejestracja service workera
```

Nawigacja: hash (`#/` strona startowa, `#/app` aplikacja), bez biblioteki routera. Dwa widoki nie uzasadniają zależności, a hosting statyczny nie potrzebuje przekierowań (spec 004).

Zasada: `src/rhyme/` nie importuje niczego z `components/` ani Reacta. To czysta funkcja `analyze(verses: string[]): Analysis`, którą można przenieść np. do Web Workera albo na serwer.

## Przepływ danych

1. `prepareVerse` buduje wymowę wersu: adnotacje `*…*` i samodzielne liczby (`readNumber`) zastępują zapis w wymowie, a na ekranie zostaje zapis. Sylaby wymowy są mapowane na zakresy znaków zapisu; każda zamiana jest zapisana jako `Reading`.
2. `quatrainsOf` dzieli tekst na czwórki (R-02). `findCandidates` dla każdej pary końcowych sylab wyrazów w wersach, które mogą się rymować (ta sama czwórka albo sąsiednie wersy na styku), cofa się, dopóki samogłoski się zgadzają (`extend`, z luką wg R-04), i ocenia kandydata (W-01).
3. Kandydaci są przyjmowani zachłannie od najlepszego. Union-find łączy ciągi w grupy; `locate` i `alignTo` obsługują przycinanie i dołączanie (W-03, W-04); `isAcceptable` filtruje krótkie rymy (R-05, R-06).
4. Dla każdej grupy `chunkByWords` dzieli pozycje na fragmenty kolorowe (K-01), `keepWholeChunks` odcina wystąpienia pokrywające fragment tylko częściowo (K-05), a kolor wynika z układu samogłosek (K-02).
5. Wynik: dla każdego wersu lista segmentów `{ text, color?, groupId?, reading? }` i lista grup do legendy. `reading` oznacza liczbę przeczytaną automatycznie.
6. W wyniku zmiana wymowy liczby wywołuje `addPronunciation`, które dopisuje adnotację do surowego tekstu wersu w miejscu `Reading.rawEnd` (P-06); tekst przelicza się od nowa.
7. Niezależnie od analizy `checkText` ocenia język tekstu i zbiera podpowiedzi wymowy (L-01, L-02). Oba wyniki liczą się dopiero przy przejściu do widoku wyniku.

## Model wyniku

```ts
interface Analysis {
  verses: {
    text: string;
    syllableCount: number;
    segments: { text: string; color?: number; groupId?: number; reading?: string }[];
    readings: Reading[]; // liczby czytane automatycznie
  }[];
  groups: { id; length; multiplicity; colors: number[]; chunks: string[][]; occurrences: { verse; text; length }[] }[];
}
```

Kolory to indeksy; konkretne barwy nadaje `palette.ts`.

```ts
interface Reading {
  start: number; end: number;       // zakres w tekście wyświetlanym
  rawStart: number; rawEnd: number; // ten sam zakres w surowym wersie (z adnotacjami)
  spoken: string;
  source: 'annotation' | 'number';
}
```

```ts
interface TextCheck {
  language: 'polish' | 'other' | 'unknown';
  hints: { verse: number; word: string; reason: 'foreign' | 'mixed' | 'silent' }[];
}
```

## Wymagania niefunkcjonalne

| ID | Wymaganie | Stan |
| --- | --- | --- |
| N-01 | Analiza 100 wersów < 500 ms na laptopie | ok. 260 ms dla 96 wersów (zmierzone) |
| N-02 | Działanie offline po pierwszym wczytaniu | service worker PWA |
| N-03 | Tekst nie opuszcza urządzenia | brak żądań sieciowych z treścią |
| N-04 | Obsługa przeglądarek: ostatnie 2 wersje Chrome, Safari (iOS), Firefox, Edge | nie testowane automatycznie |
| N-05 | Dostępność: WCAG 2.2 AA, cele dotykowe ≥ 44 px, `prefers-reduced-motion` | zob. `ui.md` |

Analiza jest kwadratowa względem liczby sylab w czwórce, a liniowa względem liczby czwórek (ADR 0006). Gdy N-01 przestanie być spełniane, kolejny krok to Web Worker (bez zmian w `rhyme/`).

## Testy

- `src/rhyme/*.test.ts`: reguły ze `rhyme-spec.md`; nazwa testu zaczyna się od ID reguły (`it('R-04: …')`).
- Każda reguła ze statusem „obowiązuje” ma co najmniej jeden test.
- Komendy: `npm test`, `npm run typecheck`, `npm run build`.

## Decyzje

Rejestr w `docs/adr/`. Nowa decyzja = nowy plik `NNNN-krotki-tytul.md`; decyzji nie edytujemy, tylko zastępujemy nową (status „zastąpiona przez NNNN”).
