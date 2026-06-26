import express from 'express';
import db from '../db.js';
import { ensureJWT } from '../auth/auth.js';
import { requireAnyPermission } from '../auth/permissions.js';

const router = express.Router();

router.use(ensureJWT);
router.use(requireAnyPermission(['timetable', 'nominations', 'manageStudents']));

router.post('/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const [rows] = await db.query('SELECT class_name FROM class WHERE class_id = ?', [classId]);
    res.json(rows);
  } catch (err) {
    console.error('Failed to load class:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load class.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT class_id, class_name, grade_level
      FROM class
      ORDER BY
        CAST(LEFT(class_name, 1) AS UNSIGNED),
        FIELD(SUBSTRING(class_name, 2, 1), 'M', 'A', 'R', 'Y'),
        class_name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to load classes:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load classes.' });
  }
});

router.get('/schedule/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT
        t.teacher_name,
        s.subject_id,
        s.subject_name,
        c.class_name,
        r.room_id,
        r.room_name,
        tt.day_of_week,
        p.period_name
      FROM timetable tt
      JOIN teacher t ON tt.teacher_id = t.teacher_id
      JOIN subject s ON tt.subject_id = s.subject_id
      JOIN class c ON tt.class_id = c.class_id
      JOIN room r ON tt.room_id = r.room_id
      JOIN period p ON tt.period_id = p.period_id
      WHERE tt.class_id = ?
      ORDER BY
        FIELD(tt.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
        p.start_time`,
      [classId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to load class schedule:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load class schedule.' });
  }
});

export default router;
