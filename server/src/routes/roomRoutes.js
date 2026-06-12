import express from 'express';
import db from '../db.js';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';

const router = express.Router();

router.use(ensureJWT);
router.use(requirePermission('timetable'));

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT room_id, room_name FROM room ORDER BY room_name');
    res.json(rows);
  } catch (err) {
    console.error('Failed to load rooms:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load rooms.' });
  }
});

router.get('/schedule/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT
        t.teacher_name AS teacher_name,
        c.class_name AS class_name,
        s.subject_id,
        s.subject_name AS subject_name,
        p.period_name,
        p.start_time,
        p.end_time,
        tt.day_of_week
      FROM timetable tt
      JOIN teacher t ON tt.teacher_id = t.teacher_id
      JOIN class c ON tt.class_id = c.class_id
      JOIN subject s ON tt.subject_id = s.subject_id
      JOIN period p ON tt.period_id = p.period_id
      WHERE tt.room_id = ?
      ORDER BY
        FIELD(tt.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
        p.start_time`,
      [roomId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to load room schedule:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load room schedule.' });
  }
});

export default router;
