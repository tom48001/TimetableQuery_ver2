import express from 'express';
import db from '../db.js';
import { ensureJWT } from '../auth/auth.js';

const router = express.Router();

// 所有房間列表
router.get('/', ensureJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT room_id, room_name FROM room');
    res.json(rows);
  } catch (err) {
    console.error('取得房間列表失敗:', err);
    res.status(500).json({ error: '無法取得房間資料' });
  }
});

// 查詢某房間的課表
router.get('/schedule/:roomId', ensureJWT, async (req, res) => {
  const { roomId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
        t.teacher_name,
        c.class_name,
        s.subject_name,
        p.period_name,
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
    console.error('查詢房間課表失敗:', err);
    res.status(500).json({ error: '資料庫錯誤' });
  }
});

export default router;
