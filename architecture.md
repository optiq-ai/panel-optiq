# Architektura Firmowego Dashboardu

## Przegląd architektury

Aplikacja będzie zbudowana w oparciu o architekturę klient-serwer, z wykorzystaniem następujących technologii:
- **Frontend**: React.js
- **Backend**: Node.js z Express.js
- **Baza danych**: PostgreSQL

### Architektura wysokiego poziomu

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Node.js API    │────▶│  PostgreSQL DB  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Struktura bazy danych

### Tabele

1. **users**
   - id (PK)
   - username
   - password_hash
   - email
   - first_name
   - last_name
   - created_at
   - updated_at

2. **groups**
   - id (PK)
   - name (prezes, dyspozytorki, instalatorzy, kadry)
   - description
   - created_at
   - updated_at

3. **user_groups**
   - id (PK)
   - user_id (FK)
   - group_id (FK)
   - created_at
   - updated_at

4. **panels**
   - id (PK)
   - name
   - description
   - icon
   - url
   - is_active
   - created_at
   - updated_at

5. **group_panels**
   - id (PK)
   - group_id (FK)
   - panel_id (FK)
   - created_at
   - updated_at

6. **panel_settings**
   - id (PK)
   - panel_id (FK)
   - settings_json
   - created_at
   - updated_at

7. **user_settings**
   - id (PK)
   - user_id (FK)
   - settings_json
   - created_at
   - updated_at

8. **application_status**
   - id (PK)
   - application_name
   - status
   - last_check
   - created_at
   - updated_at

## System uwierzytelniania i autoryzacji

System uwierzytelniania będzie oparty na tokenach JWT (JSON Web Tokens):

1. **Logowanie**:
   - Użytkownik wprowadza dane logowania
   - Serwer weryfikuje dane i generuje token JWT
   - Token jest przechowywany po stronie klienta (localStorage)
   - Token zawiera informacje o użytkowniku i jego grupach

2. **Autoryzacja**:
   - Każde żądanie do API zawiera token JWT w nagłówku
   - Serwer weryfikuje token i sprawdza uprawnienia
   - Dostęp do zasobów jest kontrolowany na podstawie grup użytkownika

3. **Odświeżanie tokenu**:
   - Implementacja mechanizmu odświeżania tokenu dla dłuższych sesji

## Architektura frontendu

Frontend będzie zbudowany w oparciu o React z wykorzystaniem:
- Redux do zarządzania stanem aplikacji
- React Router do nawigacji
- Styled Components do stylizacji
- Axios do komunikacji z API

### Struktura komponentów

```
App
├── AuthProvider
│   ├── LoginPage
│   └── RegisterPage
├── Dashboard
│   ├── Sidebar
│   │   └── Navigation
│   ├── Header
│   │   ├── UserMenu
│   │   └── Notifications
│   └── Content
│       ├── PanelGrid
│       │   └── PanelItem
│       └── PanelView
└── AdminPanel
    ├── UserManagement
    ├── GroupManagement
    ├── PanelManagement
    └── ApplicationStatus
```

## Architektura backendu

Backend będzie zbudowany w oparciu o Node.js i Express.js:

### Struktura API

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   └── POST /refresh-token
├── /users
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── /groups
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── /panels
│   ├── GET /
│   ├── GET /:id
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── /user-groups
│   ├── GET /user/:userId
│   ├── POST /
│   └── DELETE /:id
├── /group-panels
│   ├── GET /group/:groupId
│   ├── POST /
│   └── DELETE /:id
└── /application-status
    ├── GET /
    └── GET /:id
```

## System zarządzania panelami

System zarządzania panelami umożliwi administratorom:

1. **Dodawanie nowych paneli**:
   - Podanie nazwy, opisu i URL aplikacji
   - Wybór ikony/grafiki dla kafelka
   - Określenie grup, które mają dostęp do panelu

2. **Edycja istniejących paneli**:
   - Zmiana nazwy, opisu, URL
   - Zmiana ikony/grafiki
   - Zmiana przypisania do grup

3. **Usuwanie paneli**:
   - Możliwość dezaktywacji panelu bez usuwania
   - Całkowite usunięcie panelu

4. **Zarządzanie dostępem**:
   - Przypisywanie paneli do grup użytkowników
   - Definiowanie uprawnień dla poszczególnych grup

## Architektura Dockerowa

Aplikacja będzie uruchamiana w kontenerach Docker:

1. **Frontend container**:
   - Nginx + zbudowana aplikacja React

2. **Backend container**:
   - Node.js + Express.js API

3. **Database container**:
   - PostgreSQL

4. **Docker Compose**:
   - Konfiguracja sieci
   - Zarządzanie wolumenami
   - Zmienne środowiskowe

```yaml
# Przykładowa struktura docker-compose.yml
version: '3'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=password
      - DB_NAME=dashboard
  
  db:
    image: postgres:13
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Interfejs użytkownika

Interfejs użytkownika będzie inspirowany dostarczonymi zrzutami ekranu, z uwzględnieniem:

1. **Kolorystyka**:
   - Główny kolor: niebieski (#3f51b5)
   - Akcenty: biały, jasny szary
   - Kolory statusów: zielony (sukces), czerwony (błąd), żółty (ostrzeżenie)

2. **Układ**:
   - Lewy pasek boczny z nawigacją
   - Górny pasek z informacjami o użytkowniku i powiadomieniami
   - Główny obszar z kafelkami paneli
   - Responsywny design dostosowany do różnych urządzeń

3. **Komponenty**:
   - Kafelki z ikonami i nazwami paneli
   - Formularze z walidacją
   - Tabele z sortowaniem i filtrowaniem
   - Wykresy i wizualizacje danych
   - Modalne okna dialogowe

## Bezpieczeństwo

1. **Uwierzytelnianie**:
   - Bezpieczne przechowywanie haseł (bcrypt)
   - Tokeny JWT z krótkim czasem ważności
   - Mechanizm odświeżania tokenów

2. **Autoryzacja**:
   - Kontrola dostępu oparta na rolach (RBAC)
   - Walidacja uprawnień na poziomie API

3. **Ochrona danych**:
   - Szyfrowanie połączenia (HTTPS)
   - Sanityzacja danych wejściowych
   - Ochrona przed atakami XSS i CSRF

4. **Audyt**:
   - Logowanie ważnych operacji
   - Śledzenie zmian w systemie
