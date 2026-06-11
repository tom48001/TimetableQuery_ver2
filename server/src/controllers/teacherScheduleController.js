import db from '../db.js';

function normalizeTeacherIds(value) {
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap(item => String(item || '').split(','))
    .map(item => Number(item.trim()))
    .filter(Number.isFinite);
}

export const getTeachersSchedule = async (req, res) => {
  const teacherIds = normalizeTeacherIds(req.body.teacherIds || req.body.teacherId);

  if (teacherIds.length === 0) {
    return res.status(400).json({ error: 'teacherIds is required' });
  }

  try {
    const placeholders = teacherIds.map(() => '?').join(', ');
    const sql = `
      SELECT
        t.teacher_id,
        te.teacher_name,
        c.class_name,
        r.room_id,
        r.room_name,
        s.subject_id,
        s.subject_name,
        t.day_of_week AS day,
        p.period_id AS period,
        p.period_name
      FROM timetable t
      JOIN class c ON t.class_id = c.class_id
      JOIN room r ON t.room_id = r.room_id
      JOIN subject s ON t.subject_id = s.subject_id
      JOIN period p ON t.period_id = p.period_id
      JOIN teacher te ON t.teacher_id = te.teacher_id
      WHERE t.teacher_id IN (${placeholders})
      ORDER BY FIELD(t.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'), p.period_id, te.teacher_name
    `;

    const [rows] = await db.query(sql, teacherIds);
    res.json(rows);
  } catch (err) {
    console.error('Failed to load teacher schedule:', err);
    res.status(500).json({ error: 'Failed to load teacher schedule', detail: err.message });
  }
};
