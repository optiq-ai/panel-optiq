# Instrukcja wdrożenia Firmowego Dashboardu w Portainerze

## Wymagania wstępne
- Zainstalowany Docker
- Zainstalowany Portainer
- Dostęp do interfejsu Portainera

## Krok 1: Instalacja Portainera (jeśli nie jest jeszcze zainstalowany)

```bash
# Utworzenie wolumenu dla danych Portainera
docker volume create portainer_data

# Uruchomienie kontenera Portainera
docker run -d -p 9000:9000 --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data portainer/portainer-ce
```

## Krok 2: Dostęp do Portainera

Otwórz przeglądarkę i przejdź do:
```
http://localhost:9000
```

Przy pierwszym uruchomieniu zostaniesz poproszony o utworzenie konta administratora.

## Krok 3: Wdrożenie Firmowego Dashboardu jako Stack

1. W menu bocznym Portainera wybierz **Stacks**
2. Kliknij przycisk **Add stack**
3. Wypełnij formularz:
   - **Name**: firmowy-dashboard
   - **Build method**: Web editor (lub Upload)
   - Skopiuj zawartość pliku `docker-compose.yml` do edytora (lub prześlij plik)

```yaml
# Dashboard Project - Docker Configuration

version: '3'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:3000/api
    restart: unless-stopped
    networks:
      - dashboard-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=dashboard
      - JWT_SECRET=your_jwt_secret_key
      - PORT=3000
    restart: unless-stopped
    networks:
      - dashboard-network

  db:
    image: postgres:13
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=dashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - dashboard-network

networks:
  dashboard-network:
    driver: bridge

volumes:
  postgres_data:
```

4. Kliknij przycisk **Deploy the stack**

## Krok 4: Weryfikacja wdrożenia

1. Przejdź do sekcji **Containers** w menu bocznym
2. Sprawdź, czy wszystkie trzy kontenery są uruchomione:
   - firmowy-dashboard_frontend_1
   - firmowy-dashboard_backend_1
   - firmowy-dashboard_db_1

## Krok 5: Dostęp do aplikacji

- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`

Domyślne dane logowania:
- Login: admin
- Hasło: admin123

**WAŻNE**: Po pierwszym logowaniu zmień domyślne hasło administratora!

## Zarządzanie aplikacją w Portainerze

### Przeglądanie logów
1. Przejdź do sekcji **Containers**
2. Kliknij na nazwę kontenera
3. Wybierz zakładkę **Logs**

### Restart kontenerów
1. Przejdź do sekcji **Containers**
2. Zaznacz kontener(y) do restartu
3. Kliknij przycisk **Restart**

### Aktualizacja aplikacji
1. Przejdź do sekcji **Stacks**
2. Znajdź stack "firmowy-dashboard"
3. Kliknij **Edit**
4. Wprowadź zmiany w konfiguracji (jeśli potrzebne)
5. Kliknij **Update the stack**

## Rozwiązywanie problemów

### Problem z dostępem do aplikacji
- Sprawdź, czy wszystkie kontenery są uruchomione
- Sprawdź logi kontenerów w poszukiwaniu błędów
- Upewnij się, że porty 80 i 3000 nie są używane przez inne aplikacje

### Problem z bazą danych
- Sprawdź logi kontenera bazy danych
- Upewnij się, że wolumen postgres_data jest poprawnie zamontowany

### Resetowanie aplikacji
Jeśli chcesz zresetować całą aplikację:
1. Przejdź do sekcji **Stacks**
2. Znajdź stack "firmowy-dashboard"
3. Kliknij **Remove**
4. Wdróż stack ponownie
