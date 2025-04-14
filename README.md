# Instrukcja wdrożenia Firmowego Dashboardu

## Spis treści
1. [Wprowadzenie](#wprowadzenie)
2. [Wymagania systemowe](#wymagania-systemowe)
3. [Instalacja za pomocą Git i Docker Compose](#instalacja-za-pomocą-git-i-docker-compose)
4. [Instalacja za pomocą Portainera](#instalacja-za-pomocą-portainera)
5. [Konfiguracja środowiska](#konfiguracja-środowiska)
6. [Pierwsze logowanie](#pierwsze-logowanie)
7. [Rozwiązywanie problemów](#rozwiązywanie-problemów)

## Wprowadzenie

Firmowy Dashboard to kompleksowe rozwiązanie do zarządzania różnymi aspektami działalności firmy poprzez system kafelków (paneli), które można konfigurować i przydzielać różnym grupom użytkowników. System został zaprojektowany z myślą o ergonomii, łatwości obsługi i skalowalności.

## Wymagania systemowe

Do uruchomienia aplikacji potrzebne są:
- Git
- Docker Engine (wersja 20.10 lub nowsza)
- Docker Compose (wersja 2.0 lub nowsza)
- Minimum 2GB RAM dla kontenerów
- 10GB wolnego miejsca na dysku
- Dostęp do portów 80 (frontend) i 3000 (backend)

## Instalacja za pomocą Git i Docker Compose

### Krok 1: Klonowanie repozytorium
```bash
git clone https://github.com/optiq-ai/panel-optiq.git
cd panel-optiq
```

### Krok 2: Wybór gałęzi
```bash
# Dla wersji produkcyjnej
git checkout main

# Dla wersji testowej
git checkout test
```

### Krok 3: Konfiguracja zmiennych środowiskowych
```bash
cp .env.example .env
```

Otwórz plik `.env` w edytorze tekstu i dostosuj zmienne środowiskowe według potrzeb, szczególnie:
- `DB_PASSWORD` - hasło do bazy danych
- `JWT_SECRET` - klucz do podpisywania tokenów JWT
- `ADMIN_PASSWORD` - hasło dla konta administratora

### Krok 4: Uruchomienie aplikacji
```bash
docker-compose up -d
```

System zostanie uruchomiony w tle. Frontend będzie dostępny pod adresem `http://localhost`, a backend pod adresem `http://localhost:3000`.

## Instalacja za pomocą Portainera

### Krok 1: Upewnij się, że masz zainstalowany i uruchomiony Portainer
Jeśli jeszcze nie masz Portainera, możesz go zainstalować za pomocą:
```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data portainer/portainer-ce
```

### Krok 2: Klonowanie repozytorium
```bash
git clone https://github.com/optiq-ai/panel-optiq.git
cd panel-optiq
```

### Krok 3: Konfiguracja zmiennych środowiskowych
```bash
cp .env.example .env
```

Dostosuj zmienne w pliku `.env` według potrzeb.

### Krok 4: Wdrożenie przez Portainer
1. Zaloguj się do Portainera (zazwyczaj dostępny pod adresem http://localhost:9000)
2. W menu bocznym wybierz "Stacks"
3. Kliknij "Add stack"
4. Nadaj nazwę stackowi, np. "panel-optiq"
5. W sekcji "Build method" wybierz "Upload" i prześlij plik docker-compose.yml z projektu
6. W sekcji "Environment variables" zaznacz opcję "Load variables from .env file" i wskaż plik .env
7. Kliknij "Deploy the stack"

## Konfiguracja środowiska

Wszystkie zmienne konfiguracyjne znajdują się w pliku `.env`. Najważniejsze z nich to:

| Zmienna | Opis | Domyślna wartość |
|---------|------|-----------------|
| DB_PASSWORD | Hasło do bazy danych | postgres |
| JWT_SECRET | Klucz do podpisywania tokenów JWT | your_jwt_secret_key |
| FRONTEND_PORT | Port dla frontendu | 80 |
| BACKEND_PORT | Port dla backendu | 3000 |
| ADMIN_USERNAME | Nazwa użytkownika administratora | admin |
| ADMIN_PASSWORD | Hasło administratora | admin123 |

## Pierwsze logowanie

Domyślne konto administratora:
- Login: wartość zmiennej `ADMIN_USERNAME` (domyślnie: admin)
- Hasło: wartość zmiennej `ADMIN_PASSWORD` (domyślnie: admin123)

**WAŻNE**: Po pierwszym logowaniu należy zmienić hasło administratora!

## Rozwiązywanie problemów

### Problem z dostępem do aplikacji
- Sprawdź, czy wszystkie kontenery są uruchomione: `docker-compose ps`
- Sprawdź logi kontenerów: `docker-compose logs`
- Upewnij się, że porty 80 i 3000 nie są używane przez inne aplikacje

### Problem z bazą danych
- Sprawdź logi kontenera bazy danych: `docker-compose logs db`
- Upewnij się, że wolumen postgres_data jest poprawnie zamontowany

### Resetowanie aplikacji
Jeśli chcesz zresetować całą aplikację:
```bash
docker-compose down -v
docker-compose up -d
```

### Aktualizacja do najnowszej wersji
```bash
git pull
docker-compose down
docker-compose up -d --build
```
