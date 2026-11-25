# 001: Korpus wzorcowy rymów

- Status: szkic
- Data: 2026-10-29
- Powiązane: wszystkie reguły z `rhyme-spec.md`, H1, ADR 0002

## Cel

Analizator to heurystyka strojona na przykładach. Każda poprawka może zepsuć wcześniejszy przykład, a testy jednostkowe sprawdzają tylko wybrane fragmenty. Potrzebny jest zestaw tekstów z oczekiwanym kolorowaniem, ocenionych przez człowieka, na którym każda zmiana jest weryfikowana w całości.

## Historyjka

Jako autor analizatora chcę jednym poleceniem zobaczyć, które oczekiwane rymy zniknęły, a które pojawiły się bez uzasadnienia, żeby świadomie przyjmować lub odrzucać zmiany reguł.

## Kryteria akceptacji

1. **Dane** pliki w `src/rhyme/corpus/*.txt` z tekstem w notacji `[worek rok]¹ … [cho⟨waj pa⟩łer pojnt]¹`, **gdy** uruchamiam `npm test`, **wtedy** test porównuje grupy i kolory wyniku z adnotacjami.
2. **Gdy** wynik różni się od wzorca, **wtedy** raport pokazuje brakujące i nadmiarowe rymy dla każdego wersu.
3. Rymy oznaczone jako `?` (niepewne) nie powodują błędu, tylko trafiają do raportu.
4. Korpus zawiera wszystkie przykłady z `rhyme-spec.md` i testów; nowe przykłady od użytkowników dopisujemy do korpusu, zanim zmienimy kod.
5. Raport podaje odsetek zgodności (metryka H1).

## Poza zakresem

- Pełne teksty utworów chronionych prawem autorskim: korpus zawiera krótkie fragmenty (do 4 wersów) albo teksty własne.
- Interfejs do adnotacji w aplikacji.

## Zmiany w specyfikacjach

- `rhyme-spec.md`: brak nowych reguł; sekcja z notacją korpusu.
- `architecture.md`: sekcja Testy.

## Plan testów

- Test korpusu w Vitest, uruchamiany w `npm test`.

## Otwarte pytania

- Czy wzorzec sprawdza tylko granice rymów i grupy, czy też dokładny podział na fragmenty kolorowe (K-01)?
- Kto ocenia przykłady poza autorem (H1: 3–5 osób piszących)?
