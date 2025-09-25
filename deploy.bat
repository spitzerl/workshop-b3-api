@echo off
echo 🚀 Démarrage du déploiement de l'API Resource Management...

REM Vérifier que Docker est installé
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker n'est pas installé ou n'est pas dans le PATH
    echo 💡 Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose n'est pas disponible
    echo 💡 Docker Compose est inclus avec Docker Desktop
    pause
    exit /b 1
)

REM Créer le fichier .env s'il n'existe pas
if not exist .env (
    echo 📋 Création du fichier .env à partir de .env.example...
    copy .env.example .env
    echo ✅ Fichier .env créé avec la configuration par défaut
) else (
    echo ✅ Fichier .env déjà présent
)

REM Arrêter les conteneurs existants
echo 🔄 Arrêt des conteneurs existants...
docker-compose down

REM Construire et démarrer les services
echo 🔨 Construction et démarrage des services...
docker-compose up --build -d

REM Attendre que les services soient prêts
echo ⏳ Attente du démarrage des services...
timeout /t 10 /nobreak >nul

REM Vérifier l'état des services
echo 🔍 Vérification de l'état des services...
docker-compose ps

echo.
echo 🎉 Déploiement terminé !
echo 📡 L'API est accessible sur : http://localhost:3002
echo 🗄️  La base de données MySQL est accessible sur le port 3308
echo.
echo 📚 Commandes utiles :
echo   - Voir les logs : docker-compose logs -f
echo   - Arrêter : docker-compose down
echo   - Redémarrer : docker-compose restart
echo.
pause
