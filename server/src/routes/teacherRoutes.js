import express from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import db from '../db.js';
import { checkRole } from '../auth/authMiddleware.js';
import {getAllTeachers, createTeacher, updateTeacher, deleteTeacher} from '../controllers/manageTeacherRoutes.js';
import { getTeachersSchedule } from '../controllers/teacherScheduleController.js';

const router = express.Router();

// 所有路由都需登入 + 身份為 manager
router.use(ensureJWT);
//router.use(checkRole('manager'));

// 只對管理功能要求 manager
router.use(['/','/:id'], checkRole('manager'));

// 取得所有老師資料
router.get('/', getAllTeachers);

// 新增老師
router.post('/', createTeacher, checkRole('manager'));

// 查詢多位老師課表
router.post('/schedule', getTeachersSchedule);

// 更新老師
router.put('/:id', updateTeacher, checkRole('manager'));

// 刪除老師
router.delete('/:id', deleteTeacher, checkRole('manager'));

// 取得 teacher 表中老師名單
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT teacher_id, teacher_name FROM teacher');
    res.json(rows);
  } catch (err) {
    console.error('取得老師失敗:', err);
    res.status(500).json({ error: '無法取得老師資料' });
  }
});

// 根據老師 ID 查詢課表
router.post('/free-teachers', async (req, res) => {
  const { weekday, period } = req.body;
  try {
    const [rows] = await db.query(
      `SELECT t.teacher_id, t.teacher_name
       FROM teacher t
       WHERE t.teacher_id NOT IN (
         SELECT tt.teacher_id
         FROM timetable tt
         WHERE tt.day_of_week = ? AND tt.period_id = ?)
       ORDER BY t.teacher_name`, [weekday, period]);
    res.json(rows);
  } catch (error) {
    console.error('查詢空堂失敗:', error);
    res.status(500).json({ error: '資料庫錯誤' });
  }
});

// routes/swapRoutes.js
router.get('/available-teachers', ensureJWT, async (req, res) => {
  const { original_teacher_id, day, period, subject } = req.query;

  try {
    const [rows] = await db.query(`
      SELECT DISTINCT t.teacher_id, t.teacher_name, s.subject_name
      FROM teacher t
      JOIN teacher_subjects s ON t.teacher_id = s.teacher_id
      WHERE s.subject_name = ?
        AND t.teacher_id != ?
        AND NOT EXISTS (
          SELECT 1 FROM timetable tt
          WHERE tt.teacher_id = t.teacher_id
            AND tt.day = ?
            AND tt.period = ?
        )
    `, [subject, original_teacher_id, day, period]);

    res.json(rows);
  } catch (err) {
    console.error('查找可供調課老師失敗:', err);
    res.status(500).json({ error: '無法查找老師' });
  }
});

export default router;
