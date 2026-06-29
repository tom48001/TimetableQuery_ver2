import pool from '../db.js';

export const getTeacherLessons = async (req, res) => {
  const teacherId = Number(req.params.teacherId);

  if (!Number.isFinite(teacherId) || teacherId <= 0) {
    return res.status(400).json({ error: 'Missing teacherId.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         tt.timetable_id,
         c.class_name,
         c.class_id,
         s.subject_name AS subject,
         s.subject_name AS subject_name,
         s.subject_id,
         s.subject_name_zh,
         s.subject_name_en,
         tt.day_of_week AS day,
         tt.period_id AS period
       FROM timetable tt
       JOIN class c ON tt.class_id = c.class_id
       JOIN subject s ON tt.subject_id = s.subject_id
       WHERE tt.teacher_id = ?
         AND COALESCE(s.is_elective, FALSE) = FALSE
         AND s.subject_name NOT LIKE '%分組%'
         AND c.class_name NOT LIKE '%分組%'
       ORDER BY FIELD(tt.day_of_week, 'Mon','Tue','Wed','Thu','Fri','Sat'), tt.period_id`,
      [teacherId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Failed to load teacher lessons:', err);
    res.status(500).json({ error: 'Failed to load teacher lessons.' });
  }
};

export const getSubstituteCandidates = async (req, res) => {
  const day = req.body.day;
  const period = Number(req.body.period);
  const classId = Number(req.body.classId);
  const subjectId = Number(req.body.subjectId);
  const teacherId = Number(req.body.teacherId || 0);

  if (!day || !Number.isFinite(period) || !Number.isFinite(classId) || !Number.isFinite(subjectId)) {
    return res.status(400).json({ error: 'Please provide day, period, classId and subjectId.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT
         t.teacher_id,
         t.teacher_name,
         MAX(CASE WHEN same_class.teacher_id IS NOT NULL THEN 1 ELSE 0 END) AS same_class,
         MAX(CASE WHEN same_subject.teacher_id IS NOT NULL THEN 1 ELSE 0 END) AS same_subject
       FROM teacher t
       LEFT JOIN (
         SELECT DISTINCT teacher_id
         FROM timetable
         WHERE class_id = ?
       ) same_class ON same_class.teacher_id = t.teacher_id
       LEFT JOIN (
         SELECT teacher_id FROM teacher_subject WHERE subject_id = ?
         UNION
         SELECT DISTINCT teacher_id FROM timetable WHERE subject_id = ?
       ) same_subject ON same_subject.teacher_id = t.teacher_id
       WHERE NOT EXISTS (
         SELECT 1
         FROM timetable busy
         WHERE busy.teacher_id = t.teacher_id
           AND busy.day_of_week = ?
           AND busy.period_id = ?
       )
       AND t.teacher_id <> ?
       GROUP BY t.teacher_id, t.teacher_name
       ORDER BY
         MAX(CASE WHEN same_class.teacher_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
         MAX(CASE WHEN same_subject.teacher_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
         t.teacher_name`,
      [classId, subjectId, subjectId, day, period, teacherId]
    );

    res.json(rows.map(row => {
      const reasons = [
        row.same_class ? '同班' : null,
        row.same_subject ? '同科' : null
      ].filter(Boolean);

      return {
        ...row,
        match_reason: reasons.length ? reasons.join(' / ') : '空堂'
      };
    }));
  } catch (err) {
    console.error('Failed to load substitute teachers:', err);
    res.status(500).json({ error: 'Failed to load substitute teachers.' });
  }
};
