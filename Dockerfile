# Dockerfile pour l'API Workshop B3
FROM node:18-alpine

# Installer netcat pour la vérification de connectivité
RUN apk add --no-cache netcat-openbsd

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (incluant dev pour ts-node)
RUN npm ci

# Copier le code source
COPY . .

# Créer le répertoire pour les uploads
RUN mkdir -p public/uploads

# Exposer le port
EXPOSE 3001

# Script de démarrage avec gestion de la base de données
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Point d'entrée
ENTRYPOINT ["./docker-entrypoint.sh"]
