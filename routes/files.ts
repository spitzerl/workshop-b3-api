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
        return res.status(400).send('Aucun fichier n\'a été envoyé.');
    }

    const { originalname, mimetype, path: filePath } = req.file;
    const IDusers = req.body.IDusers;

    try {
        // Générer un ID unique pour la version du fichier
        const IDFileVersions = 'v1f' + Date.now();
        
        // D'abord créer la version du fichier
        await db.query(
            'INSERT INTO file_versions (IDFileVersions, uploadAt, versionNumber, filepath) VALUES (?, NOW(), 1, ?)',
            [IDFileVersions, filePath]
        );

        // Ensuite créer l'entrée principale du fichier
        const [fileResult]: any = await db.query(
            'INSERT INTO file (nameFile, typeFile, createdAt, IDusers, filepath, IDFileVersions, IDusers_1) VALUES (?, ?, NOW(), ?, ?, ?, ?)',
            [originalname, mimetype, IDusers, filePath, IDFileVersions, IDusers]
        );
        const IDfile = fileResult.insertId;

        res.status(201).json({
            message: 'Fichier téléchargé et données sauvegardées avec succès.',
            IDfile,
            IDFileVersions,
            filename: originalname,
        });

    } catch (err) {
        console.error('Erreur lors de la sauvegarde des données du fichier:', err);
        deleteFile(filePath);
        res.status(500).send('Erreur lors de la sauvegarde des données du fichier.');
    }
});

    /**
     * @route GET /files
     * @desc  Récupère la liste de tous les fichiers (principaux).
     */
    router.get('/', async (req, res) => {
        try {
            const [files] = await db.query('SELECT IDfile, nameFile, typeFile, createdAt, IDusers FROM file');
            res.json(files);
        } catch (err) {
            console.error('Erreur lors de la récupération des fichiers:', err);
            res.status(500).send('Erreur lors de la récupération de la liste des fichiers.');
        }
    });

    /**
     * @route GET /files/:IDfile
     * @desc  Télécharge un fichier spécifique par son ID de fichier.
     */
    router.get('/:IDfile', async (req, res) => {
        const { IDfile } = req.params;

        try {
            const [rows]: any = await db.query(
                'SELECT filepath, nameFile FROM file WHERE IDfile = ?',
                [IDfile]
            );

            if (rows.length === 0) {
                return res.status(404).send('Fichier non trouvé.');
            }

            const { filepath, nameFile } = rows[0];
            const absolutePath = path.resolve(filepath);

            if (fs.existsSync(absolutePath)) {
                // Utilisez res.download pour forcer le téléchargement avec le nom de fichier d'origine
                res.download(absolutePath, nameFile);
            } else {
                res.status(404).send('Fichier non trouvé sur le serveur.');
            }

        } catch (err) {
            console.error('Erreur lors de la récupération du chemin du fichier:', err);
            res.status(500).send('Erreur lors de la récupération du fichier.');
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
                return res.status(404).send('Fichier non trouvé.');
            }

            const { filepath } = rows[0];

            // 2. Supprime l'entrée de la table `file`
            await db.query('DELETE FROM file WHERE IDfile = ?', [IDfile]);

            // 3. Supprime le fichier physique
            deleteFile(filepath);

            res.status(200).send('Fichier supprimé avec succès.');

        } catch (err) {
            console.error('Erreur lors de la suppression du fichier:', err);
            res.status(500).send('Erreur lors de la suppression du fichier.');
        }
    });

export default router;