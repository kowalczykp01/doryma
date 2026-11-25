# 0002: Deterministyczny analizator heurystyczny zamiast słownika lub modelu AI

- Status: przyjęta
- Data: 2026-10-29

## Kontekst

Rymy w rapie opierają się na samogłoskach i akcencie, a nie na słownikowej poprawności. Słownik wymowy polszczyzny nie obejmuje slangu i wyrazów obcych, a model językowy działałby wolno, kosztowałby i nie gwarantowałby powtarzalnego wyniku.

## Decyzja

Analizator to czysty kod TypeScript: reguły sylabizacji i normalizacji (S-xx), wyszukiwanie kandydatów, ocena punktowa i zachłanny wybór (W-xx). Wymowę nietypowych wyrazów podaje użytkownik adnotacją (ADR 0005). Wynik jest deterministyczny: ten sam tekst daje te same kolory.

## Konsekwencje

- Działa offline i natychmiast, testowalny przypadkami z `rhyme-spec.md`.
- Jakość zależy od strojenia wag (W-01); każda zmiana wag to zmiana specyfikacji i testów regresji.
- Zachłanny wybór nie gwarantuje globalnie najlepszego zestawu rymów; przyjmujemy to w zamian za przewidywalność i szybkość.
