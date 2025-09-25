# 🚀 API Resource Management

<div align="center">

[![Docker](https://img.shields.io/badge/Docker-Supported-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)](https://www.mysql.com/)
[![Cross-Platform](https://img.shields.io/badge/Cross--Platform-Linux%20%7C%20macOS%20%7C%20Windows-lightgrey)](https://github.com/yourusername/workshop-b3-api)

*API REST robuste pour la gestion des ressources avec déploiement Docker multi-plateforme*

</div>

## 📋 Table des matières

1. [🎯 Vue d'ensemble](#-vue-densemble)
2. [⚡ Déploiement rapide](#-déploiement-rapide)
3. [📦 Installation détaillée](#-installation-détaillée)
4. [⚙️ Configuration](#-configuration)
5. [📚 Documentation API](#-documentation-api)
6. [🏗️ Architecture](#-architecture)
7. [🔧 Développement](#-développement)
8. [🆘 Dépannage](#-dépannage)
9. [🤝 Contribution](#-contribution)

## 🎯 Vue d'ensemble

API REST complète pour la gestion des ressources, utilisateurs et fichiers, développée avec **Node.js**, **Express** et **MySQL**.
Intègre un système SOS connecté à ESP8266. Déploiement simplifié avec **Docker** et support natif **Linux**, **macOS** et **Windows**.

### ✨ Fonctionnalités

- 👤 **Gestion des utilisateurs** complète
- 📦 **CRUD des ressources** avec pagination et recherche
- 📁 **Gestion des fichiers** (upload, download, public/privé)
- 🆘 **Système SOS** connecté à ESP8266
- 🗄️ **Base de données MySQL** avec schéma optimisé
- 🐳 **Containerisation Docker** multi-plateforme
- 🚀 **Déploiement en un clic** sur toutes les plateformes
- 🔒 **Sécurité renforcée** (utilisateurs non-root, healthchecks)
- 📦 **Multi-stage builds** pour des images optimisées

## ⚡ Déploiement rapide

> **TL;DR :** Quelques commandes Docker pour déployer l'API complète !

### 🚀 Méthode recommandée

**1. Clonez le projet**
```bash
git clone https://github.com/spitzerl/workshop-b3-api.git
cd workshop-b3-api
```

**2. Lancez le déploiement**

**Option A : Script automatique (Linux/macOS/Git Bash)**
```bash
chmod +x deploy.sh && ./deploy.sh
```

**Option B : Commandes manuelles (Recommandé pour Windows PowerShell)**
```powershell
copy .env.example .env
docker compose up --build -d
docker compose ps
```

**3. C'est tout ! 🎉**
- ✅ API disponible : http://localhost:3002
- ✅ Base de données : localhost:3308

### 📱 Méthodes spécifiques par plateforme

<details>
<summary><strong>🐧 Linux / 🍎 macOS</strong></summary>

```bash
chmod +x deploy.sh
./deploy.sh
```
</details>

<details>
<summary><strong>🪟 Windows (Command Prompt)</strong></summary>

```cmd
deploy.bat
```
</details>

<details>
<summary><strong>🐳 Docker Compose (Manuel) - Recommandé pour Windows PowerShell</strong></summary>

```powershell
# 1. Vérifier Docker
docker --version
docker info

# 2. Créer le fichier .env (si absent)
copy .env.example .env

# 3. Arrêter les conteneurs existants
docker compose down --remove-orphans

# 4. Récupérer l'image MySQL
docker compose pull db

# 5. Construire et démarrer les services
docker compose up --build -d

# 6. Suivre les logs en temps réel
docker compose logs -f

# 7. Vérifier l'état des services
docker compose ps

# 8. Tester l'API (optionnel)
curl http://localhost:3002
```

**Services accessibles :**
- API : http://localhost:3002
- MySQL : localhost:3308

**Commandes utiles :**
```powershell
docker compose logs api     # Logs API seulement
docker compose logs db      # Logs DB seulement
docker compose restart     # Redémarrer
docker compose down        # Arrêter
docker compose down -v     # Arrêter + supprimer volumes
```
</details>

## 📦 Installation détaillée

### Prérequis

| Composant | Version | Obligatoire | Note |
|-----------|---------|-------------|------|
| **Docker Desktop** | Dernière version | ✅ Oui | [Télécharger ici](https://www.docker.com/products/docker-desktop) |
| **Git** | Dernière version | 📋 Optionnel | Pour cloner le repository |
| **Node.js** | 18+ | ❌ Non* | *Uniquement pour développement local |

### Installation avec Docker (Recommandé)

> Cette méthode fonctionne sur **Linux**, **macOS**, et **Windows** sans configuration supplémentaire.

#### Étape 1 : Récupération du projet

```bash
# Via Git (recommandé)
git clone https://github.com/votre-username/workshop-b3-api.git
cd workshop-b3-api

# Ou téléchargez le ZIP depuis GitHub
```

#### Étape 2 : Configuration automatique

Le script de déploiement crée automatiquement le fichier `.env` avec les valeurs par défaut.
Pour personnaliser la configuration, éditez `.env` avant le déploiement :

```bash
# Optionnel : personnaliser la configuration
cp .env.example .env
nano .env  # Linux/Mac
notepad .env  # Windows
```

#### Étape 3 : Déploiement

**Option A : Script universel**
```bash
chmod +x deploy.cmd
./deploy.cmd
```

**Option B : Script spécifique**
```bash
# Linux/macOS/Git Bash
chmod +x deploy.sh && ./deploy.sh

# Windows Command Prompt
deploy.bat
```

#### Étape 4 : Vérification

Une fois le déploiement terminé :
- 🌐 **API** : http://localhost:3002
- 🗄️ **MySQL** : localhost:3308 (utilisateur: `api_user`, mot de passe: `apipassword`)

### Installation manuelle (Développement)

<details>
<summary><strong>Pour les développeurs souhaitant installer sans Docker</strong></summary>

#### Prérequis
- **Node.js** 18+
- **MySQL** 8.0+
- **npm** ou **yarn**

#### Étapes

1. **Cloner et installer**
   ```bash
   git clone https://github.com/votre-username/workshop-b3-api.git
   cd workshop-b3-api
   npm install
   ```

2. **Configurer MySQL**
   ```sql
   CREATE DATABASE resource_management;
   CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'apipassword';
   GRANT ALL PRIVILEGES ON resource_management.* TO 'api_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env et décommenter les variables DB_* pour utilisation locale
   ```

4. **Démarrer l'API**
   ```bash
   # Mode développement (avec rechargement automatique)
   npm run dev

   # Mode production
   npm start
   ```

</details>

## ⚙️ Configuration

La configuration se fait via le fichier `.env` créé automatiquement lors du déploiement.

### Variables principales

| Variable | Description | Défaut | Obligatoire |
|----------|-------------|---------|-------------|
| `API_PORT` | Port externe pour l'API | `3002` | ✅ |
| `DB_PORT` | Port externe pour MySQL | `3308` | ✅ |
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL | `rootpassword` | ✅ |
| `MYSQL_DATABASE` | Nom de la base | `resource_management` | ✅ |
| `MYSQL_USER` | Utilisateur MySQL | `api_user` | ✅ |
| `MYSQL_PASSWORD` | Mot de passe utilisateur | `apipassword` | ✅ |
| `JWT_SECRET` | Clé de chiffrement JWT | *À changer en production* | 🔒 |
| `NODE_ENV` | Environnement | `development` | 📋 |
| `RUN_SEED` | Données de test | `false` | 📋 |

### Génération d'une clé JWT sécurisée

```bash
# Générer une clé aléatoire forte
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou utiliser OpenSSL
openssl rand -hex 32
```

### Configuration pour développement local

Pour utiliser une base MySQL locale (sans Docker), décommentez dans `.env` :

```env
# Configuration locale (décommenter pour usage sans Docker)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=resource_management
PORT=3001
```

### Personnalisation des ports

Si les ports par défaut sont occupés :

```env
# Exemple : changer les ports
API_PORT=3005
DB_PORT=3309
```

L'API sera alors accessible sur http://localhost:3005

## 📚 Documentation API

### 🌐 URL de base
```
http://localhost:3002/api
```

### 🔐 Authentification

⚠️ **Note :** Cette API n'implémente pas encore l'authentification JWT.
Toutes les routes sont actuellement ouvertes pour faciliter le développement et les tests.

### 🎯 Test rapide

```bash
# Tester la connectivité
curl http://localhost:3002/api

# Ou utiliser le script de test fourni
./test-api.sh
```

### 👤 Routes des utilisateurs

#### `GET /api/users`
> Récupérer tous les utilisateurs

**Réponse `200` :**
```json
[
  {
    "id": 1,
    "name": "Alice Dupont",
    "email": "alice@example.com",
    "createdAt": "2025-09-25T10:12:47.000Z",
    "updatedAt": "2025-09-25T10:12:47.000Z"
  }
]
```

#### `POST /api/users`
> Créer un nouveau utilisateur

**Payload :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "passwordHash": "hash_du_mot_de_passe"
}
```

#### `DELETE /api/users/:id`
> Supprimer un utilisateur

**Réponse `204` :** Aucun contenu

### 📦 Routes des ressources

#### `GET /api/resources`
> Récupérer toutes les ressources avec pagination et recherche

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 10)
- `search` (optionnel) : Recherche dans le titre ou la description

**Exemple :**
```http
GET /api/resources?page=1&limit=5&search=mysql
```

**Réponse `200` :**
```json
{
  "resources": [
    {
      "id": 1,
      "title": "Guide MySQL",
      "description": "Introduction MySQL",
      "IDusers": 1,
      "IDowner": 1,
      "createdAt": "2025-09-25T10:12:47.000Z",
      "updatedAt": "2025-09-25T10:12:47.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

#### `GET /api/resources/:id`
> Récupérer une ressource spécifique

**Réponse `200` :**
```json
{
  "id": 1,
  "title": "Guide MySQL",
  "description": "Introduction MySQL",
  "IDusers": 1,
  "IDowner": 1,
  "createdAt": "2025-09-25T10:12:47.000Z",
  "updatedAt": "2025-09-25T10:12:47.000Z"
}
```

#### `POST /api/resources`
> Créer une nouvelle ressource

**Payload :**
```json
{
  "title": "Nouveau Guide",
  "description": "Description du guide",
  "IDowner": 1,
  "IDusers": 1
}
```

#### `PUT /api/resources/:id`
> Modifier une ressource existante

**Payload (champs optionnels) :**
```json
{
  "title": "Titre modifié",
  "description": "Nouvelle description"
}
```

#### `DELETE /api/resources/:id`
> Supprimer une ressource

**Réponse `204` :** Aucun contenu

### 📁 Routes des fichiers

#### `GET /api/files/public`
> Récupérer tous les fichiers publics

**Réponse `200` :**
```json
[
  {
    "id": 1,
    "name": "document.pdf",
    "mimeType": "application/pdf",
    "ownerId": 1,
    "isPublic": "true",
    "createdAt": "2025-09-25T10:12:47.000Z"
  }
]
```

#### `GET /api/files/user/:userId`
> Récupérer tous les fichiers d'un utilisateur spécifique

#### `POST /api/files/upload`
> Uploader un nouveau fichier

**Payload (multipart/form-data) :**
- `file` : Le fichier à uploader
- `ownerId` : ID du propriétaire
- `isPublic` : true/false (optionnel, défaut: false)

**Réponse `201` :**
```json
{
  "id": 1,
  "name": "document.pdf",
  "mimeType": "application/pdf",
  "ownerId": 1,
  "isPublic": false,
  "createdAt": "2025-09-25T10:12:47.000Z",
  "path": "/app/public/uploads/file-123456789.pdf"
}
```

#### `GET /api/files/:id`
> Récupérer les métadonnées d'un fichier

#### `GET /api/files/:id/download`
> Télécharger un fichier (retourne le fichier binaire)

#### `DELETE /api/files/:id`
> Supprimer un fichier

### 🆘 Route SOS

#### `POST /api/sos`
> Déclencher un signal SOS via ESP8266

**Réponse `200` (succès) :**
```json
{
  "message": "SOS déclenché via ESP8266",
  "esp_response": { /* réponse de l'ESP8266 */ },
  "esp_ip": "192.168.4.1",
  "status": "success"
}
```

**Réponse `500` (ESP non accessible) :**
```json
{
  "message": "ESP8266 non accessible",
  "error": "Vérifiez que vous êtes connecté au WiFi ESP8266_SOS",
  "esp_ip": "192.168.4.1",
  "status": "error"
}
```

### 📊 Routes de statut

#### `GET /api/`
> Vérifier le statut de l'API

**Réponse `200` :**
```json
{
  "status": "ok"
}
```

#### `GET /api/esp-status`
> Vérifier le statut de l'ESP8266

#### `GET /api/test`
> Déclencher un test sur l'ESP8266

### 🚨 Codes d'erreur

| Code | Description | Action recommandée |
|------|-------------|-------------------|
| `400` | Bad Request | Vérifiez le format des données |
| `401` | Unauthorized | Token manquant/invalide/expiré |
| `403` | Forbidden | Permissions insuffisantes |
| `404` | Not Found | Ressource inexistante |
| `409` | Conflict | Email déjà utilisé |
| `500` | Internal Server Error | Voir les logs serveur |

**Format d'erreur standardisé :**
```json
{
  "error": "Message d'erreur",
  "code": "ERROR_CODE",
  "details": "Détails techniques (optionnel)"
}
```

## 🏗️ Architecture

### 📁 Structure du projet
```
workshop-b3-api/
├── 🚀 Scripts de déploiement
│   ├── deploy.sh         # Linux/macOS
│   ├── deploy.bat        # Windows
│   └── deploy.cmd        # Universel
├── 🐳 Configuration Docker
│   ├── Dockerfile        # Multi-stage optimisé
│   ├── docker-compose.yml # Services orchestrés
│   └── docker-entrypoint.sh # Point d'entrée intelligent
├── ⚙️ Configuration
│   ├── .env.example      # Template de configuration
│   ├── package.json      # Dépendances Node.js
│   └── tsconfig.json     # Configuration TypeScript
├── 📝 Code source
│   ├── app.ts           # Application principale
│   ├── db.ts            # Connexion base de données
│   ├── routes/          # Définition des routes API
│   └── scripts/         # Scripts utilitaires
├── 🗃️ Base de données
│   └── sql/             # Scripts d'initialisation
└── 📋 Documentation
    ├── README.md        # Documentation principale
    └── TESTING.md       # Tests et validation
```

### 🛠️ Technologies

| Composant | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| **Backend** | Node.js + Express | 18+ | API REST |
| **Base de données** | MySQL | 8.0 | Stockage persistant |
| **Authentification** | JWT | - | Sécurisation des routes |
| **Containerisation** | Docker + Compose | - | Déploiement isolé |
| **Language** | TypeScript | 5+ | Développement typé |
| **Process Manager** | dumb-init | - | Gestion des signaux |

### 🗄️ Schéma de base de données

```sql
-- Table des utilisateurs
CREATE TABLE users (
  IDusers INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Table des ressources
CREATE TABLE resources (
  IDresources INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  description VARCHAR(50),
  IDusers INT,
  IDowner INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Table des versions de fichiers
CREATE TABLE file_versions (
  IDFileVersions VARCHAR(50) PRIMARY KEY,
  uploadAt DATETIME,
  IDfile INT,
  versionNumber INT NOT NULL,
  filepath VARCHAR(255)
);

-- Table des fichiers
CREATE TABLE file (
  IDfile INT AUTO_INCREMENT PRIMARY KEY,
  nameFile VARCHAR(255) NOT NULL,
  typeFile VARCHAR(100),
  createdAt DATE,
  IDusers INT,
  filepath VARCHAR(255),
  IDFileVersions VARCHAR(50) NOT NULL,
  IDusers_1 INT NOT NULL,
  isPublic BOOLEAN DEFAULT FALSE,
  FOREIGN KEY(IDFileVersions) REFERENCES file_versions(IDFileVersions),
  FOREIGN KEY(IDusers_1) REFERENCES users(IDusers)
);

-- Table des messages
CREATE TABLE message (
  IDmessage INT AUTO_INCREMENT PRIMARY KEY,
  content VARCHAR(50) NOT NULL,
  isRead BOOLEAN NOT NULL,
  createdAt DATETIME NOT NULL,
  IDusers INT NOT NULL,
  FOREIGN KEY(IDusers) REFERENCES users(IDusers)
);

-- Table de partage des ressources
CREATE TABLE resource_share (
  IDresources_1 INT,
  IDusers_1 INT,
  permission VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL,
  IDresources INT,
  IDusers INT,
  PRIMARY KEY(IDresources_1, IDusers_1),
  FOREIGN KEY(IDresources_1) REFERENCES resources(IDresources),
  FOREIGN KEY(IDusers_1) REFERENCES users(IDusers)
);

-- Index pour les performances
CREATE INDEX idx_file_isPublic ON file(isPublic);
CREATE INDEX idx_file_user_public ON file(IDusers, isPublic);
```

## 🔧 Développement

### Commandes Docker

```bash
# 🚀 Gestion des services
docker compose up -d          # Démarrer en arrière-plan
docker compose up --build -d  # Rebuild + démarrer
docker compose down           # Arrêter
docker compose down -v        # Arrêter + supprimer volumes
docker compose restart        # Redémarrer

# 📋 Monitoring
docker compose ps             # État des conteneurs
docker compose logs -f        # Logs en temps réel
docker compose logs -f api    # Logs API uniquement
docker compose logs -f db     # Logs MySQL uniquement

# 🧹 Nettoyage
docker compose down --rmi all # Supprimer images
docker system prune -a        # Nettoyage complet Docker
```

### Commandes développement

```bash
# 🔄 Mode développement (rechargement auto)
npm run dev

# 🏗️ Production
npm start

# 🌱 Données de test
npm run seed
```

### Variables d'environnement de développement

```env
# Mode debug avec logs détaillés
NODE_ENV=development
LOG_LEVEL=debug

# Rechargement des données de test
RUN_SEED=true

# JWT avec expiration longue pour dev
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=7d
```

## 🆘 Dépannage

### 🔧 Problèmes courants

<details>
<summary><strong>🚫 Port déjà utilisé</strong></summary>

**Symptôme :** `Error: listen EADDRINUSE :::3002`

**Solution :**
```bash
# Modifier les ports dans .env
API_PORT=3005
DB_PORT=3309

# Ou trouver et tuer le processus
lsof -ti:3002 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :3002   # Windows
```
</details>

<details>
<summary><strong>🗄️ Erreur de connexion base de données</strong></summary>

**Symptômes :**
- `ECONNREFUSED`
- `Access denied for user`
- `Unknown database`

**Solutions :**
```bash
# 1. Vérifier que Docker fonctionne
docker ps

# 2. Attendre le démarrage complet (jusqu'à 2 minutes)
docker compose logs -f db

# 3. Reset complet si nécessaire
docker compose down -v
docker compose up --build -d
```
</details>

<details>
<summary><strong>🔑 Token JWT invalide</strong></summary>

**Symptôme :** `401 Unauthorized`

**Solutions :**
- Vérifiez que `JWT_SECRET` est défini dans `.env`
- Le token expire par défaut après 24h
- Regénérez un token via `/api/auth/login`
</details>

<details>
<summary><strong>🐳 Docker issues</strong></summary>

**Cas courants :**
```bash
# Docker daemon not running
sudo systemctl start docker    # Linux
# Ouvrir Docker Desktop         # Windows/Mac

# Permissions insuffisantes (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Espace disque insuffisant
docker system prune -a --volumes
```
</details>

<details>
<summary><strong>🪟 Erreur Windows : "No such file or directory" docker-entrypoint.sh</strong></summary>

**Symptôme :** `[dumb-init] ./docker-entrypoint.sh: No such file or directory`

**Cause :** Windows peut convertir les fins de ligne Unix (LF) en fins de ligne Windows (CRLF), rendant le script illisible pour Docker.

**Solutions :**

**Option 1 : Utiliser Git Bash ou WSL (Recommandé)**
```bash
# Dans Git Bash ou WSL
git config core.autocrlf false
git rm --cached -r .
git reset --hard
docker compose up --build -d
```

**Option 2 : Reconfigurer Git globalement**
```cmd
git config --global core.autocrlf input
git clone https://github.com/votre-username/workshop-b3-api.git
cd workshop-b3-api
docker compose up --build -d
```

**Option 3 : Utiliser PowerShell avec commands Docker directes**
```powershell
# Créer le fichier .env manuellement
copy .env.example .env

# Utiliser uniquement docker-compose sans scripts
docker compose up --build -d
```

**Vérification :** Le fichier `.gitattributes` dans le projet force automatiquement les bonnes fins de ligne pour les nouveaux clones.
</details>

### 📊 Monitoring et logs

```bash
# Santé des services
curl http://localhost:3002/health

# Métriques Docker
docker stats

# Inspection détaillée
docker compose config  # Valider la configuration
docker inspect workshop_b3_api
```

### 🔄 Reset complet

```bash
# Script de reset complet
#!/bin/bash
echo "🧹 Nettoyage complet..."
docker compose down -v --remove-orphans
docker system prune -f
rm -f .env
cp .env.example .env
echo "🚀 Redémarrage..."
./deploy.sh
```

## 🤝 Contribution

### Développement local

1. Fork du projet
2. Créer une branche : `git checkout -b feature/ma-fonctionnalite`
3. Développer avec `npm run dev`
4. Tester : `./test-api.sh`
5. Commit : `git commit -m "feat: ajout fonctionnalité X"`
6. Push : `git push origin feature/ma-fonctionnalite`
7. Créer une Pull Request

### Standards

- 🎯 **Code** : TypeScript strict, ESLint
- 📝 **Commits** : [Conventional Commits](https://conventionalcommits.org/)
- 🧪 **Tests** : Couverture > 80%
- 📚 **Docs** : README à jour avec les changements

---

<div align="center">

**🚀 API Resource Management**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](#)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](#)
[![Cross Platform](https://img.shields.io/badge/Cross--Platform-✓-green)](#)

*Déploiement Docker simplifié pour toutes les plateformes*

</div>


