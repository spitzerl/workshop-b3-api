import { Router, Request, Response } from 'express';
import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
	IDusers: number;
	name: string;
	email: string;
	passwordHash: string;
	createdAt: string;
	updatedAt: string;
}

const router = Router();

// GET all users
router.get('/', async (_req: Request, res: Response) => {
	try {
		const [rows] = await pool.query<UserRow[]>(
			'SELECT IDusers as id, name, email, passwordHash, createdAt, updatedAt FROM users'
		);
		// Ne pas renvoyer le passwordHash pour la sécurité
		const safeRows = rows.map(({ passwordHash, ...user }) => user);
		res.json(safeRows);
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
});

// GET user by ID or email
router.get('/:identifier', async (req: Request, res: Response) => {
	const { identifier } = req.params;
	try {
		const decodedIdentifier = decodeURIComponent(identifier);
		const isEmail = decodedIdentifier.includes('@');
		const query = isEmail
			? 'SELECT IDusers as id, name, email, passwordHash, createdAt, updatedAt FROM users WHERE email = ?'
			: 'SELECT IDusers as id, name, email, passwordHash, createdAt, updatedAt FROM users WHERE IDusers = ?';
		const [rows] = await pool.query<UserRow[]>(query, [decodedIdentifier]);
		const user = rows[0];
		if (!user) return res.status(404).json({ message: 'User not found' });
		// Ne pas renvoyer le passwordHash pour la sécurité
		const { passwordHash, ...safeUser } = user;
		res.json(safeUser);
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
});

// POST create user
router.post('/', async (req: Request, res: Response) => {
	const { name, email, passwordHash } = req.body as Partial<UserRow>;
	if (!email) {
		return res.status(400).json({ message: 'name, email and passwordHash are required' });
	}
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'INSERT INTO users (name, email, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
			[name, email, passwordHash]
		);
		return res.status(201).json({ id: result.insertId, name, email });
	} catch (err: any) {
		if (err && (err as any).code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Email already exists' });
		}
		return res.status(400).json({ message: (err as Error).message });
	}
});

// PUT update user by ID or email
router.put('/:identifier', async (req: Request, res: Response) => {
	const { identifier } = req.params;
	const decodedIdentifier = decodeURIComponent(identifier);
	const isEmail = decodedIdentifier.includes('@');
	const { name, email, passwordHash } = req.body as Partial<UserRow>;
	try {
		const fields: string[] = [];
		const values: unknown[] = [];
		if (name !== undefined) { fields.push('name = ?'); values.push(name); }
		if (email !== undefined) { fields.push('email = ?'); values.push(email); }
		if (passwordHash !== undefined) { fields.push('passwordHash = ?'); values.push(passwordHash); }
		if (fields.length === 0) {
			return res.status(400).json({ message: 'No fields to update' });
		}
		fields.push('updatedAt = NOW()');
		values.push(decodedIdentifier);
		const whereClause = isEmail ? 'email = ?' : 'IDusers = ?';
		const sql = `UPDATE users SET ${fields.join(', ')} WHERE ${whereClause}`;
		const [result] = await pool.query<ResultSetHeader>(sql, values);
		if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
		// Récupérer l'utilisateur mis à jour pour retourner l'ID correct
		const getUserQuery = isEmail ? 'SELECT IDusers as id FROM users WHERE email = ?' : 'SELECT IDusers as id FROM users WHERE IDusers = ?';
		const [userRows] = await pool.query<UserRow[]>(getUserQuery, [decodedIdentifier]);
		return res.json({ id: userRows[0]?.id || Number(decodedIdentifier), name, email });
	} catch (err: any) {
		if (err && (err as any).code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Email already exists' });
		}
		return res.status(400).json({ message: (err as Error).message });
	}
});

// DELETE user by ID or email
router.delete('/:identifier', async (req: Request, res: Response) => {
	const { identifier } = req.params;
	try {
		const decodedIdentifier = decodeURIComponent(identifier);
		const isEmail = decodedIdentifier.includes('@');
		const query = isEmail ? 'DELETE FROM users WHERE email = ?' : 'DELETE FROM users WHERE IDusers = ?';
		const [result] = await pool.query<ResultSetHeader>(query, [decodedIdentifier]);
		if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
		return res.status(204).send();
	} catch (err: any) {
		return res.status(500).json({ message: err.message });
	}
});




export default router;


