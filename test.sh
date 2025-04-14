#!/bin/bash

# Skrypt testowy dla Firmowego Dashboardu
# Ten skrypt przeprowadza podstawowe testy funkcjonalności aplikacji

echo "=== Rozpoczynanie testów Firmowego Dashboardu ==="
echo "Sprawdzanie wymagań systemowych..."

# Sprawdzanie wersji Docker
docker_version=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
echo "Wersja Docker: $docker_version"
if [[ $(echo "$docker_version >= 20.10" | bc -l) -eq 1 ]]; then
  echo "✅ Docker w odpowiedniej wersji"
else
  echo "❌ Docker wymaga wersji 20.10 lub nowszej"
  exit 1
fi

# Sprawdzanie wersji Docker Compose
compose_version=$(docker-compose --version | cut -d ' ' -f3 | cut -d ',' -f1)
echo "Wersja Docker Compose: $compose_version"
if [[ $(echo "$compose_version >= 2.0" | bc -l) -eq 1 ]]; then
  echo "✅ Docker Compose w odpowiedniej wersji"
else
  echo "❌ Docker Compose wymaga wersji 2.0 lub nowszej"
  exit 1
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

echo "Uruchamianie kontenerów..."
docker-compose down -v
docker-compose up -d

echo "Czekanie na uruchomienie kontenerów..."
sleep 10

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
echo "Firmowy Dashboard jest gotowy do użycia!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:3000"
echo "Domyślne dane logowania:"
echo "  Login: admin"
echo "  Hasło: admin123"
echo "UWAGA: Pamiętaj, aby zmienić domyślne hasło po pierwszym logowaniu!"
