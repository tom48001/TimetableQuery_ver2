import express from 'express';
import db from '../db.js';
import ensureJWT from '../auth/authMiddleware.js';

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

export default router;
