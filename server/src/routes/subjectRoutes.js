import express, { Router } from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import db from '../db.js';
import { getStudentElectives, getElectives } from '../controllers/subjectController.js';

const router = express.Router();

// 所有路由需登入才能查
router.use(ensureJWT);

router.get('/findElective', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subject WHERE is_elective is TRUE');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/list', getStudentElectives);

router.post('/electiveName', getElectives);

export default router;