# Szyfrowanie wiadomości

## Konfiguracja

Wygeneruj klucz 32 bajtów:

```bash
openssl rand -hex 32
```

W `.env.local` oraz w zmiennych środowiskowych Vercela dodaj:

```text
MESSAGE_ENCRYPTION_KEY=<64 znaki w zapisie szesnastkowym>
```

Po zmianie klucza nie będzie można odszyfrować wcześniejszych wiadomości. Klucz trzeba tworzyć w kopii zapasowej i bezpiecznie przechowywać osobno od bazy danych.

## Jak działa to rozwiązanie

- Nowe wiadomości są szyfrowane algorytmem AES-256-GCM przed zapisem do Supabase.
- Dane bazy zawierają tekst z prefiksem `enc:v1:` oraz losowy IV i tag uwierzytelniający.
- Każda wiadomość używa innego losowego IV.
- Endpoint API odszyfrowuje dane przed wysłaniem ich do zalogowanego interfejsu.

To jest szyfrowanie at rest po stronie aplikacji. Nie jest to szyfrowanie end-to-end: serwer zna klucz i może odszyfrować wiadomości.

## Istniejące wiadomości

Moduł w trybie zgodności pozostawia dotychczasowe wiadomości bez prefiksu `enc:v1:` niezmienione. Nowe wiadomości są od razu szyfrowane. Istniejącą bazę można migrować pojedynczo, gdy klucz nie będzie już pusty.
