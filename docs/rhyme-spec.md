# Specyfikacja rymów

Ten dokument definiuje, co DoRyma uznaje za rym i jak go koloruje. Jest źródłem prawdy: zmiana zachowania analizatora zaczyna się od zmiany tutaj (patrz `CLAUDE.md`). Każda reguła ma ID; testy w `src/rhyme/*.test.ts` zaczynają nazwę od ID reguły, którą sprawdzają.

Notacja w przykładach:

- `A ~ B`: fragmenty A i B się rymują,
- `⟨…⟩`: sylaby pominięte (luka), bez koloru,
- ✅ musi być rymem, ❌ nie może być rymem.

Status reguły: **obowiązuje** (zaimplementowana i przetestowana) albo **otwarte** (patrz „Otwarte pytania” na końcu).

## 1. Pojęcia

| Pojęcie | Definicja |
| --- | --- |
| Wers | Jedna linia tekstu. Pusta linia to podział zwrotki. |
| Sylaba | Fragment wyrazu z jednym jądrem samogłoskowym (S-01). |
| Samogłoska rymowa | Znormalizowana samogłoska sylaby (S-04) w klasie rymowej (R-01). |
| Koda | Spółgłoski po samogłosce w tej samej sylabie (S-06). |
| Akcent | Sylaba akcentowana wg S-05. |
| Ciąg | Kolejne sylaby jednego wersu, które biorą udział w rymie. |
| Rym | Para (lub więcej) ciągów o zgodnych samogłoskach rymowych, uznana wg sekcji 4. |
| Grupa rymowa | Wszystkie ciągi połączone ze sobą rymami; w legendzie to jeden wpis. |
| Fragment kolorowy | Część rymu o długości 1–2 sylab, która ma jeden kolor (K-01). |
| Krotność | Liczba fragmentów kolorowych rymu (R-07). |
| Luka | Sylaby wewnątrz rymu, które się nie rymują i nie dostają koloru (R-04). |

## 2. Sylaby i wymowa

**S-01 Jądro sylaby** (obowiązuje). Każda samogłoska (`a ą e ę i o ó u y`) tworzy jedną sylabę. Wyraz bez samogłoski (`w`, `z`) nie ma sylab i nie bierze udziału w rymach.
✅ `w domu z tobą` → samogłoski `o u o o`.

**S-02 Zmiękczające „i”** (obowiązuje). `i` między spółgłoską a samogłoską tylko zmiękcza spółgłoskę i należy do następnej samogłoski.
✅ `nie wiem` → `e e`; `pianino` → `a i o`.

**S-03 Podział na sylaby** (obowiązuje). Dwuznaki `ch cz dz dź dż rz sz` są jedną głoską. Spółgłoski między samogłoskami przechodzą do następnej sylaby; przy zbitce kilku spółgłosek pierwsza zamyka poprzednią sylabę, chyba że zbitka zaczyna się od syczącej (`s ś z ź ż sz`), wtedy cała otwiera następną.
✅ `klatki` → `klat-ki`; `szczęście` → `szczę-ście`; `miasto` → `mia-sto`.

**S-04 Normalizacja samogłosek** (obowiązuje). `ó` = `u`, `ą` = `o`, `ę` = `e`. Brzmią tak samo w szybkiej wymowie rapowej.
✅ `góra są tę` → `u a o e`; `swój ~ susz`.

**S-05 Akcent** (obowiązuje). W wyrazie wielosylabowym akcentowana jest przedostatnia sylaba. Wyraz jednosylabowy jest akcentowany, chyba że jest klityką (przyimki, spójniki, krótkie zaimki i partykuły, np. `i, w, za, na, do, się, mi, ci, go, nie, to, jak`; pełna lista w `syllables.ts`).

**S-06 Koda** (obowiązuje). Koda jest normalizowana: `ó` → `u`, `rz` → `ż`, `ch` → `h`. Służy do porównywania krótkich rymów (R-05).

