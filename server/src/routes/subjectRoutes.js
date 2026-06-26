import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requireAnyPermission } from '../auth/permissions.js';
import db from '../db.js';
import { getStudentElectives, getElectives } from '../controllers/subjectController.js';
import { ensureStudentAdminSchema } from '../controllers/manageStudentController.js';

const router = express.Router();
const canReadSchoolData = requireAnyPermission(['timetable', 'nominations']);

router.get('/', ensureJWT, canReadSchoolData, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subject ORDER BY subject_id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/class-counts', ensureJWT, canReadSchoolData, async (req, res) => {
  try {
    await ensureStudentAdminSchema();
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
      WHERE
        st.status = 'active'
        AND (
          (sub.is_elective = FALSE AND tt.timetable_id IS NOT NULL)
          OR
          (
            sub.is_elective = TRUE
            AND sub.subject_id IN (st.x1_subject_id, st.x2_subject_id, st.x3_subject_id)
          )
        )
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

router.get('/findElective', ensureJWT, canReadSchoolData, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subject WHERE is_elective IS TRUE ORDER BY subject_id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/list', ensureJWT, canReadSchoolData, getStudentElectives);

router.post('/electiveName', ensureJWT, canReadSchoolData, getElectives);

export default router;
