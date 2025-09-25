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

// GET all resources with pagination and search
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let query = 'SELECT IDresources as id, title, description, IDusers, IDowner, createdAt, updatedAt FROM resources';
    let countQuery = 'SELECT COUNT(*) as total FROM resources';
    const queryParams: any[] = [];

    if (search) {
      query += ' WHERE title LIKE ? OR description LIKE ?';
      countQuery += ' WHERE title LIKE ? OR description LIKE ?';
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    // Execute queries
    const [rows] = await pool.query<ResourceRow[]>(query, queryParams);
    const [countResult] = await pool.query<any[]>(countQuery, search ? [`%${search}%`, `%${search}%`] : []);
    const total = countResult[0].total;

    res.json({
      resources: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET resource by ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<ResourceRow[]>(
      'SELECT IDresources as id, title, description, IDusers, IDowner, createdAt, updatedAt FROM resources WHERE IDresources = ?',
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
    return res.status(201).json({ id: result.insertId, title, description, IDowner });
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
      id: Number(id),
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
