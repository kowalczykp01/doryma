# Interfejs

Dwa widoki: strona startowa i aplikacja z trzema trybami (`App.tsx`). Mobile first, ciemny motyw „złoto na grafit”, interfejs po polsku.

## Nawigacja

| Adres | Widok |
| --- | --- |
| `/`, `/#/` | strona startowa (`Landing`) |
| `/#/app` | aplikacja: edycja, wklejanie, wynik |

- Wejście na stronę zawsze pokazuje stronę startową. Odświeżenie w aplikacji zostawia w aplikacji (edytor).
- Logo w nagłówku prowadzi na stronę startową; Wstecz w przeglądarce działa, bo zmiana widoku to zmiana hasha.
- Tryb aplikacji (edycja, wklejanie, wynik) nie jest w adresie; po odświeżeniu zawsze edycja.

## Strona startowa

Kolejne sekcje:

1. **Nagłówek:** logo i przycisk **Otwórz aplikację**.
2. **Hero:** nadtytuł „Rymy wielokrotne w polskim rapie”, tytuł „Zobacz, co się rymuje.”, opis celu aplikacji, przyciski **Pokoloruj swój tekst** (do edytora z zapisanym szkicem) i **Zobacz przykład** (przewija do przykładu i odtwarza animację; nie zmienia szkicu), dopisek „Za darmo, bez konta. Tekst nie opuszcza Twojego urządzenia.”.
3. **Przykład:** animowany wynik analizy czterech wersów (bez legendy), liczony na żywo przez analizator.
4. **Jak to działa:** 3 kroki (wpisz lub wklej, analiza samogłosek, kolory i legenda).
5. **Co potrafi:** 6 kart (rymy wielokrotne, niedokładne, wymowa w gwiazdkach, liczby, podpowiedzi, prywatnie i offline).
6. **Krotność rymu:** pojedynczy, podwójny, potrójny, każdy z parą wersów pokolorowaną przez analizator.
7. **Zakończenie:** „Masz tekst? Sprawdź go.” i **Pokoloruj swój tekst**.

## Tryby aplikacji

### Edycja (domyślny)

- Każdy wers to osobne pole (`VerseEditor`). Numer wersu po lewej, liczba sylab po prawej (z wymowy, P-01).
- **Enter** dzieli wers w miejscu kursora i przechodzi do nowego.
- **Backspace** na początku wersu łączy go z poprzednim; kursor ląduje w miejscu złączenia.
- **↑ / ↓** przechodzą między wersami.
- Wklejenie tekstu z kilkoma liniami w pole wersu dzieli go na wersy w miejscu wklejenia.
- Pusty wers oznacza podział zwrotki.
- Pasek narzędzi: **Wklej tekst**, **Wstaw przykład**, **Wyczyść** (nieaktywne, gdy tekst jest pusty).
- Przycisk główny: **Pokoloruj rymy** (nieaktywny bez tekstu).
- Podpowiedź pod edytorem: Enter, puste wersy, składnia `power point *pałer pojnt*` i nadpisywanie wymowy liczby: `w 2005 *dwa tysiące piątym*`.

### Wklejanie

- Pole tekstowe z całym bieżącym tekstem. Każda linia to wers.
- **Podziel na wersy**: przycina linie, zamienia serie pustych linii na jeden podział zwrotki, usuwa puste linie na końcu.
- **Anuluj** wraca do edycji bez zmian.

### Wynik

- Wersy pojawiają się kolejno, a rymy w każdym wersie zaliczają się jeden po drugim.
  - Opóźnienie wersu: `min(550 ms, 20 s / liczba wersów)`, żeby długi tekst kończył się w ok. 20 s.
  - Opóźnienie kolejnego fragmentu w wersie: 90 ms; wejście wersu 400 ms, rymu 600 ms.
- Podział zwrotki to pusty odstęp.
- **Komunikaty** nad tekstem (`TextNotices`, `role="status"`), nigdy nie blokują wyniku:
  - gdy tekst nie wygląda na polski (L-01): „Ten tekst nie wygląda na polski. DoRyma dzieli sylaby według zasad polskiej wymowy, więc rymy mogą być niedokładne.”;
  - gdy są wyrazy do sprawdzenia (L-02): „Sprawdź wymowę: **flow** (wers 2, wyraz obcy), …” z przykładem adnotacji. Pokazujemy do 8 wyrazów, resztę jako „i N więcej”.
