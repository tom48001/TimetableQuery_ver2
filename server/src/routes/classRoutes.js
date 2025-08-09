import express from 'express';
import db from '../db.js';
import ensureJWT from '../auth/authMiddleware.js'; // 建議加權限控制

const router = express.Router();

// 所有班級相關操作都需要登入
router.use(ensureJWT);

router.post('/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const [rows] = await db.query('SELECT class_name FROM class where class_id = ?', [classId]);
    res.json(rows);
  } catch (err) {
    console.error('取得班級失敗:', err);
    res.status(500).json({ error: '無法取得班級資料' });
  }
});

// 取得所有班級列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT class_id, class_name FROM class ORDER BY class_id');
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
    s.subject_name,
    c.class_name,
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
    p.start_time`, [classId]);
    res.json(rows);
  } catch (err) {
    console.error('查詢課表失敗:', err);
    res.status(500).json({ error: '資料庫錯誤' });
  }
});

export default router;
