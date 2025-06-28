// controllers/observationController.js
import db from '../db.js';

export const getObservationSchedule = async (req, res) => {
  const { observerIds, targetId } = req.body;

  if (!Array.isArray(observerIds) || !targetId) {
    return res.status(400).json({ error: '請提供觀課老師與被觀課老師 ID' });
  }

  try {
    console.log('observation SQL');
    // 被觀課老師的課表
    const [targetRows] = await db.query(
      `SELECT t.day_of_week AS day, p.period_id, p.period_name, c.class_name, s.subject_name, r.room_name
       FROM timetable t
       JOIN class c ON t.class_id = c.class_id
       JOIN subject s ON t.subject_id = s.subject_id
       JOIN room r ON t.room_id = r.room_id
       JOIN period p ON t.period_id = p.period_id
       WHERE t.teacher_id = ?`, [targetId]
    );

    // 觀課老師們的空堂
    const [observerFreeRows] = await db.query(
      `SELECT d.day_of_week AS day, p.period_id, p.period_name
       FROM (
         SELECT 'Mon' AS day_of_week UNION ALL SELECT 'Tue' UNION ALL SELECT 'Wed' 
         UNION ALL SELECT 'Thu' UNION ALL SELECT 'Fri'
       ) d
       JOIN period p ON 1=1
       WHERE NOT EXISTS (
         SELECT 1
         FROM timetable t
         WHERE t.day_of_week = d.day_of_week AND t.period_id = p.period_id
           AND t.teacher_id IN (?)
       )
       ORDER BY FIELD(d.day_of_week, 'Mon','Tue','Wed','Thu','Fri'), p.period_id`,
       [observerIds]
    );

    res.json({ targetSchedule: targetRows, observerFree: observerFreeRows });

  } catch (err) {
    console.error('取得觀課時段失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};
