#!/bin/bash

set -e  # Exit on error

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

print_header "Démarrage du déploiement de l'API Resource Management..."

# Check if Docker is installed and running
print_status "Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé."
    echo "💡 Installez Docker depuis https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_error "Docker n'est pas démarré."
    echo "💡 Démarrez Docker Desktop ou le service Docker"
    exit 1
fi

# Detect Docker Compose command
COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    print_success "Docker Compose (plugin) détecté"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    print_success "Docker Compose (standalone) détecté"
else
    print_error "Docker Compose n'est pas disponible."
    echo "💡 Installez Docker Compose ou utilisez une version récente de Docker"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Création du fichier .env à partir de .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Fichier .env créé avec la configuration par défaut"
    else
        print_error "Le fichier .env.example n'existe pas"
        exit 1
    fi
else
    print_success "Fichier .env déjà présent"
fi

# Validate .env file
print_status "Validation de la configuration..."
source .env
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    print_warning "MYSQL_ROOT_PASSWORD n'est pas défini, utilisation de la valeur par défaut"
fi

# Stop existing containers if they exist
print_status "Arrêt des conteneurs existants..."
$COMPOSE_CMD down --remove-orphans

# Pull latest images (for base images like MySQL)
print_status "Mise à jour des images de base..."
$COMPOSE_CMD pull db

# Build and start services
print_status "Construction et démarrage des services..."
$COMPOSE_CMD up --build -d

# Wait for services to be ready with better feedback
print_status "Attente du démarrage des services..."
echo "Cela peut prendre quelques minutes lors du premier démarrage..."

# Wait for database to be healthy
print_status "Attente de la base de données..."
timeout=300  # 5 minutes
counter=0
while [ $counter -lt $timeout ]; do
    if $COMPOSE_CMD ps | grep -q "healthy"; then
        print_success "Base de données prête !"
        break
    fi
    printf "."
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    print_error "Timeout: La base de données n'a pas démarré dans les temps"
    print_status "Vérification des logs..."
    $COMPOSE_CMD logs db
    exit 1
fi

# Wait a bit more for API to be ready
sleep 5

# Check service status
print_status "Vérification de l'état des services..."
$COMPOSE_CMD ps

# Test API connectivity
API_PORT=${API_PORT:-3002}
print_status "Test de connectivité de l'API..."
if curl -f -s "http://localhost:$API_PORT" > /dev/null 2>&1 || nc -z localhost $API_PORT 2>/dev/null; then
    print_success "API accessible !"
else
    print_warning "L'API ne répond pas encore, vérifiez les logs si nécessaire"
fi

echo ""
print_success "Déploiement terminé !"
echo ""
echo "🌐 Accès aux services :"
echo "  📡 API : http://localhost:${API_PORT}"
echo "  🗄️  Base de données MySQL : localhost:${DB_PORT:-3308}"
echo ""
echo "📚 Commandes utiles :"
echo "  📋 Voir les logs : $COMPOSE_CMD logs -f"
echo "  📋 Logs API uniquement : $COMPOSE_CMD logs -f api"
echo "  📋 Logs DB uniquement : $COMPOSE_CMD logs -f db"
echo "  🔄 Redémarrer : $COMPOSE_CMD restart"
echo "  ⏹️  Arrêter : $COMPOSE_CMD down"
echo "  🧹 Arrêter et nettoyer : $COMPOSE_CMD down -v"
echo ""
echo "🎯 Pour tester l'API, utilisez le script : ./test-api.sh"
