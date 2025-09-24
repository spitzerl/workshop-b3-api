import pool from '../db';

async function main() {
    console.log('Seeding database...');

    await pool.query('START TRANSACTION');
    try {
        // Insertion des utilisateurs (IDs 1..3 attendus si table vide)
        await pool.query(
            "INSERT INTO users (name, email, passwordHash, createdAt, updatedAt) VALUES \
            ('Alice Dupont', 'alice@example.com', 'hashedpassword1', NOW(), NOW()), \
            ('Bob Martin', 'bob@example.com', 'hashedpassword2', NOW(), NOW()), \
            ('Charlie Durand', 'charlie@example.com', 'hashedpassword3', NOW(), NOW())"
        );

        // Insertion de ressources (référence IDusers existants)
        await pool.query(
            "INSERT INTO resources (title, description, IDusers, IDowner, updatedAt, createdAt) VALUES \
            ('Guide MySQL', 'Introduction à MySQL', 1, 1, NOW(), NOW()), \
            ('Projet React', 'Code source React', 2, 2, NOW(), NOW())"
        );

        // Insertion de versions de fichiers (IDs fixes)
        await pool.query(
            "INSERT INTO file_versions (IDFileVersions, uploadAt, IDfile, versionNumber, filepath) VALUES \
            ('v1f1', NOW(), NULL, 1, '/files/mysql_v1.pdf'), \
            ('v2f1', NOW(), NULL, 2, '/files/mysql_v2.pdf'), \
            ('v1f2', NOW(), NULL, 1, '/files/react_v1.zip')"
        );

        // Insertion de fichiers (types simples 'pdf' / 'zip')
        await pool.query(
            "INSERT INTO file (nameFile, typeFile, createdAt, IDusers, IDFileVersions, IDusers_1) VALUES \
            ('Guide MySQL v2', 'pdf', CURDATE(), 1, 'v2f1', 1), \
            ('Projet React', 'zip', CURDATE(), 2, 'v1f2', 2)"
        );

        // Optionnel: backfill de IDfile dans file_versions si nécessaire
        // Assumant que les deux fichiers insérés ont reçu les IDs 1 et 2
        await pool.query("UPDATE file_versions SET IDfile = 1 WHERE IDFileVersions IN ('v1f1','v2f1')");
        await pool.query("UPDATE file_versions SET IDfile = 2 WHERE IDFileVersions = 'v1f2'");

        // Insertion de messages (isRead)
        await pool.query(
            "INSERT INTO message (content, isRead, createdAt, IDusers) VALUES \
            ('Bienvenue sur la plateforme !', FALSE, NOW(), 1), \
            ('Merci pour l\\'upload.', TRUE, NOW(), 2), \
            ('Partage reçu.', FALSE, NOW(), 3)"
        );

        // Insertion de partages de ressources
        await pool.query(
            "INSERT INTO resource_share (IDresources_1, IDusers_1, permission, createdAt, IDresources, IDusers) VALUES \
            (1, 2, 'read', NOW(), 1, 2), \
            (2, 1, 'edit', NOW(), 2, 1)"
        );

        await pool.query('COMMIT');
        console.log('Seeding done.');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Seed error:', err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main();
