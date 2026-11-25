# 003: Automatyczne czytanie liczb

- Status: zrealizowana
- Data: 2026-10-29
- Powiązane: P-02, P-04, P-05, P-06, Q-09, Q-10, Q-11, ADR 0005

## Cel

Liczby są w tekstach rapowych częste (`rocznik 97`, `300 na liczniku`, `100%`), a dotąd cyfry były pomijane i nie brały udziału w rymach. Chcemy czytać je automatycznie, bez wymagania adnotacji przy każdej liczbie, ale z możliwością poprawienia formy.

## Historyjka

Jako osoba analizująca tekst chcę, żeby liczby rymowały się tak, jak się je wymawia, i żebym widział, jak aplikacja je przeczytała, a w razie potrzeby mógł to poprawić.

## Kryteria akceptacji

1. **Dane** wers `na liczniku znowu 300` i wers kończący się na `trzysta`, **gdy** pokazuję rymy, **wtedy** `300` rymuje się z `trzysta`, a na ekranie zostają cyfry.
2. **Dane** liczba przeczytana automatycznie, **wtedy** ma kropkowane podkreślenie i podpowiedź „czytane jako: …”.
3. **Dane** `w 2005 *dwa tysiące piątym*`, **wtedy** wymowa adnotacji zastępuje całą liczbę `2005` (nie wyraz `w`), a liczba nie ma podkreślenia automatycznego czytania.
4. **Dane** `2pac`, `S500`, **wtedy** cyfry nie są czytane automatycznie, a wyrazy trafiają do podpowiedzi wymowy (spec 002).
5. Godziny, ułamki dziesiętne, procenty i złote czytamy wg tabeli P-05; liczba złotych i tysięcy ma poprawną formę (1 / 2–4 / 5+ i 12–14).

## Decyzja

Własna implementacja liczebników (ok. 100 linii) zamiast biblioteki: potrzebujemy też godzin, procentów i złotych, a kod jest prosty i w pełni testowalny. Forma jest zawsze mianownikiem liczebnika głównego; formy zależne od kontekstu (Q-09) świadomie odkładamy, bo wymagają reguł składni, a użytkownik może je nadpisać adnotacją (P-06).

## Poza zakresem

- Forma liczebnika z kontekstu: „dwie”, „dwóch”, „piątym” (Q-09).
- Liczebniki porządkowe z kropką, liczby rzymskie, zakresy, `10k`, inne waluty (Q-10).
- Słownik nazw z cyframi (`2pac`, `50 Cent`) (Q-05).

## Zmiany w specyfikacjach

- `rhyme-spec.md`: P-04, P-05, P-06, uzupełnienie P-02, Q-09, Q-10, Q-11.
- `ui.md`: oznaczenie liczb czytanych automatycznie, podpowiedź w edytorze, U-04.
- `architecture.md`: moduł `numbers.ts`, `Reading`, pole `reading` w segmencie.

## Plan testów

- `src/rhyme/numbers.test.ts`: liczebniki (P-04), godziny, ułamki, procenty, złote (P-05), liczby sklejone z literami (P-06).
- `src/rhyme/pronunciation.test.ts`: liczby w wymowie wersu i `Reading` (P-04), adnotacja po liczbie (P-06), rym `300 ~ trzysta` i oznaczenie segmentów (P-04).
- Sprawdzenie w przeglądarce: podkreślenie, rym liczby, adnotacja po liczbie.

## Otwarte pytania

- Q-09, Q-10, Q-11 w `rhyme-spec.md`; U-04 w `ui.md`.
