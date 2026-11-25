# 002: Sprawdzanie języka i podpowiedzi wymowy

- Status: zrealizowana
- Data: 2026-10-29
- Powiązane: L-01, L-02, P-01, Q-05, Q-12, ADR 0005

## Cel

Analizator dzieli sylaby według polskiej wymowy. Dla tekstu w innym języku albo z wyrazami obcymi wynik bywa niedokładny, a użytkownik nie wie dlaczego. Chcemy to wyjaśnić, ale nie blokować analizy: mieszanie języków to w rapie norma.

## Historyjka

Jako osoba analizująca tekst chcę wiedzieć, kiedy wynik może być niedokładny i które wyrazy warto opisać wymową, żeby poprawić kolorowanie.

## Kryteria akceptacji

1. **Dane** tekst w większości po polsku (także bez polskich znaków), **gdy** pokazuję rymy, **wtedy** nie widzę ostrzeżenia o języku.
2. **Dane** tekst po angielsku lub niemiecku (≥ 8 wyrazów), **gdy** pokazuję rymy, **wtedy** widzę ostrzeżenie, a rymy i tak są pokolorowane.
3. **Dane** tekst krótszy niż 8 wyrazów, **wtedy** nie oceniamy języka.
4. **Dane** wyrazy `flow`, `2pac`, `DJ` bez adnotacji, **gdy** pokazuję rymy, **wtedy** widzę je w podpowiedzi „Sprawdź wymowę” z numerem wersu i powodem, każdy raz.
5. **Dane** wyraz z adnotacją (`power point *pałer pojnt*`) albo liczba czytana automatycznie, **wtedy** nie ma ich w podpowiedziach.

## Decyzja: własna heurystyka zamiast biblioteki

Rozważane: biblioteka n-gramowa (`franc`), API Language Detector w przeglądarce, własna heurystyka. Wybrana heurystyka (częste polskie słowa + polskie litery), bo:

- polski łatwo rozpoznać po kilku wyrazach, a teksty mają zwykle kilkanaście wersów,
- nie dodaje zależności (ADR 0002), działa wszędzie i offline,
- biblioteki n-gramowe są zawodne na krótkich tekstach, a API przeglądarki nie jest dostępne wszędzie.

## Poza zakresem

- Wykrywanie, który wers jest w którym języku.
- Automatyczna wymowa wyrazów obcych (Q-05).

## Zmiany w specyfikacjach

- `rhyme-spec.md`: nowa sekcja 6 „Język tekstu” (L-01, L-02), Q-05 zaktualizowane, Q-12.
- `ui.md`: komunikaty nad wynikiem, U-05.
- `architecture.md`: moduł `language.ts`, `TextCheck`.

## Plan testów

- `src/rhyme/language.test.ts`: L-01 (polski z polskimi znakami i bez, angielski, niemiecki, krótki tekst), L-02 (powody, deduplikacja, pomijanie adnotacji i liczb, brak podpowiedzi dla polskiego).
- Sprawdzenie w przeglądarce: ostrzeżenie dla tekstu angielskiego, podpowiedzi dla `flow`, `2pac`, `DJ`.

## Otwarte pytania

- Q-12: progi dobrane na kilku tekstach; do sprawdzenia na korpusie (spec 001).
- U-05: czy podpowiedź ma prowadzić do edycji wersu.
