# 0005: Wymowa podawana adnotacją w tekście

- Status: przyjęta
- Data: 2026-10-29

## Kontekst

Rap używa wyrazów obcych i zapożyczeń (`power point`, `flow`, `label`), których polska sylabizacja nie odczyta poprawnie. Słownik wymowy byłby niepełny i duży (ADR 0002).

## Decyzja

Użytkownik podaje wymowę w gwiazdkach po wyrazach: `power point *pałer pojnt*` (P-01…P-03). Adnotacja zastępuje tyle poprzedzających wyrazów, ile sama zawiera; analiza liczy z wymowy, a ekran pokazuje zapis.

## Konsekwencje

- Zero zależności, pełna kontrola po stronie użytkownika.
- Wymaga wiedzy o składni; podpowiadanie adnotacji to otwarte pytanie (Q-05).
- Gwiazdka nie może być używana w tekście jako zwykły znak w parze.
