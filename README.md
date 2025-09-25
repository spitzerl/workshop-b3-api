# 🚀 API Resource Management

## Déploiement rapide (1 minute) - Tous OS

### Prérequis
- **Docker Desktop** installé ([télécharger ici](https://www.docker.com/products/docker-desktop))
- Docker Desktop doit être **démarré**

## 🖱️ Déploiement via l'interface Docker Desktop (sans ligne de commande)

### Étape 1 : Préparation
1. **Téléchargez le projet** (ZIP depuis GitHub ou git clone)
2. **Ouvrez le dossier** `workshop-b3-api`
3. **Copiez `.env.example`** et renommez-le en `.env`

### Étape 2 : Dans Docker Desktop
1. **Ouvrez Docker Desktop**
2. Cliquez sur l'onglet **"Containers"** dans la barre latérale
3. Cliquez sur **"Create"** ou **"+"** 
4. Sélectionnez **"From existing source"** ou **"Compose"**
5. **Naviguez** vers le dossier `workshop-b3-api`
6. Sélectionnez le fichier **`docker-compose.yml`**
7. Cliquez sur **"Deploy"** ou **"Start"**

### Étape 3 : Vérification
- Dans Docker Desktop, vous verrez apparaître un **stack** nommé `workshop-b3-api`
- Cliquez dessus pour voir les 2 services : `api` et `mysql`
- Les services doivent être **verts** (running)

### 🔍 Gestion via Docker Desktop

**Voir les logs :**
- Cliquez sur votre stack → sélectionnez un service → onglet **"Logs"**

**Redémarrer :**
- Cliquez sur votre stack → bouton **"Restart"**

**Arrêter :**
- Cliquez sur votre stack → bouton **"Stop"** ou **"Delete"**

**Ouvrir l'application :**
- Cliquez sur le service `api` → vous verrez **"localhost:3002"** cliquable

### 📱 Alternative : Extension Docker Desktop

Si vous avez l'extension **"Compose"** installée :
1. Ouvrez Docker Desktop
2. Allez dans **"Dev Environments"**
3. Cliquez **"Create"**
4. Sélectionnez **"Local folder"**
5. Choisissez le dossier `workshop-b3-api`
6. Docker Desktop détectera automatiquement le `docker-compose.yml`

---

## Installation automatique (ligne de commande)

### 🪟 Windows
```cmd
# Cloner le projet
git clone <votre-repo>
cd workshop-b3-api

# Double-cliquer sur deploy.bat OU en ligne de commande :
deploy.bat
```

### 🐧 Linux / 🍎 macOS
```bash
# Cloner le projet
git clone <votre-repo>
cd workshop-b3-api

# Lancer le script
chmod +x deploy.sh
./deploy.sh
```

### 🐳 Alternative universelle (tous OS)
```bash
# Si les scripts ne fonctionnent pas, commandes manuelles :
cp .env.example .env
docker-compose up --build -d
```

### ✅ Vérification du déploiement

Une fois le déploiement terminé :
- **API** : http://localhost:3002
- **Base de données** : localhost:3308

### 📚 Commandes utiles (tous OS)

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Redémarrer les services
docker-compose restart

# Reconstruire et redémarrer
docker-compose up --build -d
```

### 🔧 Configuration personnalisée

Modifiez le fichier `.env` puis redémarrez :
```bash
docker-compose restart
```

### 🆘 Dépannage

**Docker Desktop ne démarre pas ?**
- Vérifiez que la virtualisation est activée dans le BIOS
- Redémarrez Docker Desktop

**Ports déjà utilisés ?**
- Modifiez `API_PORT` et `DB_PORT` dans `.env`
- Exemple : `API_PORT=3003` et `DB_PORT=3309`

**Interface Docker Desktop - Erreur de déploiement ?**
- Vérifiez que le fichier `.env` existe (copiez `.env.example`)
- Assurez-vous d'être dans le bon dossier avec `docker-compose.yml`

**Base de données corrompue ?**
```bash
docker-compose down -v  # Supprime les volumes
# Puis relancer le script de déploiement
```

### 💡 Notes importantes

- **Interface graphique** : Plus simple, pas besoin de ligne de commande
- **Windows** : Utilisez `deploy.bat` ou l'interface Docker Desktop
- **Linux/macOS** : Utilisez `deploy.sh` ou l'interface Docker Desktop
- **Docker Desktop** inclut automatiquement Docker Compose
- Les scripts détectent automatiquement votre configuration


