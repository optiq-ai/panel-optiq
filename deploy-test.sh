#!/bin/bash

# Skrypt testowy dla wdrożenia Panel Optiq
# Ten skrypt przeprowadza testy wdrożenia aplikacji

echo "=== Rozpoczynanie testów wdrożenia Panel Optiq ==="
echo "Sprawdzanie wymagań systemowych..."

# Sprawdzanie wersji Git
if ! command -v git &> /dev/null; then
  echo "❌ Git nie jest zainstalowany"
  exit 1
else
  git_version=$(git --version | cut -d ' ' -f3)
  echo "✅ Git w wersji $git_version"
fi

# Sprawdzanie wersji Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker nie jest zainstalowany"
  exit 1
else
  docker_version=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
  echo "✅ Docker w wersji $docker_version"
fi

# Sprawdzanie wersji Docker Compose
if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose nie jest zainstalowany"
  exit 1
else
  compose_version=$(docker-compose --version | cut -d ' ' -f3 | cut -d ',' -f1)
  echo "✅ Docker Compose w wersji $compose_version"
fi

echo "Sprawdzanie dostępności portów..."
# Sprawdzanie czy porty 80 i 3000 są dostępne
if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null ; then
  echo "❌ Port 80 jest już używany"
  exit 1
else
  echo "✅ Port 80 jest dostępny"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
  echo "❌ Port 3000 jest już używany"
  exit 1
else
  echo "✅ Port 3000 jest dostępny"
fi

echo "Sprawdzanie pliku .env..."
if [ ! -f .env ]; then
  echo "⚠️ Plik .env nie istnieje, tworzę go z .env.example"
  cp .env.example .env
else
  echo "✅ Plik .env istnieje"
fi

echo "Uruchamianie kontenerów..."
docker-compose down -v
docker-compose up -d

echo "Czekanie na uruchomienie kontenerów..."
sleep 15

echo "Sprawdzanie statusu kontenerów..."
if [ $(docker-compose ps -q | wc -l) -eq 3 ]; then
  echo "✅ Wszystkie kontenery uruchomione"
else
  echo "❌ Nie wszystkie kontenery zostały uruchomione"
  docker-compose logs
  exit 1
fi

echo "Sprawdzanie dostępności frontendu..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
  echo "✅ Frontend jest dostępny"
else
  echo "❌ Frontend nie jest dostępny"
  docker-compose logs frontend
  exit 1
fi

echo "Sprawdzanie dostępności backendu..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  echo "✅ Backend jest dostępny"
else
  echo "❌ Backend nie jest dostępny"
  docker-compose logs backend
  exit 1
fi

echo "Sprawdzanie połączenia z bazą danych..."
if docker-compose exec db pg_isready -U postgres | grep -q "accepting connections"; then
  echo "✅ Baza danych jest dostępna"
else
  echo "❌ Baza danych nie jest dostępna"
  docker-compose logs db
  exit 1
fi

echo "=== Testy zakończone pomyślnie ==="
echo "Panel Optiq jest gotowy do użycia!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:3000"
echo "Domyślne dane logowania:"
echo "  Login: admin"
echo "  Hasło: admin123"
echo "UWAGA: Pamiętaj, aby zmienić domyślne hasło po pierwszym logowaniu!"
