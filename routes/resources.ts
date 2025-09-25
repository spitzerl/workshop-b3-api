import { Router, Request, Response } from 'express';
import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface ResourceRow extends RowDataPacket {
  IDresources: number;
  title: string;
  description: string | null;
  IDusers: number | null;
  IDowner: number;
  createdAt: string;
  updatedAt: string;
}

const router = Router();

// GET all resources
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<ResourceRow[]>(
      'SELECT IDresources, title, description, IDusers, IDowner, createdAt, updatedAt FROM resources'
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET resource by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<ResourceRow[]>(
      'SELECT IDresources, title, description, IDusers, IDowner, createdAt, updatedAt FROM resources WHERE IDresources = ?',
      [id]
    );
    const resource = rows[0];
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST create resource
router.post('/', async (req: Request, res: Response) => {
  const { title, description, IDusers, IDowner } = req.body as Partial<ResourceRow>;
  if (!title || !IDowner) {
    return res.status(400).json({ message: 'title and IDowner are required' });
  }
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO resources (title, description, IDusers, IDowner, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [title, description ?? null, IDusers ?? null, IDowner]
    );
    return res.status(201).json({ IDresources: result.insertId, title, description, IDowner });
  } catch (err: any) {
    return res.status(400).json({ message: (err as Error).message });
  }
});

// PUT update resource
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, IDusers, IDowner } = req.body as Partial<ResourceRow>;

  try {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (IDusers !== undefined) { fields.push('IDusers = ?'); values.push(IDusers); }
    if (IDowner !== undefined) { fields.push('IDowner = ?'); values.push(IDowner); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    fields.push('updatedAt = NOW()');
    values.push(id);

    const sql = `UPDATE resources SET ${fields.join(', ')} WHERE IDresources = ?`;
    const [result] = await pool.query<ResultSetHeader>(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    return res.json({
      IDresources: Number(id),
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(IDusers !== undefined && { IDusers }),
      ...(IDowner !== undefined && { IDowner }),
    });
  } catch (err: any) {
    return res.status(400).json({ message: (err as Error).message });
  }
});

// DELETE resource
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM resources WHERE IDresources = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Resource not found' });
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
