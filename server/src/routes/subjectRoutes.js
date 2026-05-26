import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import db from '../db.js';
import { getStudentElectives, getElectives } from '../controllers/subjectController.js';

const router = express.Router();

router.get('/', ensureJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subject ORDER BY subject_id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/class-counts', ensureJWT, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        sub.subject_id,
        c.class_id,
        COUNT(DISTINCT st.student_id) AS student_count
      FROM subject sub
      JOIN class c
      JOIN student st
        ON st.class_id = c.class_id
      LEFT JOIN timetable tt
        ON tt.subject_id = sub.subject_id
       AND tt.class_id = c.class_id
      LEFT JOIN student_subject ss
        ON ss.student_id = st.student_id
       AND ss.subject_id = sub.subject_id
      WHERE
        (sub.is_elective = FALSE AND tt.timetable_id IS NOT NULL)
        OR
        (sub.is_elective = TRUE AND ss.subject_id IS NOT NULL)
      GROUP BY sub.subject_id, c.class_id
      ORDER BY
        sub.subject_id,
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        FIELD(SUBSTRING(c.class_name, 2, 1), 'M', 'A', 'R', 'Y'),
        c.class_name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subject class counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/findElective', ensureJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subject WHERE is_elective IS TRUE ORDER BY subject_id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/list', ensureJWT, getStudentElectives);

router.post('/electiveName', ensureJWT, getElectives);

export default router;
