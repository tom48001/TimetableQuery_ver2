import pool from '../db.js';

// 查詢某位老師的課堂清單（供挑選要調的堂）
export const getTeacherLessons = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT 
        tt.timetable_id,
        c.class_name,
        s.subject_name AS subject,
        tt.day_of_week AS day,
        tt.period
      FROM timetable tt
      JOIN class c ON tt.class_id = c.class_id
      JOIN subject s ON tt.subject_id = s.subject_id
      WHERE tt.teacher_id = ?
      ORDER BY tt.day_of_week, tt.period`, [teacherId]);
    res.json(rows);
  } catch (err) {
    console.error('查詢老師課堂失敗:', err);
    res.status(500).json({ error: '無法取得老師課堂清單' });
  }
};

// 根據節次,科目，查可代課老師（沒課+同科）
export const getSubstituteCandidates = async (req, res) => {
  const { day, period, subjectId } = req.body;

  if (!day || !period || !subjectId) {
    return res.status(400).json({ error: '請提供 day, period, subjectId' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT t.teacher_id, t.teacher_name
      FROM teacher t
      WHERE t.teacher_id NOT IN (
        SELECT tt.teacher_id
        FROM timetable tt
        WHERE tt.day_of_week = ? AND tt.period = ?
      )
      AND t.teacher_id IN (
        SELECT teacher_id
        FROM timetable
        WHERE subject_id = ?
      )
      ORDER BY t.teacher_name
    `, [day, period, subjectId]);

    res.json(rows);
  } catch (err) {
    console.error('查詢可代課老師失敗:', err);
    res.status(500).json({ error: '無法取得可代課老師名單' });
  }
};
