-- Script pour corriger le problème d'upload de fichiers
-- Ajoute la colonne filepath manquante à la table file

-- Ajouter la colonne filepath (erreur si elle existe déjà, c'est normal)
ALTER TABLE file ADD COLUMN filepath VARCHAR(255);

-- Afficher la structure de la table pour vérification
DESCRIBE file;
