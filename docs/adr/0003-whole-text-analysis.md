# 0003: Analiza całego tekstu zamiast czterowersów

- Status: zastąpiona przez 0006 (wcześniej: przyjęta, zastępowała niezapisane założenie analizy w czterowersach)
- Data: 2026-10-29

## Kontekst

Pierwsza wersja szukała rymów tylko w obrębie czterowersów. Teksty rapowe nie zawsze mają taką budowę, zwrotki mają różną długość, a rymy łączą też wersy z różnych czterowersów.

## Decyzja

Rymów szukamy w całym tekście (R-02). Pusta linia oznacza podział zwrotki tylko wizualnie. Bliskość wersów premiuje ocena kandydata (−0,1 za wers odstępu, W-01), a kolor oznacza układ samogłosek w całym tekście (ADR 0004).

## Konsekwencje

- Tekst można wkleić w całości, bez formatowania w czwórki.
- Koszt analizy rośnie kwadratowo z długością tekstu (N-01).
- Kara za odległość jest liniowa i bez limitu; czy to właściwe, jest otwartym pytaniem (Q-03).
