# Workshop B3 API

API REST en TypeScript/Express pour gérer des utilisateurs, des ressources et des fichiers versionnés (upload, mise à jour, téléchargement, suppression). Stockage MySQL, gestion d’uploads via Multer, scripts de seed.

## Caractéristiques clés
- **CRUD** sur `users` et `resources`
- **Gestion de fichiers**: upload, versioning, download, suppression
- **Transactions** MySQL sur opérations critiques
- **TypeScript** avec typage des réponses et du pool MySQL
- **Configuration** par `.env`

### Sommaire
- [Présentation et choix techniques](#présentation-et-choix-techniques)
- [Prérequis](#prérequis)
- [Installation et configuration](#installation-et-configuration)
- [Lancement (dev / prod)](#lancement)
- [Base de données (schéma et seed)](#base-de-données)
  - [Jeu d’essai (SQL)](#jeu-dessai-sql)
- [Routes et exemples](#routes-et-exemples)
  - [1) Healthcheck](#1-healthcheck)
  - [2) Users (CRUD)](#2-users-crud)
  - [3) Files (upload, liste, téléchargement, versioning, suppression)](#3-files-upload-liste-téléchargement-versioning-suppression)
  - [4) Resources (CRUD)](#4-resources-crud)
- [Structure du projet](#structure-du-projet)
- [Scripts NPM](#scripts-npm)
- [Notes de sécurité et bonnes pratiques](#notes-de-sécurité-et-bonnes-pratiques)
- [Support](#support)

---

### Guide rapide

#### Avec Docker (Recommandé)
1. Clonez le projet et copiez `env.example` vers `.env`
2. Lancez avec Docker: `docker compose up --build`
3. L'API est accessible sur `http://localhost:3001`
4. Testez les routes: consultez [Routes et exemples](#routes-et-exemples)

#### Sans Docker (Développement)
1. Créez `.env` (voir [Installation et configuration](#installation-et-configuration)).
2. Créez la base et importez le schéma ([Base de données](#base-de-données)).
3. (Optionnel) Exécutez le seed (`npm run seed`).
4. Lancez l'API: `npm run dev` ou `npm start` ([Lancement](#lancement)).
5. Testez les routes: consultez [Routes et exemples](#routes-et-exemples).

---

### Présentation et choix techniques

- **Express 4 + TypeScript**: productif, typé, écosystème riche. Facile à étendre (middlewares, routers séparés).
- **MySQL (mysql2/promise)**: base relationnelle robuste avec pool de connexions et requêtes SQL explicites.
- **Multer**: gestion fiable des uploads (stockage disque), nécessaire pour les fichiers potentiellement volumineux.
- **morgan / debug**: logs HTTP et debug serveur.
- **dotenv**: configuration par variables d’environnement.

Ces choix visent la simplicité pédagogique (workshop) tout en couvrant des besoins réels (CRUD, fichiers, transactions, versions).

---

### Prérequis
- Node.js 18+ (recommandé)
- MySQL 8+
- npm

---

### Installation et configuration

1) Cloner le projet
```bash
git clone <votre-repo> && cd workshop-b3-api
```

2) Installer les dépendances
```bash
npm install
```

3) Configurer l’environnement
Créez un fichier `.env` à la racine avec au minimum:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=resource_management
PORT=3001
```

4) Créer la base et le schéma
Importez le script SQL fourni:
```bash
mysql -u $DB_USER -p -h $DB_HOST -e "CREATE DATABASE IF NOT EXISTS resource_management;"
mysql -u $DB_USER -p -h $DB_HOST resource_management < sql/schema.sql
```

5) (Optionnel) Seed de données
```bash
npm run seed
```

---

### Lancement

#### Avec Docker (Recommandé pour le déploiement)

1. **Configuration initiale** :
```bash
# Copier le fichier d'environnement exemple
cp env.example .env

# Éditer .env selon vos besoins (optionnel, les valeurs par défaut fonctionnent)
nano .env
```

2. **Lancement avec Docker Compose** :
```bash
# Construire et démarrer tous les services
docker-compose up --build

# En arrière-plan
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

3. **Commandes utiles** :
```bash
# Exécuter le seed de données
RUN_SEED=true docker-compose up --build

# Redémarrer un service spécifique
docker-compose restart api

# Accéder aux logs de l'API
docker-compose logs -f api

# Accéder au conteneur de base de données
docker-compose exec db mysql -u api_user -p resource_management
```

L'API sera accessible sur `http://localhost:3001` et la base de données MySQL sur le port `3307`.

#### Développement local (sans Docker)

- Développement (watch + reload):
```bash
npm run dev
```

- Démarrage simple:
```bash
npm start
```

Le serveur écoute par défaut sur `http://localhost:3001` (configurable via `PORT`). Les fichiers statiques sont servis depuis `public/` et les uploads sont stockés dans `public/uploads/` (créé à la volée).

---

### Base de données

Schéma principal (voir `sql/schema.sql` pour le détail complet):

- `users` (IDusers, name, email [unique], passwordHash, createdAt, updatedAt)
- `resources` (IDresources, title, description, IDusers, IDowner, createdAt, updatedAt)
- `file` (IDfile, nameFile, typeFile, createdAt, IDusers, IDFileVersions [FK], IDusers_1 [FK])
- `file_versions` (IDFileVersions [PK], uploadAt, IDfile, versionNumber, filepath)
- `message` (IDmessage, content, isRead, createdAt, IDusers [FK])
- `resource_share` (IDresources_1, IDusers_1, permission, createdAt, …)

Le script `scripts/seed.ts` insère des utilisateurs, ressources, messages, fichiers et versions d’exemple. Il utilise le pool MySQL et peut être relancé sans affecter la structure. Si vous utilisez le nouveau schéma où le champ de `message` s’appelle `isRead` (au lieu de `read`), adaptez le seed en conséquence.

#### Jeu d’essai (SQL)
Vous pouvez aussi injecter directement ce jeu d’essai cohérent avec le schéma (champ `isRead`) :
```sql
-- Table : users
CREATE TABLE IF NOT EXISTS users (
   IDusers INT AUTO_INCREMENT,
   name VARCHAR(255) NOT NULL,
   email VARCHAR(255) NOT NULL,
   passwordHash VARCHAR(255) NOT NULL,
   createdAt DATETIME NOT NULL,
   updatedAt DATETIME NOT NULL,
   PRIMARY KEY(IDusers),
   UNIQUE(email)
);

-- Table : resources
CREATE TABLE IF NOT EXISTS resources (
   IDresources INT AUTO_INCREMENT,
   title VARCHAR(50) NOT NULL,
   description VARCHAR(50),
   IDusers INT,
   IDowner INT NOT NULL,
   updatedAt DATETIME NOT NULL,
   createdAt DATETIME NOT NULL,
   PRIMARY KEY(IDresources)
);

-- Table : file_versions
CREATE TABLE IF NOT EXISTS file_versions (
   IDFileVersions VARCHAR(50),
   uploadAt DATETIME,
   IDfile INT,
   versionNumber INT NOT NULL,
   filepath VARCHAR(255),
   PRIMARY KEY(IDFileVersions)
);

-- Table : message (avec 'read' renommé en 'isRead')
CREATE TABLE IF NOT EXISTS message (
   IDmessage INT AUTO_INCREMENT,
   content VARCHAR(50) NOT NULL,
   isRead BOOLEAN NOT NULL,
   createdAt DATETIME NOT NULL,
   IDusers INT NOT NULL,
   PRIMARY KEY(IDmessage),
   FOREIGN KEY(IDusers) REFERENCES users(IDusers)
);

-- Table : file
CREATE TABLE IF NOT EXISTS file (
   IDfile INT AUTO_INCREMENT,
   nameFile VARCHAR(255) NOT NULL,
   typeFile VARCHAR(100),
   createdAt DATE,
   IDusers INT,
   IDFileVersions VARCHAR(50) NOT NULL,
   IDusers_1 INT NOT NULL,
   PRIMARY KEY(IDfile),
   FOREIGN KEY(IDFileVersions) REFERENCES file_versions(IDFileVersions),
   FOREIGN KEY(IDusers_1) REFERENCES users(IDusers)
);

-- Table : resource_share
CREATE TABLE IF NOT EXISTS resource_share (
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

-- Insertion des utilisateurs
INSERT INTO users (name, email, passwordHash, createdAt, updatedAt)
VALUES
  ('Alice Dupont', 'alice@example.com', 'hashedpassword1', NOW(), NOW()),
  ('Bob Martin', 'bob@example.com', 'hashedpassword2', NOW(), NOW()),
  ('Charlie Durand', 'charlie@example.com', 'hashedpassword3', NOW(), NOW());

-- Insertion de ressources
INSERT INTO resources (title, description, IDusers, IDowner, updatedAt, createdAt)
VALUES
  ('Guide MySQL', 'Introduction à MySQL', 1, 1, NOW(), NOW()),
  ('Projet React', 'Code source React', 2, 2, NOW(), NOW());

-- Insertion de versions de fichiers
INSERT INTO file_versions (IDFileVersions, uploadAt, IDfile, versionNumber, filepath)
VALUES
  ('v1f1', NOW(), NULL, 1, '/files/mysql_v1.pdf'),
  ('v2f1', NOW(), NULL, 2, '/files/mysql_v2.pdf'),
  ('v1f2', NOW(), NULL, 1, '/files/react_v1.zip');

-- Insertion de fichiers
INSERT INTO file (nameFile, typeFile, createdAt, IDusers, IDFileVersions, IDusers_1)
VALUES
  ('Guide MySQL v2', 'pdf', CURDATE(), 1, 'v2f1', 1),
  ('Projet React', 'zip', CURDATE(), 2, 'v1f2', 2);

-- Insertion de messages
INSERT INTO message (content, isRead, createdAt, IDusers)
VALUES
  ('Bienvenue sur la plateforme !', FALSE, NOW(), 1),
  ('Merci pour l\'upload.', TRUE, NOW(), 2),
  ('Partage reçu.', FALSE, NOW(), 3);

-- Insertion de partages de ressources
INSERT INTO resource_share (IDresources_1, IDusers_1, permission, createdAt, IDresources, IDusers)
VALUES
  (1, 2, 'read', NOW(), 1, 2),
  (2, 1, 'edit', NOW(), 2, 1);
```

---

### Routes et exemples

Base URL: `http://localhost:3001`

#### Cheat sheet des endpoints

| Méthode | Route                         | Description                           |
|---------|-------------------------------|---------------------------------------|
| GET     | `/`                           | Healthcheck                           |
| GET     | `/users`                      | Lister les utilisateurs               |
| GET     | `/users/:id`                  | Obtenir un utilisateur                |
| POST    | `/users`                      | Créer un utilisateur                  |
| PUT     | `/users/:id`                  | Mettre à jour un utilisateur          |
| DELETE  | `/users/:id`                  | Supprimer un utilisateur              |
| POST    | `/files/upload`               | Uploader un fichier                   |
| GET     | `/files`                      | Lister les fichiers                   |
| GET     | `/files/:IDFileVersions`      | Télécharger par ID de version         |
| PUT     | `/files/:IDfile/update`       | Créer une nouvelle version de fichier |
| DELETE  | `/files/:IDfile`              | Supprimer un fichier et ses versions  |
| GET     | `/resources`                  | Lister les ressources                 |
| GET     | `/resources/:id`              | Obtenir une ressource                 |
| POST    | `/resources`                  | Créer une ressource                   |
| PUT     | `/resources/:id`              | Mettre à jour une ressource           |
| DELETE  | `/resources/:id`              | Supprimer une ressource               |

#### 1) Healthcheck
- `GET /`
  - Réponse: `{ "status": "ok" }`

Exemple:
```bash
curl -s http://localhost:3001/
```

#### 2) Users (CRUD)
Ressource: `routes/users.ts`

- `GET /users`
  - 200: liste d’utilisateurs
  - Exemple:
  ```bash
  curl -s http://localhost:3001/users
  ```

- `GET /users/:id`
  - 200: utilisateur
  - 404: non trouvé
  - Exemple:
  ```bash
  curl -s http://localhost:3001/users/1
  ```

- `POST /users`
  - Body JSON requis: `{ name, email, passwordHash }`
  - 201: `{ IDusers, name, email }`
  - 400: champs manquants
  - 409: email déjà existant
  - Exemple:
  ```bash
  curl -s -X POST http://localhost:3001/users \
    -H 'Content-Type: application/json' \
    -d '{"name":"Alice","email":"alice@example.com","passwordHash":"$2b$10$hash"}'
  ```

- `PUT /users/:id`
  - Body JSON: tout sous-ensemble de `{ name, email, passwordHash }`
  - 200: `{ IDusers, name?, email? }` (champs fournis)
  - 400: aucun champ à mettre à jour
  - 404: non trouvé
  - 409: email en conflit
  - Exemple:
  ```bash
  curl -s -X PUT http://localhost:3001/users/1 \
    -H 'Content-Type: application/json' \
    -d '{"name":"Alice Updated"}'
  ```

- `DELETE /users/:id`
  - 204: supprimé
  - 404: non trouvé
  - Exemple:
  ```bash
  curl -i -X DELETE http://localhost:3001/users/1
  ```

#### 3) Files (upload, liste, téléchargement, versioning, suppression)
Ressource: `routes/files.ts`

Stockage fichiers: `public/uploads/`

- `POST /files/upload`
  - Form-Data (multipart):
    - `file`: le fichier à envoyer
    - `IDusers`: identifiant utilisateur propriétaire
  - Comportement: crée une entrée `file`, une entrée `file_versions` v1, et lie la version au fichier (transaction).
  - 201: `{ message, IDfile, IDFileVersions, filename }`
  - 400: sans fichier
  - 500: erreur serveur (rollback et suppression du fichier physique)
  - Exemple:
  ```bash
  curl -s -X POST http://localhost:3001/files/upload \
    -F "file=@/chemin/vers/mon.pdf" \
    -F "IDusers=1"
  ```

- `GET /files`
  - 200: liste des entrées `file` (principales)
  - Exemple:
  ```bash
  curl -s http://localhost:3001/files
  ```

- `GET /files/:IDFileVersions`
  - Télécharge un fichier par identifiant de version (ex: `v1f12`).
  - 200: binaire (download)
  - 404: introuvable (DB ou disque)
  - Exemple:
  ```bash
  curl -OJ http://localhost:3001/files/v1f12
  ```

- `PUT /files/:IDfile/update`
  - Met à jour un fichier en ajoutant une nouvelle version.
  - Form-Data (multipart): `file`
  - 200: `{ message, IDFileVersions, filename }`
  - 400: sans fichier
  - 500: erreur serveur (rollback et suppression du nouveau fichier sur disque)
  - Exemple:
  ```bash
  curl -s -X PUT http://localhost:3001/files/12/update \
    -F "file=@/chemin/vers/mon_v2.pdf"
  ```

- `DELETE /files/:IDfile`
  - Supprime l’entrée `file` et toutes les `file_versions` associées (transaction), puis supprime les fichiers physiques.
  - 200: message de succès
  - 500: erreur serveur
  - Exemple:
  ```bash
  curl -i -X DELETE http://localhost:3001/files/12
  ```

Codes de statut utilisés: 200, 201, 204, 400, 404, 409, 500.

#### 4) Resources (CRUD)
Ressource: `routes/resources.ts`

- `GET /resources`
  - 200: liste des ressources
  - Exemple:
  ```bash
  curl -s http://localhost:3001/resources
  ```

- `GET /resources/:id`
  - 200: ressource
  - 404: non trouvée
  - Exemple:
  ```bash
  curl -s http://localhost:3001/resources/1
  ```

- `POST /resources`
  - Body JSON requis: `{ title, description?, IDusers?, IDowner }`
  - 201: `{ IDresources, title, description, IDowner }`
  - 400: champs requis manquants
  - Exemple:
  ```bash
  curl -s -X POST http://localhost:3001/resources \
    -H 'Content-Type: application/json' \
    -d '{"title":"Guide MySQL","description":"Intro","IDowner":1}'
  ```

- `PUT /resources/:id`
  - Body JSON: tout sous-ensemble de `{ title, description, IDusers, IDowner }`
  - 200: JSON des champs mis à jour + `IDresources`
  - 400: aucun champ à mettre à jour
  - 404: non trouvée
  - Exemple:
  ```bash
  curl -s -X PUT http://localhost:3001/resources/1 \
    -H 'Content-Type: application/json' \
    -d '{"description":"Mise à jour"}'
  ```

- `DELETE /resources/:id`
  - 204: supprimée
  - 404: non trouvée
  - Exemple:
  ```bash
  curl -i -X DELETE http://localhost:3001/resources/1
  ```

---

### Structure du projet
```
app.ts                 # Déclaration de l’app Express (middlewares, routers)
bin/www.ts             # Bootstrap serveur HTTP (port, listeners)
db.ts                  # Pool MySQL (dotenv)
routes/                # Modules de routes
  index.ts             # Healthcheck
  users.ts             # CRUD utilisateurs
  files.ts             # Uploads et versioning de fichiers
scripts/seed.ts        # Seed de données d’exemple
sql/schema.sql         # Schéma SQL
public/                # Statique + uploads
```

---

### Scripts NPM

- `npm run dev`: démarre le serveur en mode dev (nodemon + ts-node)
- `npm start`: démarre le serveur (ts-node)
- `npm run seed`: exécute le seed MySQL

---

### Notes de sécurité et bonnes pratiques

- Les mots de passe des utilisateurs sont stockés ici sous forme de `passwordHash` d’exemple; en production, utilisez un hachage sécurisé (bcrypt/argon2) et une stratégie d’authentification.
- Validez strictement les entrées (email, tailles de fichiers, types MIME). Multer accepte tous types par défaut; appliquez un `fileFilter` si nécessaire.
- Gérez les quotas et la rétention des fichiers (le code supprime physiquement lors des DELETE).
- Mettez en place des sauvegardes et des migrations de schéma.
- Configurez CORS selon vos besoins (`cors` est installé). Ajoutez `app.use(cors())` si nécessaire.
- Ne commitez pas de secrets. Utilisez des variables d’environnement et un gestionnaire de secrets.

---

### Support
Toute question ou amélioration bienvenue via issues/PRs.


