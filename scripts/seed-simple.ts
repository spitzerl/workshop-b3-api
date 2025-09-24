import pool from '../db';

async function main() {
    console.log('🌱 Seeding database...');

    await pool.query('START TRANSACTION');
    try {
        // Nettoyer les données existantes
        console.log('🧹 Cleaning existing data...');
        await pool.query('DELETE FROM resource_share');
        await pool.query('DELETE FROM message');
        await pool.query('DELETE FROM file');
        await pool.query('DELETE FROM file_versions');
        await pool.query('DELETE FROM resources');
        await pool.query('DELETE FROM users');

        // Reset des auto-increment
        await pool.query('ALTER TABLE users AUTO_INCREMENT = 1');
        await pool.query('ALTER TABLE resources AUTO_INCREMENT = 1');
        await pool.query('ALTER TABLE file AUTO_INCREMENT = 1');
        await pool.query('ALTER TABLE message AUTO_INCREMENT = 1');

        console.log('👥 Inserting users...');
        // Insertion des utilisateurs
        await pool.query(
            "INSERT INTO users (name, email, passwordHash, createdAt, updatedAt) VALUES \
            ('Alice Dupont', 'alice@example.com', '$2b$10$hashedpassword1', NOW(), NOW()), \
            ('Bob Martin', 'bob@example.com', '$2b$10$hashedpassword2', NOW(), NOW()), \
            ('Charlie Durand', 'charlie@example.com', '$2b$10$hashedpassword3', NOW(), NOW())"
        );

        console.log('📚 Inserting resources...');
        // Insertion de ressources avec descriptions courtes
        await pool.query(
            "INSERT INTO resources (title, description, IDusers, IDowner, updatedAt, createdAt) VALUES \
            ('Guide MySQL', 'Introduction MySQL', 1, 1, NOW(), NOW()), \
            ('Projet React', 'App React moderne', 2, 2, NOW(), NOW()), \
            ('API Docs', 'Documentation API', 3, 3, NOW(), NOW())"
        );

        console.log('📁 Inserting file versions...');
        // Insertion de versions de fichiers
        await pool.query(
            "INSERT INTO file_versions (IDFileVersions, uploadAt, versionNumber, filepath) VALUES \
            ('v1f1', NOW(), 1, '/app/public/uploads/mysql_v1.pdf'), \
            ('v2f1', NOW(), 2, '/app/public/uploads/mysql_v2.pdf'), \
            ('v1f2', NOW(), 1, '/app/public/uploads/react_v1.zip')"
        );

        console.log('📄 Inserting files...');
        // Insertion de fichiers avec la nouvelle structure
        await pool.query(
            "INSERT INTO file (nameFile, typeFile, createdAt, IDusers, filepath, IDFileVersions, IDusers_1) VALUES \
            ('Guide MySQL v1', 'application/pdf', NOW(), 1, '/app/public/uploads/mysql_v1.pdf', 'v1f1', 1), \
            ('Guide MySQL v2', 'application/pdf', NOW(), 1, '/app/public/uploads/mysql_v2.pdf', 'v2f1', 1), \
            ('Projet React', 'application/zip', NOW(), 2, '/app/public/uploads/react_v1.zip', 'v1f2', 2)"
        );

        // Mettre à jour les file_versions avec les IDs de fichiers
        console.log('🔗 Linking file versions...');
        await pool.query("UPDATE file_versions SET IDfile = 1 WHERE IDFileVersions = 'v1f1'");
        await pool.query("UPDATE file_versions SET IDfile = 1 WHERE IDFileVersions = 'v2f1'");
        await pool.query("UPDATE file_versions SET IDfile = 2 WHERE IDFileVersions = 'v1f2'");

        console.log('💬 Inserting messages...');
        // Insertion de messages avec contenu court
        await pool.query(
            "INSERT INTO message (content, isRead, createdAt, IDusers) VALUES \
            ('Bienvenue Workshop B3 !', FALSE, NOW(), 1), \
            ('Merci upload MySQL', TRUE, NOW(), 2), \
            ('Partage reçu', FALSE, NOW(), 3)"
        );

        console.log('🔐 Inserting resource shares...');
        // Insertion de partages de ressources
        await pool.query(
            "INSERT INTO resource_share (IDresources_1, IDusers_1, permission, createdAt, IDresources, IDusers) VALUES \
            (1, 2, 'read', NOW(), 1, 1), \
            (2, 1, 'edit', NOW(), 2, 2)"
        );

        await pool.query('COMMIT');
        console.log('✅ Seeding completed successfully!');
        
        // Afficher un résumé
        const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [resources] = await pool.query('SELECT COUNT(*) as count FROM resources');
        const [files] = await pool.query('SELECT COUNT(*) as count FROM file');
        const [messages] = await pool.query('SELECT COUNT(*) as count FROM message');
        
        console.log('\n📊 Summary:');
        console.log(`   👥 Users: ${(users as any)[0].count}`);
        console.log(`   📚 Resources: ${(resources as any)[0].count}`);
        console.log(`   📁 Files: ${(files as any)[0].count}`);
        console.log(`   💬 Messages: ${(messages as any)[0].count}`);
        
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('❌ Seed error:', err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main().catch(console.error);
