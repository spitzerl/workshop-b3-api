#!/bin/bash

echo "🚀 Démarrage du déploiement de l'API Resource Management..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé."
    echo "💡 Installez Docker depuis https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas disponible."
    echo "💡 Installez Docker Compose ou utilisez une version récente de Docker"
    exit 1
fi

# Utiliser 'docker compose' ou 'docker-compose' selon la version
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📋 Création du fichier .env à partir de .env.example..."
    cp .env.example .env
    echo "✅ Fichier .env créé avec la configuration par défaut"
else
    echo "✅ Fichier .env déjà présent"
fi

# Arrêter les conteneurs existants s'ils existent
echo "🔄 Arrêt des conteneurs existants..."
$COMPOSE_CMD down

# Construire et démarrer les services
echo "🔨 Construction et démarrage des services..."
$COMPOSE_CMD up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo "🔍 Vérification de l'état des services..."
$COMPOSE_CMD ps

echo ""
echo "🎉 Déploiement terminé !"
echo "📡 L'API est accessible sur : http://localhost:3002"
echo "🗄️  La base de données MySQL est accessible sur le port 3308"
echo ""
echo "📚 Commandes utiles :"
echo "  - Voir les logs : $COMPOSE_CMD logs -f"
echo "  - Arrêter : $COMPOSE_CMD down"
echo "  - Redémarrer : $COMPOSE_CMD restart"
