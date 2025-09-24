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
			'SELECT IDusers, name, email, passwordHash, createdAt, updatedAt FROM users'
		);
		res.json(rows);
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
});

// GET user by ID
router.get('/:id', async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const [rows] = await pool.query<UserRow[]>(
			'SELECT IDusers, name, email, passwordHash, createdAt, updatedAt FROM users WHERE IDusers = ?',
			[id]
		);
		const user = rows[0];
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch (err: any) {
		res.status(500).json({ message: err.message });
	}
});

// POST create user
router.post('/', async (req: Request, res: Response) => {
	const { name, email, passwordHash } = req.body as Partial<UserRow>;
	if (!name || !email || !passwordHash) {
		return res.status(400).json({ message: 'name, email and passwordHash are required' });
	}
	try {
		const [result] = await pool.query<ResultSetHeader>(
			'INSERT INTO users (name, email, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
			[name, email, passwordHash]
		);
		return res.status(201).json({ IDusers: result.insertId, name, email });
	} catch (err: any) {
		if (err && (err as any).code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Email already exists' });
		}
		return res.status(400).json({ message: (err as Error).message });
	}
});

// PUT update user
router.put('/:id', async (req: Request, res: Response) => {
	const { id } = req.params;
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
		values.push(id);
		const sql = `UPDATE users SET ${fields.join(', ')} WHERE IDusers = ?`;
		const [result] = await pool.query<ResultSetHeader>(sql, values);
		if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
		return res.json({ IDusers: Number(id), name, email });
	} catch (err: any) {
		if (err && (err as any).code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Email already exists' });
		}
		return res.status(400).json({ message: (err as Error).message });
	}
});

// DELETE user
router.delete('/:id', async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const [result] = await pool.query<ResultSetHeader>('DELETE FROM users WHERE IDusers = ?', [id]);
		if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
		return res.status(204).send();
	} catch (err: any) {
		return res.status(500).json({ message: err.message });
	}
});



// PUT update user
router.put('/:id', async (req: Request, res: Response) => {
	const { id } = req.params;
	const { name, email, passwordHash } = req.body as Partial<UserRow>;

	try {
		const fields: string[] = [];
		const values: unknown[] = [];

		if (name !== undefined) {
			fields.push('name = ?');
			values.push(name);
		}
		if (email !== undefined) {
			fields.push('email = ?');
			values.push(email);
		}
		if (passwordHash !== undefined) {
			fields.push('passwordHash = ?');
			values.push(passwordHash);
		}

		if (fields.length === 0) {
			return res.status(400).json({ message: 'No fields to update' });
		}

		// Ajout du champ updatedAt
		fields.push('updatedAt = NOW()');

		// Ajout de l'id à la fin
		values.push(id);

		const sql = `UPDATE users SET ${fields.join(', ')} WHERE IDusers = ?`;
		const [result] = await pool.query<ResultSetHeader>(sql, values);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Retourne les champs mis à jour (si fournis)
		return res.json({
			IDusers: Number(id),
			...(name !== undefined && { name }),
			...(email !== undefined && { email }),
		});
	} catch (err: any) {
		if (err?.code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Email already exists' });
		}
		return res.status(400).json({ message: (err as Error).message });
	}
});

export default router;


