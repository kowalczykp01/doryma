# 0006: Analiza w czwórkach i rytm rymów wewnętrznych

- Status: przyjęta (zastępuje 0003)
- Data: 2026-10-29

## Kontekst

Po ADR 0003 rymów szukaliśmy w całym tekście. Na prawdziwym tekście (24 wersy, rymowany głównie na końcach wersów) wynik był pełen przypadkowych rymów: sylaby z 1. wersu łączyły się z sylabami z kilkunastego, a krótkie zgodności samogłosek w środku wersów (`się nie ~ jest, że`, `a znasz moje ~ kajdan z logiem`) tworzyły grupy. Kara za odległość (−0,1 za wers) nie wystarczała, bo przy braku lepszych kandydatów i tak wygrywały odległe trafienia.

## Decyzja

1. Rymów szukamy w czwórkach (4 wersy, pusta linia zaczyna nową) oraz na styku sąsiednich czwórek: ostatni wers ~ pierwszy wers następnej (R-02).
2. Kolor zostaje wspólny dla całego tekstu (ADR 0004): ten sam układ samogłosek w kolejnej czwórce ma ten sam kolor.
3. Rym w środku wersu musi trzymać rytm: co najmniej jedna para akcentów na tej samej pozycji i żadnej pozycji akcentowanej tylko po jednej stronie (R-05). Rymy na końcach i początkach wersów i rym „koniec wersu ~ początek następnego” zostają bez zmian.

## Konsekwencje

- Mniej przypadkowych rymów: w testowym tekście znikają łańcuchy z sylab funkcyjnych i rymy między odległymi wersami.
- Analiza jest szybsza: liczba par wersów rośnie liniowo z długością tekstu, a nie kwadratowo.
- Rymy przeplatane dalej niż przez styk czwórek (np. refren powtarzany po 8 wersach) nie są łączone; mają tylko ten sam kolor, jeśli rymują się w swoich czwórkach.
- Teksty o innej budowie (zwrotki po 3 lub 6 wersów) dzielimy mechanicznie po 4, chyba że autor oddzieli je pustą linią.
- Dwa wcześniejsze przykłady przestają być rymami (`Niby ~ li wy`, `międzyczasie`), Q-13.
