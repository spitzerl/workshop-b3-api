# 🧪 Guide de test pour Workshop B3 API

Ce guide vous permet de tester que votre API fonctionne correctement, que ce soit avec Docker ou en local.

## 📋 Prérequis

### Pour Docker :
- Docker et Docker Compose installés
- Ports 3001 et 3307 disponibles

### Pour test local :
- Node.js 18+
- MySQL 8+
- npm

---

## 🐳 **Tests avec Docker (Recommandé)**

### 1. Vérification de la configuration
```bash
# Vérifier que le fichier docker-compose.yml est valide
docker compose config

# Vérifier que les fichiers nécessaires existent
ls -la Dockerfile docker-compose.yml .env.example docker-entrypoint.sh
```

### 2. Construction et démarrage
```bash
# Construire et démarrer tous les services
docker compose up --build -d

# Vérifier que les conteneurs sont en cours d'exécution
docker compose ps

# Voir les logs en temps réel
docker compose logs -f
```

### 3. Tests de santé des services
```bash
# Vérifier l'état des conteneurs
docker compose ps

# Tester la connexion à l'API
curl -s http://localhost:3001/ | jq .

# Tester la connexion à la base de données
docker compose exec db mysql -u api_user -papipassword -e "SHOW DATABASES;"
```

---

## 🖥️ **Tests locaux (Développement)**

### 1. Installation et configuration
```bash
# Installer les dépendances
npm install

# Copier et configurer l'environnement
cp env.example .env
# Éditer .env selon votre configuration MySQL locale
```

### 2. Démarrage
```bash
# Mode développement avec rechargement automatique
npm run dev

# Ou démarrage simple
npm start
```

---

## 🔍 **Tests des endpoints API**

### Test 1 : Healthcheck
```bash
curl -s http://localhost:3001/ | jq .
```
**Résultat attendu :** `{"status":"ok"}`

### Test 2 : Création d'un utilisateur
```bash
curl -s -X POST http://localhost:3001/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "passwordHash": "$2b$10$hashedpassword"
  }' | jq .
```
**Résultat attendu :** Utilisateur créé avec ID

### Test 3 : Liste des utilisateurs
```bash
curl -s http://localhost:3001/users | jq .
```
**Résultat attendu :** Liste des utilisateurs (incluant celui créé)

### Test 4 : Upload d'un fichier
```bash
# Créer un fichier de test
echo "Test content" > test-file.txt

curl -s -X POST http://localhost:3001/files/upload \
  -F "file=@test-file.txt" \
  -F "IDusers=1" | jq .
```
**Résultat attendu :** Fichier uploadé avec ID et version

### Test 5 : Liste des fichiers
```bash
curl -s http://localhost:3001/files | jq .
```
**Résultat attendu :** Liste des fichiers uploadés

### Test 6 : Création d'une ressource
```bash
curl -s -X POST http://localhost:3001/resources \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Resource",
    "description": "Description du test",
    "IDowner": 1
  }' | jq .
```
**Résultat attendu :** Ressource créée avec ID

### Test 7 : Liste des ressources
```bash
curl -s http://localhost:3001/resources | jq .
```
**Résultat attendu :** Liste des ressources (incluant celle créée)

---

## 🗄️ **Tests de la base de données**

### Vérification des tables
```bash
# Avec Docker
docker compose exec db mysql -u api_user -papipassword resource_management -e "SHOW TABLES;"

# En local
mysql -u root -p resource_management -e "SHOW TABLES;"
```

### Vérification des données
```bash
# Avec Docker
docker compose exec db mysql -u api_user -papipassword resource_management -e "SELECT * FROM users;"

# En local
mysql -u root -p resource_management -e "SELECT * FROM users;"
```

---

## 🧹 **Nettoyage après tests**

### Avec Docker
```bash
# Arrêter les services
docker compose down

# Supprimer les volumes (ATTENTION : supprime les données)
docker compose down -v

# Nettoyer les images (optionnel)
docker compose down --rmi all
```

### En local
```bash
# Arrêter l'API (Ctrl+C)
# Nettoyer les fichiers de test
rm -f test-file.txt
```

---

## 🚨 **Dépannage**

### Problèmes courants

#### 1. Port déjà utilisé
```bash
# Vérifier les ports utilisés
netstat -tlnp | grep -E ':(3001|3307)'

# Changer les ports dans .env si nécessaire
```

#### 2. Base de données non accessible
```bash
# Vérifier les logs de la base
docker compose logs db

# Vérifier la connectivité réseau
docker compose exec api ping db
```

#### 3. API ne démarre pas
```bash
# Vérifier les logs de l'API
docker compose logs api

# Vérifier les variables d'environnement
docker compose exec api env | grep DB_
```

#### 4. Fichiers non uploadés
```bash
# Vérifier les permissions du dossier uploads
ls -la public/uploads/

# Vérifier les logs d'upload
docker compose logs api | grep upload
```

---

## ✅ **Checklist de validation**

- [ ] Services Docker démarrés sans erreur
- [ ] Healthcheck API répond `{"status":"ok"}`
- [ ] Base de données accessible
- [ ] Tables créées automatiquement
- [ ] Création d'utilisateur fonctionne
- [ ] Upload de fichier fonctionne
- [ ] Création de ressource fonctionne
- [ ] Tous les endpoints CRUD fonctionnent
- [ ] Logs sans erreurs critiques

---

## 📊 **Tests automatisés (Optionnel)**

Vous pouvez créer un script de test automatisé :

```bash
#!/bin/bash
# test-api.sh

echo "🧪 Test de l'API Workshop B3"

# Test healthcheck
echo "Test 1: Healthcheck"
curl -s http://localhost:3001/ | jq . || echo "❌ Échec healthcheck"

# Test création utilisateur
echo "Test 2: Création utilisateur"
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","passwordHash":"$2b$10$hash"}')
echo $USER_RESPONSE | jq . || echo "❌ Échec création utilisateur"

echo "✅ Tests terminés"
```

Utilisation : `chmod +x test-api.sh && ./test-api.sh`
