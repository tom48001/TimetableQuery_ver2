import express from 'express';
import db from '../db.js';
import ensureJWT from '../auth/authMiddleware.js'; // 建議加權限控制

const router = express.Router();

// 所有班級相關操作都需要登入
router.use(ensureJWT);

// 取得所有班級列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT class_id, class_name FROM class ORDER BY class_name');
    res.json(rows);
  } catch (err) {
    console.error('取得班級失敗:', err);
    res.status(500).json({ error: '無法取得班級資料' });
  }
});

// 查詢某班級課表（by class_id）
router.get('/schedule/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
        t.teacher_name,
        s.subject_name AS subject,
        c.class_name,
        r.room_name AS room,
        tt.day_of_week,
        tt.period
      FROM timetable tt
      JOIN teacher t ON tt.teacher_id = t.teacher_id
      JOIN subject s ON tt.subject_id = s.subject_id
      JOIN class c ON tt.class_id = c.class_id
      JOIN room r ON tt.room_id = r.room_id
      WHERE tt.class_id = ?
      ORDER BY tt.day_of_week, tt.period`, [classId]);
    res.json(rows);
  } catch (err) {
    console.error('查詢課表失敗:', err);
    res.status(500).json({ error: '資料庫錯誤' });
  }
});

export default router;