- **Liczby czytane automatycznie** (P-04) mają kropkowane podkreślenie. Liczby z adnotacją użytkownika nie są oznaczane.
  - **Infotip** po najechaniu albo fokusie (Tab, dotknięcie): „Czytane jako „trzysta”. Liczby czytamy automatycznie jako liczebnik główny w mianowniku. Jeśli w tekście brzmią inaczej, dodaj wymowę.” Wyświetla się nad wersem, w jego szerokości, więc nie wychodzi poza ekran.
  - **Ikona ołówka** obok liczby (etykieta „Dodaj wymowę: 300”) otwiera pod wersem pole „Jak brzmi „300” w tym wersie?” z bieżącą wymową, zasadą i przykładami („2 dziewczyny” to „dwie”) oraz **Zapisz** / **Anuluj**.
  - **Zapisz** dopisuje adnotację za liczbą w tekście wersu (P-06), wynik przelicza się od razu, bez ponownej animacji całego tekstu. Pusta, bez liter albo identyczna wymowa niczego nie zmienia.
  - **Escape** albo **Anuluj** zamyka pole, fokus wraca na ikonę.
- **Legenda** „Rymy”: dla każdej grupy kolorowe żetony z układem samogłosek (np. `o-i`), krotność słownie (pojedynczy, podwójny…) z liczbą sylab (np. `3–4 syl.`) i wystąpienia rozdzielone ` / `.
- Przyciski: **Edytuj tekst**, **Odtwórz animację**.

Analiza uruchamia się tylko przy przejściu do wyniku, nie przy każdym naciśnięciu klawisza.

## Stan

- Tekst zapisuje się w `localStorage` (`doryma.verses`) przy każdej zmianie. Brak dostępu do storage (tryb prywatny) nie blokuje aplikacji.

## Design tokens

| Token | Wartość | Użycie |
| --- | --- | --- |
| `--bg` | `#121214` | tło (grafit) |
| `--surface` | `#1c1c21` | pola, karty |
| `--surface-2` | `#2a2a31` | obramowania, infotip |
| `--text` | `#ece6da` | tekst (kremowy) |
| `--muted` | `#9a958a` | podpowiedzi, numery |
| `--accent` | `#f2c14e` | przycisk główny, logo, nadtytuły, ikona ołówka |
| `--on-accent` | `#1a1608` | tekst na akcencie |
| `--on-rhyme` | `#121214` | tekst na kolorze rymu |
| `--focus` | `#7dd3fc` | obrys fokusu |
| `--radius` | `12px` | zaokrąglenia |

Kontrast do tła: tekst 15:1, wyciszony 6,3:1 (5,7:1 na `--surface`), akcent 11:1, tekst na akcencie 10,8:1, fokus 11:1.

Kolory rymów: `palette.ts` (K-04), tekst na kolorze rymu jest ciemny (`--on-rhyme`). Kolor tła trafia też do `theme-color`, manifestu PWA i ikony.

## Dostępność

- Cele dotykowe ≥ 44 px, widoczny fokus. Wyjątek: ikona ołówka w tekście ma 28 × 28 px (kontrolka w linii tekstu, WCAG 2.5.8).
- Pola wersów mają etykiety `Wers N`, lista ma etykietę `Wersy`, legenda `Znalezione rymy`.
- `prefers-reduced-motion`: animacje skrócone do 1 ms, bez opóźnień.
- Kolor nie jest jedynym nośnikiem informacji: legenda podaje układ samogłosek i wystąpienia tekstem.

## Otwarte

- **U-01** Wersja angielska interfejsu (i18n) czy tylko polski?
- **U-02** Jasny motyw?
- **U-03** Rozróżnienie fragmentów rymu bez koloru (dla daltonistów), np. podkreślenia lub numery grup.
- ~~**U-04**~~ Rozwiązane w spec 004: infotip pokazuje się też po fokusie i dotknięciu, a pole wymowy zawiera zasadę.
- **U-05** Ikona dodawania wymowy przy wyrazach z podpowiedzi L-02 (`flow`, `2pac`) i przy liczbach z adnotacją, tak jak przy liczbach czytanych automatycznie?
- **U-06** Czy zapamiętywać tryb aplikacji w adresie (np. `#/app/wynik`), żeby odświeżenie zostawiało w wyniku?
