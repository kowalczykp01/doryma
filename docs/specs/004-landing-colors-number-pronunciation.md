# 004: Strona startowa, nowa kolorystyka, wymowa liczb w wyniku

- Status: zrealizowana
- Data: 2026-10-29
- Powiązane: P-04, P-06, U-04, U-05, `ui.md`

## Cel

1. Osoba, która trafia na stronę pierwszy raz, nie wie, co robi DoRyma. Potrzebna jest strona startowa, która wyjaśnia cel i możliwości aplikacji i prowadzi do edytora.
2. Biało-czerwony tekst na ciemnym tle jest słabo czytelny i gryzie się z kolorami rymów. Zmieniamy kolorystykę interfejsu (tło zostaje ciemne).
3. Liczby czytane automatycznie (P-04) mają podpowiedź tylko po najechaniu kursorem (U-04), a poprawienie wymowy wymaga powrotu do edytora i ręcznego dopisania gwiazdek. Chcemy wyjaśnić zasadę przy liczbie i pozwolić dodać wymowę jednym kliknięciem.

## Historyjki

- Jako nowa osoba chcę od razu zobaczyć, co robi aplikacja i jak wygląda wynik, żeby zdecydować, czy wkleić swój tekst.
- Jako osoba analizująca tekst chcę wiedzieć, jak aplikacja przeczytała liczbę, i poprawić to bez szukania wersu w edytorze.

## Kryteria akceptacji

### Strona startowa

1. **Gdy** wchodzę na stronę (adres bez `#/app`), **wtedy** widzę stronę startową: nagłówek z celem aplikacji, animowany przykład pokolorowanego tekstu, „Jak to działa” (3 kroki), „Co potrafi” (funkcje) i wyjaśnienie krotności rymów.
2. **Gdy** klikam **Pokoloruj swój tekst**, **wtedy** przechodzę do edytora (`#/app`) ze swoim zapisanym szkicem.
3. **Gdy** klikam **Zobacz przykład**, **wtedy** strona przewija się do animowanego przykładu i odtwarza animację. Szkic w edytorze się nie zmienia (pierwotnie: przejście do wyniku dla tekstu przykładowego; zmienione, bo nadpisywałoby zapisany szkic).
4. **Gdy** jestem w aplikacji i odświeżę stronę, **wtedy** zostaję w aplikacji (edytor), a nie wracam na stronę startową. Logo prowadzi na stronę startową; przycisk Wstecz w przeglądarce działa.
5. Strona startowa działa na telefonie (od 320 px szerokości) i ma te same zasady dostępności co reszta aplikacji.

### Kolorystyka „złoto na grafit”

6. Tokeny: tło `#121214`, powierzchnia `#1c1c21`, powierzchnia 2 `#2a2a31`, tekst `#ece6da`, tekst wyciszony `#9a958a`, akcent `#f2c14e`, fokus `#7dd3fc`.
7. Kontrast tekstu i tekstu wyciszonego do tła spełnia WCAG AA (≥ 4,5:1). Przycisk główny: złote tło, ciemny tekst.
8. Kolory rymów (paleta K-04) się nie zmieniają. `theme-color`, manifest i ikona używają nowego tła.

### Wymowa liczb w wyniku

9. **Dane** liczba czytana automatycznie, **gdy** najadę na nią kursorem albo ustawię na niej fokus (Tab, dotknięcie), **wtedy** widzę infotip: jak liczba została przeczytana i zasadę („liczby czytamy jako liczebnik główny w mianowniku; jeśli w tekście brzmią inaczej, dodaj wymowę”).
10. **Dane** taka liczba, **wtedy** obok niej jest ikona ołówka z etykietą „Dodaj wymowę: 300”. **Gdy** ją klikam, **wtedy** pod wersem otwiera się pole z bieżącą wymową do edycji oraz przyciskami **Zapisz** i **Anuluj**.
11. **Gdy** zapisuję inną wymowę, **wtedy** w tekście wersu za liczbą pojawia się adnotacja `*…*` (P-06), wynik przelicza się od razu, a liczba nie jest już oznaczona jako czytana automatycznie. Animacja całego tekstu się nie powtarza.
12. **Gdy** zapisuję pustą wymowę, bez liter, albo identyczną jak automatyczna, **wtedy** tekst się nie zmienia. Gwiazdki w polu są usuwane.
13. Escape lub **Anuluj** zamyka pole bez zmian; fokus wraca na ikonę.

## Decyzje

- Nawigacja przez hash (`#/` i `#/app`), bez biblioteki routera: dwa widoki nie uzasadniają nowej zależności (ADR 0001, `architecture.md`). Hosting statyczny nie wymaga wtedy przekierowań.
- Pole edycji wymowy otwiera się pod wersem, a nie jako dymek: działa na wąskich ekranach i nie zasłania tekstu.
- Ikona ołówka ma cel 28 × 28 px: to kontrolka w linii tekstu (wyjątek WCAG 2.5.8 dla elementów w treści). Pozostałe przyciski zostają ≥ 44 px.

## Poza zakresem

- Ikona dodawania wymowy przy wyrazach z podpowiedzi L-02 (U-05) i przy liczbach z adnotacją użytkownika.
- Wersja angielska strony startowej (U-01).

## Zmiany w specyfikacjach

- `ui.md`: strona startowa, nawigacja, nowe tokeny, infotip i edycja wymowy liczby; U-04 rozwiązane.
- `architecture.md`: moduły `Landing.tsx`, `ReadingEditor`, nawigacja, `Reading.rawStart/rawEnd`, `AnalyzedVerse.readings`.
- `rhyme-spec.md`: P-06 wskazuje na edycję z wyniku.

## Plan testów

- Jednostkowe: `addPronunciation` (wstawienie adnotacji, puste i identyczne wymowy, usuwanie gwiazdek, wers z wcześniejszą adnotacją i wcięciem), zakresy `rawStart/rawEnd` w `prepareVerse`.
- W przeglądarce: strona startowa (desktop i 375 px), przejścia i odświeżenie, Wstecz, infotip, zapis wymowy liczby, Escape, kontrast tokenów.
