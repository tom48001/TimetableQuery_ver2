import express from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import db from '../db.js';
import { checkRole } from '../auth/authMiddleware.js';
import {getAllTeachers, createTeacher, updateTeacher, deleteTeacher} from '../controllers/manageTeacherRoutes.js';

const router = express.Router();

// 所有路由都需登入 + 身份為 manager
router.use(ensureJWT);
router.use(checkRole('manager'));

// 取得所有老師資料
router.get('/', getAllTeachers);

// 新增老師
router.post('/', createTeacher);

// 更新老師
router.put('/:id', updateTeacher);

// 刪除老師
router.delete('/:id', deleteTeacher);

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

export default router;
