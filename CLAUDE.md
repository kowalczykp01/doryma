# CLAUDE.md: DoRyma

Aplikacja webowa (PWA, React + TypeScript) kolorująca rymy wielokrotne w polskich tekstach rapowych. Działa w całości w przeglądarce.

## Dokumenty (przeczytaj przed zmianą)

- `docs/rhyme-spec.md`: reguły rymów z ID (S, P, R, W, K) i otwarte pytania (Q). **Źródło prawdy dla analizatora.**
- `docs/vision.md`: problem, użytkownicy, cele, non-goals, hipotezy.
- `docs/architecture.md`: moduły, przepływ danych, wymagania niefunkcjonalne (N).
- `docs/ui.md`: tryby, interakcje, animacja, design tokens, dostępność.
- `docs/adr/`: decyzje architektoniczne.
- `docs/specs/`: specyfikacje funkcji (`_template.md`).

## Proces: spec-driven

1. **Najpierw specyfikacja.** Zmiana zachowania analizatora zaczyna się od zmiany reguły w `rhyme-spec.md` (nowa reguła = nowe ID, nigdy nie przenumerowujemy). Nowa funkcja zaczyna się od pliku w `docs/specs/` z kryteriami akceptacji. Zmianę spec pokazuję użytkownikowi do akceptacji, zanim zmienię kod.
2. **Potem test.** Test, który nie przechodzi, z ID reguły na początku nazwy: `it('R-04: …')`.
3. **Potem kod**, aż testy przejdą. Każda reguła „obowiązuje” ma co najmniej jeden test.
4. **Konflikt kodu i spec:** spec wygrywa. Jeśli spec jest niejasna albo nie przewiduje przypadku, zatrzymuję się i pytam; nie rozstrzygam po cichu.
5. **Przykład od użytkownika** („to powinno się rymować”) najpierw zapisuję jako przykład ✅/❌ przy właściwej regule, potem decyduję, czy to nowa reguła, czy poprawka istniejącej.
6. **Odstępstwo od architektury** (nowa zależność runtime, backend, zmiana modułów) wymaga nowego ADR i akceptacji.
7. Zachowanie, którego nikt nie zdecydował, zapisuję jako otwarte pytanie (Q-xx), a nie jako regułę.

## Stack

React 19, TypeScript strict (`noUncheckedIndexedAccess`), Vite 6, vite-plugin-pwa, Vitest 3. Bez backendu (ADR 0001).

## Struktura

```
src/rhyme/       logika analizy, bez Reacta i DOM (syllables, numbers, pronunciation, language, analyze + testy)
src/components/  Landing, VerseEditor, RhymeView, TextNotices, palette
src/App.tsx      widoki (strona startowa, aplikacja) i tryby: edycja, wklejanie, wynik
docs/            specyfikacje
```

## Konwencje

- Kod, nazwy, komentarze, commity i `README.md` po angielsku; dokumentacja w `docs/` i interfejs po polsku.
- Komentarze tylko tam, gdzie wyjaśniają regułę lub nieoczywistą decyzję; reguła w komentarzu może wskazywać ID ze spec.
- Wagi i progi analizatora (W-01) zmieniamy tylko razem ze spec i testami.
- `localStorage` zawsze w `try/catch`.

## Komendy

```bash
npm ci
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run typecheck  # tsc strict
npm run build      # tsc + vite build → dist/
```

Przed commitem: `npm run typecheck && npm test && npm run build`.
