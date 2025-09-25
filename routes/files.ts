import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db'; // Assurez-vous que le chemin est correct

const router = express.Router();

// -------------------------------------------------------------
// Configuration de Multer pour le stockage des fichiers
// -------------------------------------------------------------
const storage = multer.diskStorage({
    // Définition du dossier de destination des fichiers
    destination: (req, file, cb) => {
        // Le dossier d'upload sera `public/uploads`
        const uploadDir = path.join(__dirname, '../public/uploads');

        // Crée le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    // Définition du nom du fichier
    filename: (req, file, cb) => {
        // Crée un nom de fichier unique pour éviter les conflits
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const upload = multer({ storage: storage });

// -------------------------------------------------------------
// Fonction utilitaire pour la suppression physique des fichiers
// -------------------------------------------------------------
const deleteFile = (filePath: string) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Erreur lors de la suppression du fichier:', err);
        } else {
            console.log('Fichier supprimé avec succès:', filePath);
        }
    });
};

// -------------------------------------------------------------
// Routes CRUD
// -------------------------------------------------------------

/**
 * @route POST /files/upload
 * @desc  Upload un nouveau fichier et enregistre ses métadonnées dans la base de données.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier n\'a été envoyé.' });
    }

    const { originalname, mimetype, path: filePath } = req.file;
    const { ownerId, isPublic = false } = req.body;

    if (!ownerId) {
        deleteFile(filePath);
        return res.status(400).json({ error: 'ownerId est requis.' });
    }

    try {
        // Générer un ID unique pour la version du fichier
        const IDFileVersions = 'v1f' + Date.now();

        // D'abord créer la version du fichier
        await db.query(
            'INSERT INTO file_versions (IDFileVersions, uploadAt, versionNumber, filepath) VALUES (?, NOW(), 1, ?)',
            [IDFileVersions, filePath]
        );

        // Ensuite créer l'entrée principale du fichier avec support isPublic
        const [fileResult]: any = await db.query(
            'INSERT INTO file (nameFile, typeFile, createdAt, IDusers, filepath, IDFileVersions, IDusers_1, isPublic) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)',
            [originalname, mimetype, ownerId, filePath, IDFileVersions, ownerId, isPublic ? 1 : 0]
        );
        const IDfile = fileResult.insertId;

        res.status(201).json({
            id: IDfile,
            name: originalname,
            mimeType: mimetype,
            ownerId: ownerId,
            isPublic: isPublic,
            createdAt: new Date().toISOString(),
            path: filePath
        });

    } catch (err) {
        console.error('Erreur lors de la sauvegarde des données du fichier:', err);
        deleteFile(filePath);
        res.status(500).json({ error: 'Erreur lors de la sauvegarde des données du fichier.' });
    }
});

    /**
     * @route GET /files/public
     * @desc  Récupère tous les fichiers publics.
     */
    router.get('/public', async (req, res) => {
        try {
            const [files] = await db.query(
                `SELECT f.IDfile as id, f.nameFile as name, f.typeFile as mimeType,
                 f.createdAt, f.IDusers as ownerId, 'true' as isPublic
                 FROM file f
                 WHERE f.isPublic = 1`
            );
            res.json(files);
        } catch (err) {
            console.error('Erreur lors de la récupération des fichiers publics:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des fichiers publics.' });
        }
    });

    /**
     * @route GET /files/user/:userId
     * @desc  Récupère tous les fichiers d'un utilisateur spécifique.
     */
    router.get('/user/:userId', async (req, res) => {
        const { userId } = req.params;
        try {
            const [files] = await db.query(
                `SELECT f.IDfile as id, f.nameFile as name, f.typeFile as mimeType,
                 f.createdAt, f.IDusers as ownerId,
                 CASE WHEN f.isPublic = 1 THEN 'true' ELSE 'false' END as isPublic
                 FROM file f
                 WHERE f.IDusers = ?`,
                [userId]
            );
            res.json(files);
        } catch (err) {
            console.error('Erreur lors de la récupération des fichiers utilisateur:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des fichiers utilisateur.' });
        }
    });

    /**
     * @route GET /files
     * @desc  Récupère la liste de tous les fichiers (principaux).
     */
    router.get('/', async (req, res) => {
        try {
            const [files] = await db.query(
                `SELECT f.IDfile as id, f.nameFile as name, f.typeFile as mimeType,
                 f.createdAt, f.IDusers as ownerId,
                 CASE WHEN f.isPublic = 1 THEN 'true' ELSE 'false' END as isPublic
                 FROM file f`
            );
            res.json(files);
        } catch (err) {
            console.error('Erreur lors de la récupération des fichiers:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération de la liste des fichiers.' });
        }
    });

    /**
     * @route GET /files/:IDfile/download
     * @desc  Télécharge un fichier spécifique par son ID sous forme de bytes.
     */
    router.get('/:IDfile/download', async (req, res) => {
        const { IDfile } = req.params;

        try {
            const [rows]: any = await db.query(
                'SELECT filepath, nameFile FROM file WHERE IDfile = ?',
                [IDfile]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Fichier non trouvé.' });
            }

            const { filepath, nameFile } = rows[0];
            const absolutePath = path.resolve(filepath);

            if (fs.existsSync(absolutePath)) {
                // Pour Flutter, renvoyer le fichier avec les bons headers
                res.setHeader('Content-Disposition', `attachment; filename="${nameFile}"`);
                res.sendFile(absolutePath);
            } else {
                res.status(404).json({ error: 'Fichier non trouvé sur le serveur.' });
            }

        } catch (err) {
            console.error('Erreur lors de la récupération du chemin du fichier:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération du fichier.' });
        }
    });

    /**
     * @route GET /files/:IDfile
     * @desc  Récupère les métadonnées d'un fichier spécifique.
     */
    router.get('/:IDfile', async (req, res) => {
        const { IDfile } = req.params;

        try {
            const [rows]: any = await db.query(
                `SELECT f.IDfile as id, f.nameFile as name, f.typeFile as mimeType,
                 f.createdAt, f.IDusers as ownerId,
                 CASE WHEN f.isPublic = 1 THEN 'true' ELSE 'false' END as isPublic
                 FROM file f WHERE f.IDfile = ?`,
                [IDfile]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Fichier non trouvé.' });
            }

            res.json(rows[0]);

        } catch (err) {
            console.error('Erreur lors de la récupération des métadonnées du fichier:', err);
            res.status(500).json({ error: 'Erreur lors de la récupération des métadonnées du fichier.' });
        }
    });

    /**
     * @route PUT /files/:IDfile
     * @desc  Met à jour un fichier existant en le remplaçant.
     */
    router.put('/:IDfile', upload.single('file'), async (req, res) => {
        if (!req.file) {
            return res.status(400).send('Aucun nouveau fichier n\'a été envoyé.');
        }

        const { IDfile } = req.params;
        const { originalname, mimetype, path: newFilePath } = req.file;

        try {
            // 1. Récupère l'ancien chemin du fichier pour le supprimer
            const [rows]: any = await db.query('SELECT filepath FROM file WHERE IDfile = ?', [IDfile]);
            if (rows.length > 0) {
                deleteFile(rows[0].filepath);
            }

            // 2. Met à jour l'entrée du fichier dans la table `file`
            await db.query(
                'UPDATE file SET nameFile = ?, typeFile = ?, createdAt = NOW(), filepath = ? WHERE IDfile = ?',
                [originalname, mimetype, newFilePath, IDfile]
            );

            res.json({
                message: 'Fichier mis à jour avec succès.',
                IDfile,
                filename: originalname,
            });

        } catch (err) {
            console.error('Erreur lors de la mise à jour du fichier:', err);
            deleteFile(newFilePath);
            res.status(500).send('Erreur lors de la mise à jour du fichier.');
        }
    });

    /**
     * @route DELETE /files/:IDfile
     * @desc  Supprime un fichier et son entrée dans la base de données.
     */
    router.delete('/:IDfile', async (req, res) => {
        const { IDfile } = req.params;

        try {
            // 1. Récupère le chemin du fichier pour le supprimer physiquement
            const [rows]: any = await db.query('SELECT filepath FROM file WHERE IDfile = ?', [IDfile]);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Fichier non trouvé.' });
            }

            const { filepath } = rows[0];

            // 2. Supprime l'entrée de la table `file`
            await db.query('DELETE FROM file WHERE IDfile = ?', [IDfile]);

            // 3. Supprime le fichier physique
            deleteFile(filepath);

            res.status(200).json({ message: 'Fichier supprimé avec succès.' });

        } catch (err) {
            console.error('Erreur lors de la suppression du fichier:', err);
            res.status(500).json({ error: 'Erreur lors de la suppression du fichier.' });
        }
    });

export default router;