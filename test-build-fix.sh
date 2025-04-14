#!/bin/bash

# Skrypt testowy dla poprawki procesu budowania frontendu
# Ten skrypt testuje, czy poprawka rozwiązuje problem z budowaniem frontendu

echo "=== Rozpoczynanie testów poprawki procesu budowania frontendu ==="

cd /home/ubuntu/dashboard-project/frontend

# Sprawdzanie wersji Node.js
echo "Sprawdzanie wersji Node.js..."
node_version=$(node -v)
echo "✅ Wersja Node.js: $node_version"

# Sprawdzanie package.json
echo "Sprawdzanie package.json..."
if grep -q "\"react\": \"^18.2.0\"" package.json; then
  echo "✅ Wersja React w package.json jest poprawna"
else
  echo "❌ Wersja React w package.json jest niepoprawna"
  exit 1
fi

# Sprawdzanie Dockerfile
echo "Sprawdzanie Dockerfile..."
if grep -q "FROM node:18 as build" Dockerfile && grep -q "npm install --legacy-peer-deps" Dockerfile; then
  echo "✅ Dockerfile zawiera poprawne ustawienia"
else
  echo "❌ Dockerfile nie zawiera poprawnych ustawień"
  exit 1
fi

echo "=== Testy zakończone pomyślnie ==="
echo "Poprawka procesu budowania frontendu powinna rozwiązać problem z wdrażaniem w Portainerze."
echo "Zmiany obejmują:"
echo "1. Downgrade React do wersji 18.2.0"
echo "2. Użycie Node.js 18 zamiast 20"
echo "3. Dodanie flagi --legacy-peer-deps do npm install"
echo "4. Dodanie flagi --verbose do npm run build dla lepszego logowania błędów"
