import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|png|jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, PNG, JPG files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Apply to internship (Student only)
router.post('/', authenticateToken, requireRole('candidate'), upload.single('resume'), async (req, res) => {
  const { internship_id, cover_letter } = req.body;

  if (!internship_id || !cover_letter) {
    return res.status(400).json({ message: 'Internship ID and cover letter are required.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Resume file is required.' });
  }

  try {
    // Check if student already applied
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE internship_id = ? AND candidate_id = ?',
      [internship_id, req.user.userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied to this internship.' });
    }

    // Save application
    const resume_url = `/uploads/${req.file.filename}`;
    const [result] = await db.query(
      'INSERT INTO applications (internship_id, candidate_id, resume_url, cover_letter, status) VALUES (?, ?, ?, ?, ?)',
      [internship_id, req.user.userId, resume_url, cover_letter, 'Pending']
    );

    res.status(201).json({
      message: 'Application submitted successfully.',
      application: {
        id: result.insertId,
        internship_id,
        candidate_id: req.user.userId,
        resume_url,
        cover_letter,
        status: 'Pending'
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application.' });
  }
});

// Get logged in student's applications (Student only)
router.get('/my', authenticateToken, requireRole('candidate'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, i.title, i.company, i.location, i.stipend, i.type 
       FROM applications a 
       JOIN internships i ON a.internship_id = i.id 
       WHERE a.candidate_id = ? 
       ORDER BY a.applied_at DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error retrieving your applications.' });
  }
});

// Get applications submitted to employer's listings (Employer only)
router.get('/employer', authenticateToken, requireRole('employer'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, i.title as internship_title, u.name as candidate_name, u.email as candidate_email 
       FROM applications a 
       JOIN internships i ON a.internship_id = i.id 
       JOIN users u ON a.candidate_id = u.id 
       WHERE i.employer_id = ? 
       ORDER BY a.applied_at DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching applications for employer:', error);
    res.status(500).json({ message: 'Error retrieving applications.' });
  }
});

// Update application status (Employer only)
router.put('/:id/status', authenticateToken, requireRole('employer'), async (req, res) => {
  const { status } = req.body;
  const applicationId = req.params.id;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  const allowedStatuses = ['Pending', 'Reviewing', 'Interviewing', 'Accepted', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    // Verify employer owns the internship linked to this application
    const [appRow] = await db.query(
      `SELECT a.id, i.employer_id 
       FROM applications a 
       JOIN internships i ON a.internship_id = i.id 
       WHERE a.id = ?`,
      [applicationId]
    );

    if (appRow.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (appRow[0].employer_id !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized. You do not own the posting for this application.' });
    }

    await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, applicationId]);
    res.json({ message: 'Application status updated successfully.', id: applicationId, status });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating application status.' });
  }
});

export default router;
