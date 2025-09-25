#!/bin/bash
# Universal deployment script for cross-platform compatibility
# This script automatically detects the OS and runs the appropriate deployment script

# Detect operating system
case "$(uname -s)" in
    Darwin*)
        echo "🍎 macOS détecté - Utilisation du script Unix"
        chmod +x deploy.sh
        ./deploy.sh
        ;;
    Linux*)
        echo "🐧 Linux détecté - Utilisation du script Unix"
        chmod +x deploy.sh
        ./deploy.sh
        ;;
    CYGWIN*|MINGW*|MSYS*)
        echo "🪟 Windows (Git Bash/MSYS) détecté - Utilisation du script Unix"
        chmod +x deploy.sh
        ./deploy.sh
        ;;
    *)
        echo "❓ OS non reconnu - Tentative avec le script Unix par défaut"
        echo "Si cela ne fonctionne pas, utilisez :"
        echo "  - deploy.sh sur Linux/Mac/Git Bash"
        echo "  - deploy.bat sur Windows Command Prompt"
        chmod +x deploy.sh
        ./deploy.sh
        ;;
esac