**P-01 Adnotacja wymowy** (obowiązuje). Tekst w gwiazdkach po wyrazach opisuje, jak je słychać: `power point *pałer pojnt*`. Adnotacja zastępuje tyle poprzedzających wyrazów, ile sama zawiera. Rymy liczymy z wymowy, a wyświetlamy i kolorujemy zapis.
✅ `worek rok ~ chowaj power point *pałer pojnt*`.

**P-02 Odwzorowanie na zapis** (obowiązuje). Gdy liczba wyrazów wymowy i zapisu jest równa, sylaby mapujemy wyraz na wyraz, w przeciwnym razie proporcjonalnie na cały zakres. Kolejność sylab na ekranie jest zachowana. Gdy wymowa ma więcej sylab niż zapis znaków (`97` = „dzie-wię-ćdzie-siąt sie-dem”), część sylab nie ma własnego znaku: liczą się do rymu, ale kolorujemy tylko znaki tych, które je mają (Q-11).

**P-03 Niedomknięta gwiazdka** (obowiązuje). Pojedyncza `*` bez pary jest zwykłym tekstem.

**P-04 Liczby czytane automatycznie** (obowiązuje). Liczba stojąca osobno (nie sklejona z literami) jest czytana jak liczebnik główny w mianowniku, a na ekranie zostają cyfry. Rymy liczymy z wymowy, tak jak przy adnotacji. Cyfry z separatorem tysięcy (`1 000 000`) to jedna liczba. Liczby z zerem na początku (`007`) i dłuższe niż 12 cyfr czytamy cyfra po cyfrze. Interfejs pokazuje, jak liczba została przeczytana.
✅ `300` = „trzysta” (`znowu 300 ~ wciąż mam trzysta`); `2005` = „dwa tysiące pięć”; `22 000` = „dwadzieścia dwa tysiące”; `007` = „zero zero siedem”.

**P-05 Godziny, ułamki, procenty, złote** (obowiązuje).

| Zapis | Wymowa |
| --- | --- |
| `16:30`, `7:05`, `21:00` | „szesnasta trzydzieści”, „siódma zero pięć”, „dwudziesta pierwsza” |
| `2,5` | „dwa przecinek pięć” |
| `100%`, `100 %` | „sto procent” |
| `1 zł`, `2 zł`, `5 zł`, `12 zł`, `22 zł` | „jeden złoty”, „dwa złote”, „pięć złotych”, „dwanaście złotych”, „dwadzieścia dwa złote” |
| `2,50 zł` | „dwa złote pięćdziesiąt” |

Godzina spoza zakresu (`25:70`) jest czytana jako dwie liczby.

**P-06 Liczby a adnotacje** (obowiązuje). Adnotacja wymowy bezpośrednio po liczbie zastępuje całą liczbę, niezależnie od liczby wyrazów adnotacji. Liczby sklejone z literami (`2pac`, `S500`, `4x`) nie są czytane automatycznie; wymowę podaje użytkownik (L-02 podpowiada, gdzie).
✅ `w 2005 *dwa tysiące piątym*` (zastępuje `2005`, nie `w 2005`); `2pac *tupak*`.
Wymowę liczby czytanej automatycznie można też dodać z widoku wyniku (ikona ołówka, `ui.md`): aplikacja dopisuje wtedy adnotację bezpośrednio za liczbą w tekście wersu. Pusta wymowa, bez liter albo identyczna z automatyczną nie zmienia tekstu; gwiazdki w niej są usuwane.

## 3. Dopasowanie samogłosek

**R-01 Zgodność samogłosek** (obowiązuje). Dwie sylaby się rymują, gdy mają tę samą samogłoskę rymową. Spółgłoski nie mają znaczenia (poza kodą w R-05). Rymy niedokładne: `i` = `y`.
✅ `mojej głowie ~ twojej mowie`; `Czipsy ~ Krzysztof` (`i ~ y`).
❌ `mi ~ cho` (`i` ≠ `o`).

**R-02 Zakres: czwórki** (obowiązuje, ADR 0006). Tekst dzielimy na czwórki: kolejne 4 wersy, a pusta linia (podział zwrotki) zaczyna nową czwórkę, nawet jeśli poprzednia jest niepełna. Rymów szukamy:

