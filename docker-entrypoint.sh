#!/bin/sh

# Attendre que la base de données soit prête
echo "Attente de la base de données..."
until nc -z "$DB_HOST" "${DB_PORT:-3306}"; do
  echo "Base de données non disponible - attente..."
  sleep 2
done

echo "Base de données disponible !"

# Attendre un peu plus pour que MySQL soit complètement prêt
sleep 5

# Exécuter le script de seed si nécessaire (optionnel)
if [ "$RUN_SEED" = "true" ]; then
  echo "Exécution du seed..."
  npm run seed
fi

# Démarrer l'application
echo "Démarrage de l'API..."
exec npm start
