@echo off
setlocal enabledelayedexpansion

REM Colors using Windows ANSI (works on Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "PURPLE=[95m"
set "NC=[0m"

echo %PURPLE%🚀 Démarrage du déploiement de l'API Resource Management...%NC%
echo.

REM Check if Docker is installed and running
echo %BLUE%ℹ️  Vérification de Docker...%NC%
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Docker n'est pas installé ou n'est pas dans le PATH%NC%
    echo 💡 Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%❌ Docker n'est pas démarré%NC%
    echo 💡 Démarrez Docker Desktop
    echo.
    pause
    exit /b 1
)

REM Detect Docker Compose command
set "COMPOSE_CMD="
docker compose version >nul 2>&1
if %errorlevel% equ 0 (
    set "COMPOSE_CMD=docker compose"
    echo %GREEN%✅ Docker Compose (plugin) détecté%NC%
) else (
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        set "COMPOSE_CMD=docker-compose"
        echo %GREEN%✅ Docker Compose (standalone) détecté%NC%
    ) else (
        echo %RED%❌ Docker Compose n'est pas disponible%NC%
        echo 💡 Docker Compose est inclus avec Docker Desktop
        echo.
        pause
        exit /b 1
    )
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo %BLUE%ℹ️  Création du fichier .env à partir de .env.example...%NC%
    if exist .env.example (
        copy .env.example .env >nul
        echo %GREEN%✅ Fichier .env créé avec la configuration par défaut%NC%
    ) else (
        echo %RED%❌ Le fichier .env.example n'existe pas%NC%
        pause
        exit /b 1
    )
) else (
    echo %GREEN%✅ Fichier .env déjà présent%NC%
)

REM Stop existing containers if they exist
echo %BLUE%ℹ️  Arrêt des conteneurs existants...%NC%
%COMPOSE_CMD% down --remove-orphans >nul 2>&1

REM Pull latest images (for base images like MySQL)
echo %BLUE%ℹ️  Mise à jour des images de base...%NC%
%COMPOSE_CMD% pull db

REM Build and start services
echo %BLUE%ℹ️  Construction et démarrage des services...%NC%
%COMPOSE_CMD% up --build -d

REM Wait for services to be ready with better feedback
echo %BLUE%ℹ️  Attente du démarrage des services...%NC%
echo Cela peut prendre quelques minutes lors du premier démarrage...

REM Wait for database to be healthy
echo %BLUE%ℹ️  Attente de la base de données...%NC%
set /a counter=0
set /a timeout=150
:wait_loop
if %counter% geq %timeout% (
    echo %RED%❌ Timeout: La base de données n'a pas démarré dans les temps%NC%
    echo %BLUE%ℹ️  Vérification des logs...%NC%
    %COMPOSE_CMD% logs db
    pause
    exit /b 1
)

%COMPOSE_CMD% ps | findstr "healthy" >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✅ Base de données prête !%NC%
    goto :continue
)

echo|set /p="."
timeout /t 2 /nobreak >nul
set /a counter+=2
goto :wait_loop

:continue
REM Wait a bit more for API to be ready
timeout /t 5 /nobreak >nul

REM Check service status
echo %BLUE%ℹ️  Vérification de l'état des services...%NC%
%COMPOSE_CMD% ps

REM Test API connectivity (basic check)
echo %BLUE%ℹ️  Test de connectivité de l'API...%NC%
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3002' -TimeoutSec 5 -UseBasicParsing | Out-Null; Write-Host 'API accessible !'; exit 0 } catch { Write-Host 'L''API ne répond pas encore, vérifiez les logs si nécessaire'; exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✅ API accessible !%NC%
) else (
    echo %YELLOW%⚠️  L'API ne répond pas encore, vérifiez les logs si nécessaire%NC%
)

echo.
echo %GREEN%✅ Déploiement terminé !%NC%
echo.
echo 🌐 Accès aux services :
echo   📡 API : http://localhost:3002
echo   🗄️  Base de données MySQL : localhost:3308
echo.
echo 📚 Commandes utiles :
echo   📋 Voir les logs : %COMPOSE_CMD% logs -f
echo   📋 Logs API uniquement : %COMPOSE_CMD% logs -f api
echo   📋 Logs DB uniquement : %COMPOSE_CMD% logs -f db
echo   🔄 Redémarrer : %COMPOSE_CMD% restart
echo   ⏹️  Arrêter : %COMPOSE_CMD% down
echo   🧹 Arrêter et nettoyer : %COMPOSE_CMD% down -v
echo.
echo 🎯 Pour tester l'API, utilisez le script : test-api.sh (avec Git Bash ou WSL)
echo.
pause
