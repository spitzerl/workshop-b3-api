#!/bin/bash

# 🧪 Script de test automatisé pour Workshop B3 API
# Usage: chmod +x test-api.sh && ./test-api.sh

set -e  # Arrêter en cas d'erreur

API_URL="http://localhost:3002"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Test de l'API Workshop B3${NC}"
echo "=================================="

# Fonction pour tester un endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Test: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$url")
        status_code="${response: -3}"
        body="${response%???}"
    else
        response=$(curl -s -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
        status_code="${response: -3}"
        body="${response%???}"
    fi
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC} (Status: $status_code)"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "$body" | jq . 2>/dev/null || echo "  Response: $body"
        fi
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "  Response: $body"
        return 1
    fi
}

# Test 1: Healthcheck
test_endpoint "Healthcheck" "GET" "$API_URL/" "" "200"

# Test 2: Création d'un utilisateur (avec timestamp pour éviter les doublons)
timestamp=$(date +%s)
test_endpoint "Création utilisateur" "POST" "$API_URL/api/users" '{
    "name": "Test User",
    "email": "test'$timestamp'@example.com",
    "passwordHash": "$2b$10$hashedpassword"
}' "201"

# Test 3: Liste des utilisateurs
test_endpoint "Liste utilisateurs" "GET" "$API_URL/api/users" "" "200"

# Test 4: Création d'une ressource
test_endpoint "Création ressource" "POST" "$API_URL/api/resources" '{
    "title": "Test Resource",
    "description": "Description du test",
    "IDowner": 1
}' "201"

# Test 5: Liste des ressources
test_endpoint "Liste ressources" "GET" "$API_URL/api/resources" "" "200"

# Test 6: Upload d'un fichier (si possible)
echo -n "Test: Upload fichier... "
if [ -f "test-file.txt" ] || echo "Test content" > test-file.txt 2>/dev/null; then
    upload_response=$(curl -s -X POST "$API_URL/api/files/upload" \
        -F "file=@test-file.txt" \
        -F "ownerId=1" 2>/dev/null || echo "")

    if echo "$upload_response" | grep -q "id"; then
        echo -e "${GREEN}✅ OK${NC}"
        echo "$upload_response" | jq . 2>/dev/null || echo "  Response: $upload_response"
        # Sauvegarder l'ID du fichier pour les tests suivants
        file_id=$(echo "$upload_response" | jq -r '.id' 2>/dev/null || echo "1")
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  Response: $upload_response"
        file_id="1"  # Fallback ID
    fi

    # Nettoyer le fichier de test
    rm -f test-file.txt
else
    echo -e "${YELLOW}⚠️ SKIPPED${NC} (Impossible de créer le fichier de test)"
    file_id="1"
fi

# Test 7: Liste des fichiers
test_endpoint "Liste fichiers" "GET" "$API_URL/api/files" "" "200"

# Test 8: Liste des fichiers publics
test_endpoint "Liste fichiers publics" "GET" "$API_URL/api/files/public" "" "200"

# Test 9: Fichiers d'un utilisateur
test_endpoint "Fichiers utilisateur 1" "GET" "$API_URL/api/files/user/1" "" "200"

# Test 10: Routes ESP8266
test_endpoint "Status API" "GET" "$API_URL/api/" "" "200"

# Test 11: Route SOS (GET)
test_endpoint "SOS ESP8266 (GET)" "GET" "$API_URL/api/sos" "" "200"

# Test 12: Status ESP8266
test_endpoint "Status ESP8266" "GET" "$API_URL/api/esp-status" "" "500"

# Test 13: Test ESP8266
test_endpoint "Test ESP8266" "GET" "$API_URL/api/test" "" "500"

# Test 14: Récupérer un utilisateur par ID
test_endpoint "Récupérer utilisateur par ID" "GET" "$API_URL/api/users/1" "" "200"

# Test 15: Récupérer une ressource par ID
test_endpoint "Récupérer ressource par ID" "GET" "$API_URL/api/resources/1" "" "200"

# Test 16: Mise à jour d'un utilisateur
test_endpoint "Mise à jour utilisateur" "PUT" "$API_URL/api/users/1" '{
    "name": "Updated User"
}' "200"

# Test 17: Mise à jour d'une ressource
test_endpoint "Mise à jour ressource" "PUT" "$API_URL/api/resources/1" '{
    "title": "Updated Resource"
}' "200"

echo ""
echo -e "${GREEN}✅ Tests terminés !${NC}"
echo ""
echo "💡 Pour des tests plus approfondis, consultez TESTING.md"