- między wersami jednej czwórki i wewnątrz jednego wersu (ciągi nie mogą na siebie nachodzić),
- na styku czwórek: między ostatnim wersem czwórki a pierwszym wersem następnej (także przez pustą linię).

Wersy z różnych, niesąsiadujących czwórek się nie rymują, nawet przy zgodnych samogłoskach. Kolor nadal oznacza układ samogłosek w całym tekście (K-02), więc ten sam rym w kolejnej czwórce ma ten sam kolor. Rym może kończyć jeden wers i zaczynać następny.
✅ `ekipa ~ Wezwij nas` (koniec wersu ~ początek następnego).
✅ `w mojej głowie` (4. wers) ~ `w twojej mowie` (pierwszy wers po pustej linii).
❌ wers 1 ~ wers 5 (różne czwórki, nie sąsiadują).

**R-03 Granice wyrazów** (obowiązuje). Rym kończy się na ostatniej sylabie wyrazu po obu stronach. Wyjątek: ciąg może kończyć się wewnątrz wyrazu lub obejmować koniec jednego i początek drugiego wyrazu, jeśli druga strona to cały wyraz o co najmniej 2 sylabach.
✅ `dzwo(nili) ~ worki`; `(Ni)li wy ~ Niby`.

**R-04 Luka w rymie końcowym** (obowiązuje). Rym, którego oba ciągi kończą swoje wersy, może zawierać jedną lukę, ale dopiero po co najmniej 2 dopasowanych sylabach (licząc od końca). Dopuszczalne luki:

- jedna niepasująca sylaba po obu stronach,
- jedna lub dwie dodatkowe sylaby po jednej stronie.

Po luce rym musi wrócić na sylabę akcentowaną: po luce jednosylabowej co najmniej po jednej stronie, po luce dwusylabowej po obu. Spośród możliwych luk wygrywa ta, która daje dłuższy rym, potem ta z większą liczbą par akcentowanych sylab.
✅ `Czipsy kranczips ~ Krzy⟨sztof⟩ Krawczyk` (rym podwójny, 3 sylaby).
✅ `worek rok ~ cho⟨waj pa⟩łer pojnt`.
❌ `za` ~ `pa` jako wznowienie po luce (obie sylaby nieakcentowane); `mi` ~ `cho` (różne samogłoski).

**R-05 Rym w środku wersu musi trzymać rytm** (obowiązuje). W polszczyźnie przypadkowe zgodności samogłosek są wszędzie, także na 3–4 sylabach. Na końcach i początkach wersów rym jest wyraźny sam z siebie; w środku wersu musi się zgadzać także rytm, czyli akcenty (S-05):

| Położenie | Warunek uznania |
| --- | --- |
| oba ciągi kończą wers | ≥ 2 sylaby; 1 sylaba, gdy ta sama koda |
| oba ciągi zaczynają wers (różne wersy) | ≥ 2 sylaby (✅ `Nadal ~ Za dwa`) |
| jeden kończy wers, drugi zaczyna następny | ≥ 2 sylaby (✅ `ekipa ~ Wezwij nas`) |
| gdzie indziej | ≥ 2 sylaby, **co najmniej jedna para akcentowanych sylab na tej samej pozycji i żadnej pozycji akcentowanej tylko po jednej stronie**; przy 2 sylabach dodatkowo ta sama koda ostatniej sylaby i brak znaku interpunkcyjnego w żadnym z ciągów |

✅ `mojej głowie ~ twojej mowie`, `ciel w kredki Ci ~ cie biednym i`, `ziomki ~ wrotki`, `mamy ~ a my` (akcenty na tych samych miejscach).
❌ `a znasz moje ~ kajdan z logiem` (`znasz` i `kaj` akcentowane tylko po jednej stronie), `jest, że ~ siebie` (przecinek), `się nie ~ …` (brak akcentu), `mi ~ cho`.
❌ `Niby ~ li wy`: `Ni` akcentowane, `li` nie; zamiast tego `Niby ~ (dzwo)nili`. Zmiana względem wcześniejszego przykładu, Q-13.

**R-06 Powtórzenie to nie rym** (obowiązuje). Ciągi o identycznym tekście (bez względu na wielkość liter) nie rymują się ze sobą.
❌ `robię to dla siebie ~ robię to dla siebie`.

