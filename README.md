# 🚀 API Resource Management

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Documentation API](#documentation-api)
5. [Architecture technique](#architecture-technique)
6. [Dépannage](#dépannage)

## Vue d'ensemble

API REST pour la gestion des ressources développée avec Node.js, Express et MySQL.

**Fonctionnalités principales :**
- Gestion des utilisateurs et authentification
- CRUD des ressources
- Base de données MySQL
- Containerisation Docker

## 📦 Installation

### Option 1 : Installation avec Docker (Recommandé)

#### Prérequis
- Docker Desktop installé et démarré
- Git (optionnel)

#### Étapes d'installation

1. **Récupérer le projet**
```bash
git clone <votre-repo>
cd workshop-b3-api
```

2. **Configurer l'environnement**
```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

3. **Démarrer avec Docker**

**🪟 Windows :**
```cmd
deploy.bat
```

**🐧 Linux / 🍎 macOS :**
```bash
chmod +x deploy.sh
./deploy.sh
```

**🐳 Commande universelle :**
```bash
docker-compose up --build -d
```

4. **Vérification**
- API : http://localhost:3002
- Base de données : localhost:3308

### Option 2 : Installation manuelle

#### Prérequis
- Node.js (v16+)
- MySQL (v8+)
- npm ou yarn

#### Étapes

1. **Installation des dépendances**
```bash
npm install
```

2. **Configuration de la base de données**
- Créer une base MySQL nommée `resource_management`
- Créer un utilisateur `api_user` avec le mot de passe `apipassword`

3. **Configuration**
```bash
cp .env.example .env
# Modifier les variables DB_HOST, DB_USER, etc. dans .env
```

4. **Démarrage**
```bash
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL | `rootpassword` |
| `MYSQL_DATABASE` | Nom de la base de données | `resource_management` |
| `MYSQL_USER` | Utilisateur MySQL | `api_user` |
| `MYSQL_PASSWORD` | Mot de passe utilisateur | `apipassword` |
| `DB_PORT` | Port de la base de données | `3308` |
| `API_PORT` | Port de l'API | `3002` |
| `NODE_ENV` | Environnement d'exécution | `development` |
| `RUN_SEED` | Exécuter les données de test | `false` |
| `JWT_SECRET` | Clé secrète JWT | À définir |

### Configuration Docker vs Manuel

**Docker :** Utilise les variables `MYSQL_*` pour la création automatique de la base.

**Manuel :** Décommentez et configurez les variables `DB_*` dans le .env :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=resource_management
PORT=3001
```

## 📚 Documentation API

### URL de base
```
http://localhost:3002/api
```

### Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

**Header requis pour les routes protégées :**
```
Authorization: Bearer <token>
```

### Routes d'authentification

#### POST /auth/register
Créer un nouveau compte utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "firstname": "John",
  "lastname": "Doe"
}
```

**Réponse (201) :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

#### POST /auth/login
Se connecter et obtenir un token JWT.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse (200) :**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

### Routes des ressources

#### GET /resources
Récupérer toutes les ressources. 🔒 *Authentification requise*

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)
- `search` (optionnel) : Recherche par nom

**Exemple :**
```
GET /api/resources?page=1&limit=5&search=ordinateur
```

**Réponse (200) :**
```json
{
  "resources": [
    {
      "id": 1,
      "name": "Ordinateur portable",
      "description": "MacBook Pro 13 pouces",
      "category": "Informatique",
      "available": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5
  }
}
```

#### GET /resources/:id
Récupérer une ressource spécifique. 🔒 *Authentification requise*

**Paramètres :**
- `id` : ID de la ressource

**Réponse (200) :**
```json
{
  "id": 1,
  "name": "Ordinateur portable",
  "description": "MacBook Pro 13 pouces",
  "category": "Informatique",
  "available": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### POST /resources
Créer une nouvelle ressource. 🔒 *Authentification requise*

**Body :**
```json
{
  "name": "Projecteur",
  "description": "Projecteur HD 1080p",
  "category": "Audiovisuel",
  "available": true
}
```

**Réponse (201) :**
```json
{
  "message": "Ressource créée avec succès",
  "resource": {
    "id": 2,
    "name": "Projecteur",
    "description": "Projecteur HD 1080p",
    "category": "Audiovisuel",
    "available": true,
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

#### PUT /resources/:id
Modifier une ressource existante. 🔒 *Authentification requise*

**Paramètres :**
- `id` : ID de la ressource

**Body (tous les champs optionnels) :**
```json
{
  "name": "Projecteur 4K",
  "description": "Projecteur Ultra HD 4K",
  "available": false
}
```

**Réponse (200) :**
```json
{
  "message": "Ressource modifiée avec succès",
  "resource": {
    "id": 2,
    "name": "Projecteur 4K",
    "description": "Projecteur Ultra HD 4K",
    "category": "Audiovisuel",
    "available": false,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

#### DELETE /resources/:id
Supprimer une ressource. 🔒 *Authentification requise*

**Paramètres :**
- `id` : ID de la ressource

**Réponse (200) :**
```json
{
  "message": "Ressource supprimée avec succès"
}
```

### Codes d'erreur

| Code | Description |
|------|-------------|
| `400` | Bad Request - Données invalides |
| `401` | Unauthorized - Token manquant ou invalide |
| `403` | Forbidden - Accès refusé |
| `404` | Not Found - Ressource non trouvée |
| `409` | Conflict - Email déjà utilisé |
| `500` | Internal Server Error - Erreur serveur |

**Format d'erreur :**
```json
{
  "error": "Message d'erreur",
  "details": "Détails additionnels (optionnel)"
}
```

## 🏗️ Architecture technique

### Structure du projet
```
workshop-b3-api/
├── src/
│   ├── controllers/     # Logique métier
│   ├── models/         # Modèles de données
│   ├── routes/         # Définition des routes
│   ├── middleware/     # Middlewares (auth, validation)
│   ├── config/         # Configuration (DB, JWT)
│   └── utils/          # Utilitaires
├── docker-compose.yml  # Configuration Docker
├── Dockerfile         # Image Docker de l'API
├── .env.example       # Variables d'environnement exemple
└── package.json       # Dépendances Node.js
```

### Technologies utilisées

- **Runtime :** Node.js
- **Framework :** Express.js
- **Base de données :** MySQL 8.0
- **ORM/Query Builder :** (à préciser selon votre implémentation)
- **Authentification :** JWT (jsonwebtoken)
- **Validation :** (à préciser selon votre implémentation)
- **Containerisation :** Docker & Docker Compose

### Base de données

**Table users :**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password` (VARCHAR, NOT NULL) - Hash bcrypt
- `firstname` (VARCHAR, NOT NULL)
- `lastname` (VARCHAR, NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Table resources :**
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `category` (VARCHAR, NOT NULL)
- `available` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔧 Commandes utiles

### Docker
```bash
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down

# Supprimer avec les volumes (reset complet)
docker-compose down -v
```

### Développement
```bash
# Mode développement
npm run dev

# Tests
npm test

# Linter
npm run lint

# Build production
npm run build
```

## 🆘 Dépannage

### Problèmes courants

**Port déjà utilisé :**
- Modifiez `API_PORT` dans `.env` (ex: 3003)
- Modifiez `DB_PORT` dans `.env` (ex: 3309)

**Erreur de connexion à la base :**
- Vérifiez que Docker Desktop est démarré
- Attendez 10-15 secondes après `docker-compose up`
- Vérifiez les logs : `docker-compose logs mysql`

**Token JWT invalide :**
- Vérifiez que `JWT_SECRET` est défini dans `.env`
- Le token expire après 24h par défaut

**Erreur 404 sur toutes les routes :**
- Vérifiez l'URL de base : `http://localhost:3002/api`
- Pas `http://localhost:3002` directement

### Logs de débogage

```bash
# Logs de l'API
docker-compose logs -f api

# Logs de la base de données
docker-compose logs -f mysql

# Logs de tous les services
docker-compose logs -f
```

### Reset complet

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer les images
docker-compose down --rmi all

# Redémarrer proprement
docker-compose up --build -d
```


