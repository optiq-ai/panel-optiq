#!/bin/bash

# Skrypt testowy dla poprawki konfiguracji Nginx
# Ten skrypt testuje, czy poprawka rozwiązuje problem z montowaniem pliku nginx.conf

echo "=== Rozpoczynanie testów poprawki konfiguracji Nginx ==="

# Zatrzymanie istniejących kontenerów
echo "Zatrzymywanie istniejących kontenerów..."
docker-compose down

# Budowanie i uruchamianie kontenerów
echo "Budowanie i uruchamianie kontenerów..."
docker-compose up -d --build

# Czekanie na uruchomienie kontenerów
echo "Czekanie na uruchomienie kontenerów..."
sleep 10

# Sprawdzanie statusu kontenera frontend
echo "Sprawdzanie statusu kontenera frontend..."
if [ "$(docker-compose ps -q frontend)" ] && [ "$(docker inspect -f {{.State.Running}} $(docker-compose ps -q frontend))" = "true" ]; then
  echo "✅ Kontener frontend jest uruchomiony"
else
  echo "❌ Kontener frontend nie jest uruchomiony"
  docker-compose logs frontend
  exit 1
fi

# Sprawdzanie, czy plik konfiguracyjny Nginx został poprawnie zamontowany
echo "Sprawdzanie, czy plik konfiguracyjny Nginx został poprawnie zamontowany..."
if docker-compose exec frontend ls -la /etc/nginx/conf.d/default.conf > /dev/null 2>&1; then
  echo "✅ Plik konfiguracyjny Nginx został poprawnie zamontowany"
else
  echo "❌ Plik konfiguracyjny Nginx nie został poprawnie zamontowany"
  docker-compose exec frontend ls -la /etc/nginx/conf.d/
  exit 1
fi

# Sprawdzanie, czy Nginx działa poprawnie
echo "Sprawdzanie, czy Nginx działa poprawnie..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
  echo "✅ Nginx działa poprawnie"
else
  echo "❌ Nginx nie działa poprawnie"
  docker-compose logs frontend
  exit 1
fi

echo "=== Testy zakończone pomyślnie ==="
echo "Poprawka konfiguracji Nginx działa prawidłowo!"
echo "Możesz teraz wdrożyć zmiany w Portainerze."