**R-07 Krotność** (obowiązuje). Krotność rymu to liczba jego fragmentów kolorowych (K-01). Dla rymu bez podziału wyrazów odpowiada to regule: 1–2 sylaby = pojedynczy, 3–4 = podwójny, 5–6 = potrójny itd. (`⌈sylaby / 2⌉`). Długość rymu nie ma praktycznego limitu (bezpiecznik: 40 sylab).
✅ `flow co te brawa tu rwie… ~ fonope stawia tu grę…` (rym przez cały wers).

**R-08 Adlib w nawiasie na końcu wersu** (obowiązuje). Tekst w nawiasie na końcu wersu to zwykle adlib (dodatek w tle) albo wtrącenie. Koniec wersu to wtedy ostatnia sylaba przed nawiasem: liczy się dla rymów końcowych (R-04, R-05, W-01). Adlib nadal może się rymować, ale jak tekst w środku wersu. Gdy cały wers jest w nawiasie, koniec wersu to jego ostatnia sylaba.
✅ `że kochasz? (Wiem czemu)` ~ `nie kupiła flota`: `kochasz ~ flota` to rym końcowy.
✅ `no kto ~ no co` (echo w adlibach).

## 4. Wybór rymów

Analizator znajduje wszystkich kandydatów, ocenia ich i przyjmuje zachłannie od najlepszego. Każda sylaba należy do co najwyżej jednego rymu.

**W-01 Ocena kandydata** (obowiązuje). Wynik = liczba sylab plus premie, minus kary:

| Czynnik | Wartość |
| --- | --- |
| ciąg kończy wers | +0,75 za każdą stronę |
| ta sama koda ostatniej sylaby | +0,5 |
| oba ciągi zaczynają wers | +1,5 |
| oba ciągi zaczynają się na początku wyrazu | +0,5 |
| rym z luką (R-04) | −0,75 |
| ciąg wewnątrz wyrazu (R-03) | −0,25 |
| oba ciągi w jednym wersie | −0,5 |
| różne wersy: podobne miejsce w wersie | do +0,75 (W-02) |
| różne wersy: odległość | −0,1 za każdy wers odstępu (w obrębie czwórki i jej styku, R-02) |

Wartości są strojone na przykładach z testów. Zmiana wartości to zmiana tej specyfikacji.

**W-02 Odpowiadające sobie miejsca** (obowiązuje). Rym między wersami, w podobnym miejscu wersu, wygrywa z rymem wewnątrz jednego wersu, nawet jeśli ten drugi jest dłuższy.
✅ `się piekli ~ cie biednym` zamiast `Nic mnie ~ bycie`.

**W-03 Przycinanie i dołączanie** (obowiązuje). Jeśli kandydat koliduje z przyjętym już rymem, skracamy go od początku, aż się zmieści. Krótszy ciąg, który w całości zawiera się w przyjętym rymie, dołącza do jego grupy.
✅ `się w Polsce ~ (nieistnie)jące` jako część rymu `nieistniejące ~ cztery miesiące ~ widzę, słońce`.

**W-04 Grupy się nie scalają** (obowiązuje). Dwie już utworzone grupy nigdy nie są łączone, nawet jeśli nowy kandydat łączy ich ciągi. Inaczej różne samogłoski trafiałyby do jednej grupy.
❌ `parę ~ mamy` w jednej grupie.

## 5. Kolorowanie

**K-01 Fragmenty kolorowe** (obowiązuje). Rym dzielimy na fragmenty po 1–2 sylaby tak, aby w żadnym wystąpieniu nie przecinać wyrazów; przy równej liczbie przecięć wygrywa podział na mniej fragmentów, a potem pary od początku rymu. Dwa krótkie wyrazy mogą tworzyć jeden fragment.
✅ `ziomki | mamy | swój` (nie `ziom | ki ma | my swój`); `a my ~ mamy`; `flow co ~ fono`; `kole|gom`.

