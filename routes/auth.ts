import { Router, Request, Response } from 'express';
import pool from '../db';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
	IDusers: number;
	name: string;
	email: string;
	passwordHash: string;
	createdAt: string;
	updatedAt: string;
}

const router = Router();

// POST verify email/password combination
router.post('/verify', async (req: Request, res: Response) => {
	const { email, password } = req.body;

	// Validation d'entrée
	if (!email || !password) {
		return res.status(400).json({
			valid: false,
			message: 'Email and password are required'
		});
	}

	try {
		// Recherche de l'utilisateur par email
		const [rows] = await pool.query<UserRow[]>(
			'SELECT IDusers, name, email, passwordHash FROM users WHERE email = ?',
			[email]
		);

		const user = rows[0];

		// Vérifier si l'utilisateur existe et si le password correspond
		if (!user || user.passwordHash !== password) {
			// Réponse générique pour éviter l'énumération d'emails
			return res.status(401).json({
				valid: false,
				message: 'Invalid email or password'
			});
		}

		// Authentification réussie - retourner les infos utilisateur (sans le hash)
		return res.json({
			valid: true,
			user: {
				id: user.IDusers,
				name: user.name,
				email: user.email
			}
		});

	} catch (err: any) {
		return res.status(500).json({
			valid: false,
			message: 'Internal server error'
		});
	}
});

export default router;