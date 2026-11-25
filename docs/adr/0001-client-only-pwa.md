# 0001: Aplikacja wyłącznie po stronie klienta (PWA)

- Status: przyjęta
- Data: 2026-10-29

## Kontekst

Analiza rymów nie potrzebuje danych z zewnątrz, a teksty użytkowników często są cudzymi utworami albo niepublikowanymi szkicami. Projekt jest na etapie walidacji, bez budżetu na infrastrukturę.

## Decyzja

Cała logika działa w przeglądarce. Aplikacja jest statycznym buildem Vite z `vite-plugin-pwa` (instalacja, offline). Szkic tekstu trzymamy w `localStorage`. Brak backendu, kont i analityki z treścią tekstu.

## Konsekwencje

- Hosting za 0 zł (statyczny CDN), brak utrzymania serwera.
- Prywatność: tekst nie opuszcza urządzenia, mniejsze ryzyko prawne związane z prawami autorskimi.
- Planowana baza pokolorowanych tekstów (kierunek rozwoju w `vision.md`) będzie wymagała backendu i nowego ADR, który zastąpi ten.
- Wydajność zależy od urządzenia użytkownika (N-01).