**K-02 Kolor = układ samogłosek** (obowiązuje). Kolor fragmentu wynika z jego samogłosek rymowych i jest wspólny dla całego tekstu: ten sam układ ma ten sam kolor w każdej grupie, różne układy nigdy nie mają tego samego koloru.
✅ `worki`, `ziomki`, `plotki`, `wrotki`, `dzwoni` mają jeden kolor (`o-i`); `stów` = `swój` (`u`).
❌ `parę` (`a-e`) w kolorze `mamy` (`a-i`).

**K-03 Luki i odstępy** (obowiązuje). Sylaby w luce nie mają koloru. Sąsiednie sylaby jednego fragmentu kolorujemy razem z odstępem między nimi; fragmenty po obu stronach luki mają kolor odpowiadających im pozycji.
✅ `cho⟨waj pa⟩łer` w kolorze `worek`.

**K-05 Fragment w całości** (obowiązuje). Fragment kolorowy (K-01) jest jednostką rymu: wystąpienie koloruje fragment tylko wtedy, gdy pokrywa wszystkie jego sylaby. Gdy wystąpienie sięga tylko do połowy fragmentu (jedna sylaba z dwóch), te sylaby są odcinane; reszta wystąpienia zostaje w rymie. Wystąpienie, z którego nic nie zostaje, wypada z grupy, a grupa z mniej niż dwoma wystąpieniami znika. Po odcięciu podział na fragmenty liczymy od nowa.
✅ `zimne poty ~ groszy ~ mi się oczy`: „groszy” rymuje się z „poty / oczy”.
❌ `(pa)rę groszy` w tym rymie: „rę” pokrywa tylko „-ne” z fragmentu `zim-ne` (`i-e`), bo „pa” ≠ „zim”.
❌ samotne „dzi” z „urodziłem” w zwrotce „się w Polsce”.

**K-04 Paleta** (obowiązuje). Pierwsze 16 układów samogłosek dostaje ręcznie dobrane kolory czytelne z ciemnym tekstem, kolejne kolory generujemy (odcienie co złoty kąt).

## 6. Język tekstu

Sprawdzenia języka nigdy nie blokują analizy. Mają tylko wyjaśnić, dlaczego wynik może być niedokładny.

**L-01 Czy tekst jest po polsku** (obowiązuje). Liczymy wyrazy (ciągi liter). Tekst jest uznany za polski, gdy co najmniej 12% wyrazów to częste polskie słowa (`nie, się, że, jest, jak, mam, ty, co, w, z, na…`, także bez polskich znaków: `sie, ze, juz`) **lub** co najmniej 10% wyrazów zawiera polską literę (`ą ć ę ł ń ś ź ż`). Tekst krótszy niż 8 wyrazów nie dostaje oceny. Gdy tekst nie jest uznany za polski, interfejs pokazuje ostrzeżenie.
✅ polski: przykładowe teksty z testów, także pisane bez polskich znaków (`nie wiem co mam robic ze soba`).
❌ polski: `I got the money in my pocket…`, `Ich bin auf der Straße…`.

**L-02 Podpowiedzi wymowy** (obowiązuje). Interfejs wymienia (każdy wyraz raz, w kolejności wystąpienia) wyrazy, które prawdopodobnie brzmią inaczej, niż sugeruje polska pisownia, i nie mają jeszcze wymowy (adnotacji ani automatycznego czytania liczby):

| Powód | Warunek | Przykład |
| --- | --- | --- |
| cyfry z literami | cyfry sklejone z literami | `2pac`, `S500` |
| wyraz obcy | litera spoza polskiego alfabetu (`ü`, `é`, `ñ`…) albo, przy braku polskich liter, pisownia obca dla polszczyzny: `q v x`, `th sh ee oo ea ph`, `-ow` na końcu, `y` na początku lub przed samogłoską | `flow`, `the`, `für`, `yeah` |
| bez samogłoski | wyraz z co najmniej 2 liter bez samogłoski (nie da się go zrymować) | `DJ`, `MC`, `PKP` |

❌ podpowiedź: zwykłe polskie wyrazy (`dziecko`, `label` wygląda po polsku i nie jest zgłaszany).

## 7. Otwarte pytania

