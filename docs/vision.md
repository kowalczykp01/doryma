# Wizja produktu

## Problem

W polskim rapie liczą się rymy wielokrotne: dwie, trzy i więcej sylab, które rymują się samogłoskami, często w środku wersu i między wersami. W zapisie tekstu ich nie widać. Osoba pisząca tekst sprawdza je „na ucho”, a słuchacz, który chce zrozumieć, co się rymuje, musi zaznaczać je ręcznie.

## Rozwiązanie

DoRyma koloruje rymy w tekście: ten sam układ samogłosek ma ten sam kolor, a kolorowanie płynnie przechodzi wers po wersie. To prosta aplikacja frontendowa: wpisujesz lub wklejasz tekst i widzisz rymy. Działa w przeglądarce, bez konta i bez wysyłania tekstu na serwer.

## Użytkownicy

| Grupa | Potrzeba |
| --- | --- |
| Osoby piszące teksty | Sprawdzić gęstość i krotność rymów w trakcie pisania |
| Słuchacze i fani | Zobaczyć, „co tam się rymuje”, w ulubionym kawałku |

## Cele (obecna wersja)

1. Kolorowanie zgodne z intuicją rapera dla typowych tekstów (reguły w `rhyme-spec.md`).
2. Wpisywanie i wklejanie tekstu wersami, adnotacje wymowy, automatyczne czytanie liczb.
3. Ostrzeżenie, gdy tekst nie wygląda na polski, i podpowiedzi wyrazów, które mogą wymagać wymowy.
4. Animowane kolorowanie i legenda rymów.
5. PWA: instalacja na telefonie, działanie offline.

## Poza zakresem (obecnie)

- Backend, konta i przechowywanie tekstów (patrz „Kierunek rozwoju”).
- Ocena flow, rytmu i metrum (liczymy sylaby, nie mierzymy czasu).
- Rozpoznawanie wymowy wyrazów obcych bez adnotacji.
- Generowanie tekstów i podpowiadanie rymów przez AI.
- Analiza tekstów w innych językach niż polski.

## Kierunek rozwoju

Docelowo DoRyma ma mieć backend i bazę pokolorowanych tekstów piosenek: coś jak Genius, tylko zamiast adnotacji są rymy. Użytkownik mógłby wyszukać utwór i zobaczyć jego rymy bez wklejania tekstu.

Zanim to powstanie, trzeba rozstrzygnąć (osobne ADR i specyfikacje):

- architekturę backendu i przechowywania (zastąpi ADR 0001),
- prawa do tekstów piosenek: publikowanie pełnych tekstów wymaga licencji albo modelu, w którym tekst dostarcza użytkownik,
- czy wynik analizy jest liczony raz i zapisywany, czy za każdym razem w przeglądarce, i jak wersjonować reguły (`rhyme-spec.md`), żeby zapisane kolorowania nie zmieniały się po cichu.

## Hipotezy

| ID | Hipoteza | Jak sprawdzić |
| --- | --- | --- |
| H1 | Kolorowanie trafia w intuicję: osoby piszące zgadzają się z ≥ 80% zaznaczonych rymów | Ocena 10 tekstów przez 3–5 osób piszących (korpus, spec 001) |
| H2 | Animacja kolorowania jest atrakcyjna i ludzie ją udostępniają | Zrzuty ekranu i udostępnienia po publikacji |

## Metryki

- Odsetek rymów zgodnych z oceną człowieka, mierzony w korpusie wzorcowym (H1).
- Czas analizy 100 wersów (N-01 w `architecture.md`).
