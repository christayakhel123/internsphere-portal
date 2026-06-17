import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all internships with search & filtering
router.get('/', async (req, res) => {
  const { search, type, location } = req.query;
  let sql = 'SELECT * FROM internships';
  let params = [];
  let conditions = [];

  if (search) {
    conditions.push('(title LIKE ? OR company LIKE ? OR description LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }

  if (location) {
    conditions.push('location LIKE ?');
    params.push(`%${location}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Error retrieving internships.' });
  }
});

// Get internship postings created by current employer user
router.get('/my-postings', authenticateToken, requireRole('employer'), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM internships WHERE employer_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employer postings:', error);
    res.status(500).json({ message: 'Error retrieving your postings.' });
  }
});

// Get single internship by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM internships WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Internship listing not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching internship details:', error);
    res.status(500).json({ message: 'Error retrieving internship details.' });
  }
});

// Create new internship posting
router.post('/', authenticateToken, requireRole('employer'), async (req, res) => {
  const { title, company, description, requirements, location, stipend, duration, type } = req.body;

  if (!title || !company || !description || !requirements || !location || !stipend || !duration || !type) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO internships (title, company, description, requirements, location, stipend, duration, type, employer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, company, description, requirements, location, stipend, duration, type, req.user.userId]
    );

    res.status(201).json({
      message: 'Internship posting created successfully.',
      internship: {
        id: result.insertId,
        title,
        company,
        description,
        requirements,
        location,
        stipend,
        duration,
        type,
        employer_id: req.user.userId
      }
    });
  } catch (error) {
    console.error('Error creating internship posting:', error);
    res.status(500).json({ message: 'Error posting internship.' });
  }
});

// Update internship posting
router.put('/:id', authenticateToken, requireRole('employer'), async (req, res) => {
  const { title, company, description, requirements, location, stipend, duration, type } = req.body;
  const internshipId = req.params.id;

  if (!title || !company || !description || !requirements || !location || !stipend || !duration || !type) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check ownership
    const [existing] = await db.query('SELECT employer_id FROM internships WHERE id = ?', [internshipId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Internship not found.' });
    }

    if (existing[0].employer_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this posting.' });
    }

    await db.query(
      'UPDATE internships SET title = ?, company = ?, description = ?, requirements = ?, location = ?, stipend = ?, duration = ?, type = ? WHERE id = ?',
      [title, company, description, requirements, location, stipend, duration, type, internshipId]
    );

    res.json({
      message: 'Internship posting updated successfully.',
      internship: {
        id: internshipId,
        title,
        company,
        description,
        requirements,
        location,
        stipend,
        duration,
        type,
        employer_id: req.user.userId
      }
    });
  } catch (error) {
    console.error('Error updating internship:', error);
    res.status(500).json({ message: 'Error updating internship posting.' });
  }
});

// Delete internship posting
router.delete('/:id', authenticateToken, requireRole('employer'), async (req, res) => {
  const internshipId = req.params.id;

  try {
    // Check ownership
    const [existing] = await db.query('SELECT employer_id FROM internships WHERE id = ?', [internshipId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Internship not found.' });
    }

    if (existing[0].employer_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this posting.' });
    }

    await db.query('DELETE FROM internships WHERE id = ?', [internshipId]);
    res.json({ message: 'Internship posting deleted successfully.' });
  } catch (error) {
    console.error('Error deleting internship:', error);
    res.status(500).json({ message: 'Error deleting internship posting.' });
  }
});

export default router;
