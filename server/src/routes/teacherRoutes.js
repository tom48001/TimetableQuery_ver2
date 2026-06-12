import express from 'express';
import db from '../db.js';
import { ensureJWT } from '../auth/auth.js';
import { hasPermission, requireAnyPermission, requirePermission } from '../auth/permissions.js';
import { getAllTeachers, createTeacher, updateTeacher, deleteTeacher } from '../controllers/manageTeacherRoutes.js';
import { getTeachersSchedule } from '../controllers/teacherScheduleController.js';
import pool from '../db.js';

const router = express.Router();

router.use(ensureJWT);

router.get('/getAllTeachers', requirePermission('manageUsers'), getAllTeachers);
router.post('/', requirePermission('manageUsers'), createTeacher);
router.post('/schedule', requirePermission('timetable'), getTeachersSchedule);

router.get('/list', requireAnyPermission(['timetable', 'nominations', 'manageUsers']), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        t.teacher_id,
        t.teacher_name,
        COUNT(tt.timetable_id) AS lesson_count
      FROM teacher t
      LEFT JOIN timetable tt ON tt.teacher_id = t.teacher_id
      GROUP BY t.teacher_id, t.teacher_name
      ORDER BY
        CASE WHEN COUNT(tt.timetable_id) > 0 THEN 0 ELSE 1 END,
        t.teacher_name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Failed to load teachers:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load teachers.' });
  }
});

router.post('/free-teachers', requirePermission('timetable'), async (req, res) => {
  const { weekday, period } = req.body;

  if (!Array.isArray(period) || period.length === 0) {
    return res.status(400).json({ code: 'INVALID_PERIOD', error: 'Please select at least one period.' });
  }

  try {
    const placeholders = period.map(() => '?').join(', ');
    const [rows] = await db.query(
      `
      SELECT t.teacher_id, t.teacher_name
      FROM teacher t
      WHERE t.teacher_id NOT IN (
        SELECT tt.teacher_id
        FROM timetable tt
        WHERE tt.day_of_week = ? AND tt.period_id IN (${placeholders})
      )
      ORDER BY t.teacher_name
      `,
      [weekday, ...period]
    );

    res.json(rows);
  } catch (error) {
    console.error('Failed to load free teachers:', error);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load free teachers.' });
  }
});

router.post('/free-teachers-day', requirePermission('timetable'), async (req, res) => {
  const { weekday } = req.body;

  if (!weekday) {
    return res.status(400).json({ code: 'MISSING_WEEKDAY', error: 'Please select a date or weekday.' });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT
        t.teacher_id,
        t.teacher_name,
        tt.period_id,
        c.class_name
      FROM teacher t
      LEFT JOIN timetable tt
       ON tt.teacher_id = t.teacher_id
       AND tt.day_of_week = ?
       AND tt.period_id BETWEEN 1 AND 12
      LEFT JOIN class c ON tt.class_id = c.class_id
      ORDER BY t.teacher_name, tt.period_id
      `,
      [weekday]
    );

    const teacherMap = new Map();
    rows.forEach(row => {
      if (!teacherMap.has(row.teacher_id)) {
        teacherMap.set(row.teacher_id, {
          teacher_id: row.teacher_id,
          teacher_name: row.teacher_name,
          lessons: []
        });
      }

      if (row.period_id) {
        teacherMap.get(row.teacher_id).lessons.push({
          period_id: row.period_id,
          class_name: row.class_name
        });
      }
    });

    res.json(Array.from(teacherMap.values()));
  } catch (error) {
    console.error('Failed to load free teacher day schedule:', error);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load free teacher day schedule.' });
  }
});

router.get('/from-user/:userId', requireAnyPermission(['timetable', 'nominations', 'changePassword', 'manageUsers']), async (req, res) => {
  const { userId } = req.params;
  if (String(req.user.id) !== String(userId) && !hasPermission(req.user, 'manageUsers')) {
    return res.status(403).json({ code: 'NO_PERMISSION', error: 'No permission to view another user teacher account.' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT teacher_id FROM teacher WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ code: 'TEACHER_NOT_FOUND', error: 'Teacher account not found.' });
    }
    res.json({ teacher_id: rows[0].teacher_id });
  } catch (err) {
    console.error('Failed to load teacher_id:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load teacher account.' });
  }
});

router.put('/:id', requirePermission('manageUsers'), updateTeacher);
router.delete('/:id', requirePermission('manageUsers'), deleteTeacher);

export default router;
