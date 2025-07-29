import express from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import db from '../db.js';
import { checkRole } from '../auth/authMiddleware.js';
import {getAllTeachers, createTeacher, updateTeacher, deleteTeacher} from '../controllers/manageTeacherRoutes.js';
import { getTeachersSchedule } from '../controllers/teacherScheduleController.js';
import pool from '../db.js';

const Roles = {
  MANAGER:'manager',
  TEACHER:'teacher',

};

const router = express.Router();

// 所有路由都需登入 + 身份為 manager
router.use(ensureJWT);
//router.use(checkRole(Roles.MANAGER));

// 只對管理功能要求 manager
// 取得所有老師資料 

router.use('/getAll', checkRole(Roles.MANAGER));
// 取得所有老師資料 
router.get('/getAllTeachers', getAllTeachers);

// 新增老師
router.post('/', createTeacher, checkRole(Roles.MANAGER));

// 查詢多位老師課表
router.post('/schedule', getTeachersSchedule);

// 更新老師
router.put('/:id', updateTeacher, checkRole(Roles.MANAGER));

// 刪除老師
router.delete('/:id', deleteTeacher, checkRole(Roles.MANAGER));

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

  // 檢查 period 是否為非空陣列
  if (!Array.isArray(period) || period.length === 0) {
    return res.status(400).json({ error: 'period 必須是非空陣列' });
  }

  try {
    // 動態生成 SQL 佔位符 (?, ?, ...)
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
      [weekday, ...period]  // 展開陣列進入佔位符
    );

    res.json(rows);
  } catch (error) {
    console.error('查詢空堂失敗:', error);
    res.status(500).json({ error: '資料庫錯誤' });
  }
});

router.get('/from-user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT teacher_id FROM teacher WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到對應的 teacher' });
    }
    res.json({ teacher_id: rows[0].teacher_id });
  } catch (err) {
    console.error('查詢 teacher_id 失敗:', err);
    res.status(500).json({ error: '資料庫錯誤' });
  }
});

export default router;