Zachowania obecne w kodzie, których nikt świadomie nie zdecydował. Do rozstrzygnięcia przed kolejnymi zmianami analizatora.

- **Q-01 Gęstość rymów wewnątrz wyrazów.** Częściowo rozwiązane przez R-02 (czwórki) i R-05 (rytm). Zostają trafienia z akcentami w parze, np. `dał Ci ~ znamy`. Czy potrzebny jest kolejny próg?
- **Q-02 „łem ~ czte”.** W zwrotce „urodziłem się w Polsce” sylaba `łem` nie jest kolorowana, choć użytkownik wskazał `łem ~ czte`. Po K-05 nie jest też kolorowane wcześniejsze zastępcze „dzi”. Czy wrócić do `łem ~ czte`?
- ~~**Q-03 Kara za odległość.**~~ Rozwiązane przez R-02: rymy tylko w czwórce i na jej styku (ADR 0006).
- **Q-04 Jedna luka.** Rym może mieć tylko jedną lukę i tylko na końcu wersu. Czy dopuścić luki w rymach wewnętrznych?
- **Q-05 Słownik wymowy.** Podpowiedzi (L-02) wskazują wyrazy obce, ale wymowę wciąż wpisuje użytkownik. Czy dodać słownik najczęstszych wyrazów w rapie (`flow`, `label`, `2pac`, `50 Cent`, `WWA`, `DJ`, `MC`), z wymową stosowaną automatycznie jak przy liczbach?
- **Q-06 Lista klityk.** Lista z S-05 jest ręczna i niepełna. Czy rozszerzyć?
- **Q-07 Powtórzenia.** R-06 odrzuca tylko identyczny tekst; `robię` ~ `robią` to już rym. Czy odrzucać też ten sam rdzeń?
- **Q-08 Paleta powyżej 16 kolorów.** Generowane kolory są do siebie podobne. Czy ograniczyć liczbę kolorów (np. łączyć rzadkie układy) albo dodać wzory/obramowania?
- **Q-09 Forma liczebnika z kontekstu.** P-04 czyta zawsze mianownik („dwa”), a końcówka decyduje o rymie: `2 dziewczyny` to „dwie”, `w 2005` to „dwa tysiące piątym”, `rocznik 97` bywa „dziewięćdziesiąty siódmy”. Czy zgadywać formę z sąsiednich wyrazów (przyimek, rzeczownik)?
- **Q-10 Inne zapisy liczb.** Nie obsługujemy liczebników porządkowych z kropką (`3.`), liczb rzymskich, zakresów (`5-10`), walut innych niż złoty ani zapisu `k` (`10k`). Które z nich są częste w tekstach?
- **Q-11 Częściowe kolorowanie liczb.** Gdy liczba ma mniej cyfr niż sylab w wymowie, kolor obejmuje tylko część cyfr (`9`**`7`**). Czy kolorować całą liczbę, gdy rym obejmuje jej ostatnią sylabę?
- **Q-14 Długie luki.** `że kochasz ~ nie (kupiła) flota` to rym podwójny tylko przy pominięciu 3 sylab po jednej stronie. R-04 dopuszcza najwyżej 2. Czy dopuścić dłuższe luki (z ryzykiem przypadkowych dopasowań)?
- **Q-15 Adliby w nawiasie w środku wersu.** R-08 obsługuje tylko nawias na końcu wersu. Czy adliby w środku wersu (np. `(yeah)`) pomijać przy dopasowaniu, a w wyniku pokazywać wyciszone?
- **Q-13 Przykłady utracone przez R-05.** `Niby ~ li wy` (wcześniej wskazany jako lepszy niż `Niby ~ nili`) i `międzyczasie` w zwrotce „robię szoł” nie spełniają reguły rytmu. Czy to akceptowalne, czy potrzebny wyjątek (np. dla rymu z całym wyrazem w sąsiednim wersie)?
- **Q-12 Progi L-01 i heurystyka L-02.** Progi są dobrane na kilku tekstach. Tekst pisany bez polskich znaków może dawać fałszywe podpowiedzi (`slow` zamiast `słów` wygląda jak angielskie). Do sprawdzenia na korpusie (spec 001).
