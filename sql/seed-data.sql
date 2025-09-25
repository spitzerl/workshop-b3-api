-- Script de seed pour Workshop B3 API
-- Données d'exemple pour tester l'API

-- Nettoyer les données existantes
DELETE FROM resource_share;
DELETE FROM message;
DELETE FROM file;
DELETE FROM file_versions;
DELETE FROM resources;
DELETE FROM users;

-- Reset des auto-increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE resources AUTO_INCREMENT = 1;
ALTER TABLE file AUTO_INCREMENT = 1;
ALTER TABLE message AUTO_INCREMENT = 1;

-- Insertion des utilisateurs
INSERT INTO users (name, email, passwordHash, createdAt, updatedAt) VALUES
('Alice Dupont', 'alice@example.com', '$2b$10$hashedpassword1', NOW(), NOW()),
('Bob Martin', 'bob@example.com', '$2b$10$hashedpassword2', NOW(), NOW()),
('Charlie Durand', 'charlie@example.com', '$2b$10$hashedpassword3', NOW(), NOW());

-- Insertion de ressources avec descriptions courtes
INSERT INTO resources (title, description, IDusers, IDowner, updatedAt, createdAt) VALUES
('Guide MySQL', 'Introduction MySQL', 1, 1, NOW(), NOW()),
('Projet React', 'App React moderne', 2, 2, NOW(), NOW()),
('API Docs', 'Documentation API', 3, 3, NOW(), NOW());

-- Insertion de versions de fichiers
INSERT INTO file_versions (IDFileVersions, uploadAt, versionNumber, filepath) VALUES
('v1f1', NOW(), 1, '/app/public/uploads/mysql_v1.pdf'),
('v2f1', NOW(), 2, '/app/public/uploads/mysql_v2.pdf'),
('v1f2', NOW(), 1, '/app/public/uploads/react_v1.zip');

-- Insertion de fichiers avec la nouvelle structure
INSERT INTO file (nameFile, typeFile, createdAt, IDusers, filepath, IDFileVersions, IDusers_1) VALUES
('Guide MySQL v1', 'application/pdf', NOW(), 1, '/app/public/uploads/mysql_v1.pdf', 'v1f1', 1),
('Guide MySQL v2', 'application/pdf', NOW(), 1, '/app/public/uploads/mysql_v2.pdf', 'v2f1', 1),
('Projet React', 'application/zip', NOW(), 2, '/app/public/uploads/react_v1.zip', 'v1f2', 2);

-- Mettre à jour les file_versions avec les IDs de fichiers
UPDATE file_versions SET IDfile = 1 WHERE IDFileVersions = 'v1f1';
UPDATE file_versions SET IDfile = 1 WHERE IDFileVersions = 'v2f1';
UPDATE file_versions SET IDfile = 2 WHERE IDFileVersions = 'v1f2';

-- Insertion de messages avec contenu court
INSERT INTO message (content, isRead, createdAt, IDusers) VALUES
('Bienvenue Workshop B3 !', FALSE, NOW(), 1),
('Merci upload MySQL', TRUE, NOW(), 2),
('Partage reçu', FALSE, NOW(), 3);

-- Insertion de partages de ressources
INSERT INTO resource_share (IDresources_1, IDusers_1, permission, createdAt, IDresources, IDusers) VALUES
(1, 2, 'read', NOW(), 1, 1),
(2, 1, 'edit', NOW(), 2, 2);

-- Afficher un résumé
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Resources', COUNT(*) FROM resources
UNION ALL
SELECT 'Files', COUNT(*) FROM file
UNION ALL
SELECT 'Messages', COUNT(*) FROM message;
