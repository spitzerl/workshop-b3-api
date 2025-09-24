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
    const IDusers = (req.body as any).IDusers;

    try {
        await db.query('START TRANSACTION');

        // 1. Insère une entrée dans la table `file`
        const [fileResult]: any = await db.query(
            'INSERT INTO file (nameFile, typeFile, createdAt, IDusers, IDFileVersions, IDusers_1) VALUES (?, ?, NOW(), ?, ?, ?)',
            [originalname, mimetype, IDusers, null, IDusers]
        );
        const IDfile = fileResult.insertId;

        // 2. Insère une entrée dans la table `file_versions` (version 1)
        const fileVersionId = `v1f${IDfile}`;
        await db.query(
            'INSERT INTO file_versions (IDFileVersions, uploadAt, IDfile, versionNumber, filepath) VALUES (?, NOW(), ?, ?, ?)',
            [fileVersionId, IDfile, 1, filePath]
        );

        // 3. Met à jour la table `file` pour lier à la version
        await db.query(
            'UPDATE file SET IDFileVersions = ? WHERE IDfile = ?',
            [fileVersionId, IDfile]
        );

        await db.query('COMMIT');

        res.status(201).json({
            message: 'Fichier téléchargé et données sauvegardées avec succès.',
            IDfile,
            IDFileVersions: fileVersionId,
            filename: originalname
        });

    } catch (err) {
        await db.query('ROLLBACK');
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
        const [files] = await db.query('SELECT * FROM file');
        res.json(files);
    } catch (err) {
        console.error('Erreur lors de la récupération des fichiers:', err);
        res.status(500).send('Erreur lors de la récupération de la liste des fichiers.');
    }
});

/**
 * @route GET /files/:IDFileVersions
 * @desc  Télécharge un fichier spécifique par son ID de version.
 */
router.get('/:IDFileVersions', async (req, res) => {
    const { IDFileVersions } = req.params;

    try {
        const [rows]: any = await db.query(
            'SELECT filepath FROM file_versions WHERE IDFileVersions = ?',
            [IDFileVersions]
        );

        if (rows.length === 0) {
            return res.status(404).send('Fichier non trouvé.');
        }

        const { filepath } = rows[0];
        const absolutePath = path.resolve(filepath);

        if (fs.existsSync(absolutePath)) {
            res.download(absolutePath);
        } else {
            res.status(404).send('Fichier non trouvé sur le serveur.');
        }

    } catch (err) {
        console.error('Erreur lors de la récupération du chemin du fichier:', err);
        res.status(500).send('Erreur lors de la récupération du fichier.');
    }
});

/**
 * @route PUT /files/:IDfile/update
 * @desc  Met à jour un fichier en créant une nouvelle version.
 */
router.put('/:IDfile/update', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Aucun nouveau fichier n\'a été envoyé.');
    }

    const { IDfile } = req.params;
    const { originalname, mimetype, path: newFilePath } = req.file;

    try {
        await db.query('START TRANSACTION');

        // 1. Récupère le dernier numéro de version
        const [latestVersion]: any = await db.query(
            'SELECT MAX(versionNumber) as maxVersion FROM file_versions WHERE IDfile = ?',
            [IDfile]
        );
        const newVersionNumber = (latestVersion[0].maxVersion || 0) + 1;

        // 2. Insère la nouvelle version dans la table `file_versions`
        const newFileVersionId = `v${newVersionNumber}f${IDfile}`;
        await db.query(
            'INSERT INTO file_versions (IDFileVersions, uploadAt, IDfile, versionNumber, filepath) VALUES (?, NOW(), ?, ?, ?)',
            [newFileVersionId, IDfile, newVersionNumber, newFilePath]
        );

        // 3. Met à jour l'entrée principale du fichier dans la table `file`
        await db.query(
            'UPDATE file SET nameFile = ?, typeFile = ?, IDFileVersions = ? WHERE IDfile = ?',
            [originalname, mimetype, newFileVersionId, IDfile]
        );

        await db.query('COMMIT');
        res.json({
            message: 'Version du fichier mise à jour avec succès.',
            IDFileVersions: newFileVersionId,
            filename: originalname
        });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Erreur lors de la mise à jour de la version du fichier:', err);
        deleteFile(newFilePath);
        res.status(500).send('Erreur lors de la mise à jour de la version du fichier.');
    }
});

/**
 * @route DELETE /files/:IDfile
 * @desc  Supprime un fichier et toutes ses versions associées.
 */
router.delete('/:IDfile', async (req, res) => {
    const { IDfile } = req.params;

    try {
        await db.query('START TRANSACTION');

        // 1. Récupère tous les chemins de fichiers pour les supprimer physiquement
        const [fileVersions]: any = await db.query(
            'SELECT filepath FROM file_versions WHERE IDfile = ?',
            [IDfile]
        );

        // 2. Supprime toutes les entrées de la table `file_versions`
        await db.query('DELETE FROM file_versions WHERE IDfile = ?', [IDfile]);

        // 3. Supprime l'entrée principale de la table `file`
        await db.query('DELETE FROM file WHERE IDfile = ?', [IDfile]);

        await db.query('COMMIT');

        // 4. Supprime les fichiers physiques
        fileVersions.forEach((version: any) => {
            deleteFile(version.filepath);
        });

        res.status(200).send('Fichier et toutes ses versions supprimés avec succès.');

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Erreur lors de la suppression du fichier:', err);
        res.status(500).send('Erreur lors de la suppression du fichier.');
    }
});

export default router;