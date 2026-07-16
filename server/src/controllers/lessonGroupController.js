import pool from '../db.js';
import { ensureStudentAdminSchema } from './manageStudentController.js';

function normaliseClassListSql(alias) {
  return `
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(${alias}.class_name, '#', ''),
          '／',
          '/'
        ),
        '/',
        ','
      ),
      ' ',
      ''
    ),
    '，',
    ','
  )
`;
}

export async function ensureLessonGroupSchema(connOrPool = pool) {
  await connOrPool.query(`
    CREATE TABLE IF NOT EXISTS student_lesson_group (
      student_id BIGINT NOT NULL,
      timetable_id BIGINT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id, timetable_id),
      UNIQUE KEY unique_student_lesson_group_slot (student_id, timetable_id),
      FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
      FOREIGN KEY (timetable_id) REFERENCES timetable(timetable_id) ON DELETE CASCADE,
      INDEX idx_student_lesson_group_student (student_id),
      INDEX idx_student_lesson_group_timetable (timetable_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

function splitGroupWhere(alias = 'tt') {
  return `
    ${alias}.class_id = ?
    AND ${alias}.subject_id = ?
    AND ${alias}.day_of_week = ?
    AND ${alias}.period_id = ?
  `;
}

export async function getSplitLessonGroups(req, res) {
  try {
    await ensureLessonGroupSchema();
    const [rows] = await pool.query(`
      SELECT
        tt.class_id,
        c.class_name,
        tt.subject_id,
        s.subject_name,
        s.subject_name_zh,
        s.subject_name_en,
        tt.day_of_week,
        tt.period_id,
        p.period_name,
        COUNT(*) AS group_count,
        COUNT(DISTINCT slg.student_id) AS assigned_students,
        (
          SELECT COUNT(*)
          FROM student st
          JOIN class sc ON st.class_id = sc.class_id
          WHERE st.status = 'active'
            AND (
              st.class_id = tt.class_id
              OR FIND_IN_SET(REPLACE(sc.class_name, ' ', ''), ${normaliseClassListSql('c')}) > 0
              OR REPLACE(c.class_name, ' ', '') IN (sc.grade_level, REPLACE(sc.grade_level, 'F', 'S'))
            )
        ) AS student_count
      FROM timetable tt
      JOIN class c ON tt.class_id = c.class_id
      JOIN subject s ON tt.subject_id = s.subject_id
      JOIN period p ON tt.period_id = p.period_id
      LEFT JOIN student_lesson_group slg ON slg.timetable_id = tt.timetable_id
      WHERE TRIM(COALESCE(s.subject_name_zh, s.subject_name)) <> '班主任課'
        AND UPPER(TRIM(COALESCE(s.subject_name_en, s.subject_name))) NOT IN ('CLASS TEACHER', 'CLASS TEACHER PERIOD', 'HOMEROOM')
      GROUP BY
        tt.class_id, c.class_name, tt.subject_id, s.subject_name, s.subject_name_zh,
        s.subject_name_en, tt.day_of_week, tt.period_id, p.period_name
      HAVING COUNT(*) > 1
      ORDER BY
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        c.class_name,
        FIELD(tt.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
        tt.period_id,
        s.subject_name
    `);

    res.json(rows);
  } catch (err) {
    console.error('Failed to load split lesson groups:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load split lesson groups.' });
  }
}

export async function getSplitLessonGroupDetail(req, res) {
  const classId = Number(req.query.classId);
  const subjectId = Number(req.query.subjectId);
  const day = String(req.query.day || '');
  const periodId = Number(req.query.periodId);

  if (!classId || !subjectId || !day || !periodId) {
    return res.status(400).json({ code: 'INVALID_GROUP', error: 'Missing split lesson group parameters.' });
  }

  try {
    await ensureStudentAdminSchema();
    await ensureLessonGroupSchema();

    const [lessons] = await pool.query(`
      SELECT
        tt.timetable_id,
        tt.teacher_id,
        t.teacher_name,
        tt.room_id,
        r.room_name,
        COUNT(slg.student_id) AS assigned_count
      FROM timetable tt
      JOIN teacher t ON tt.teacher_id = t.teacher_id
      JOIN room r ON tt.room_id = r.room_id
      LEFT JOIN student_lesson_group slg ON slg.timetable_id = tt.timetable_id
      WHERE ${splitGroupWhere('tt')}
      GROUP BY tt.timetable_id, tt.teacher_id, t.teacher_name, tt.room_id, r.room_name
      ORDER BY t.teacher_name, r.room_name
    `, [classId, subjectId, day, periodId]);

    if (lessons.length < 2) {
      return res.status(404).json({ code: 'GROUP_NOT_FOUND', error: 'Split lesson group was not found.' });
    }

    const timetableIds = lessons.map(lesson => lesson.timetable_id);
    const [students] = await pool.query(`
      SELECT
        st.student_id,
        st.student_ch_name AS student_name,
        st.student_eng_name AS english_name,
        st.class_number,
        sc.class_name,
        assigned.timetable_id AS assigned_timetable_id
      FROM student st
      JOIN class sc ON st.class_id = sc.class_id
      JOIN class selected_class ON selected_class.class_id = ?
      LEFT JOIN student_lesson_group assigned
        ON assigned.student_id = st.student_id
       AND assigned.timetable_id IN (?)
      WHERE st.status = 'active'
        AND (
          st.class_id = selected_class.class_id
          OR FIND_IN_SET(REPLACE(sc.class_name, ' ', ''), ${normaliseClassListSql('selected_class')}) > 0
          OR REPLACE(selected_class.class_name, ' ', '') IN (sc.grade_level, REPLACE(sc.grade_level, 'F', 'S'))
        )
      ORDER BY sc.class_name, CAST(st.class_number AS UNSIGNED), st.class_number, st.student_ch_name
    `, [classId, timetableIds]);

    res.json({ lessons, students });
  } catch (err) {
    console.error('Failed to load split lesson group detail:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load split lesson group detail.' });
  }
}

export async function saveSplitLessonGroupAssignments(req, res) {
  const classId = Number(req.body.classId);
  const subjectId = Number(req.body.subjectId);
  const day = String(req.body.day || '');
  const periodId = Number(req.body.periodId);
  const assignments = Array.isArray(req.body.assignments) ? req.body.assignments : [];

  if (!classId || !subjectId || !day || !periodId) {
    return res.status(400).json({ code: 'INVALID_GROUP', error: 'Missing split lesson group parameters.' });
  }

  const conn = await pool.getConnection();

  try {
    await ensureLessonGroupSchema(conn);
    await conn.beginTransaction();

    const [lessons] = await conn.query(
      `SELECT timetable_id FROM timetable tt WHERE ${splitGroupWhere('tt')}`,
      [classId, subjectId, day, periodId]
    );
    const validTimetableIds = new Set(lessons.map(row => Number(row.timetable_id)));

    if (validTimetableIds.size < 2) {
      await conn.rollback();
      return res.status(404).json({ code: 'GROUP_NOT_FOUND', error: 'Split lesson group was not found.' });
    }

    const studentIds = assignments
      .map(item => Number(item.student_id))
      .filter(Number.isFinite);

    if (studentIds.length) {
      await conn.query(
        `DELETE slg
         FROM student_lesson_group slg
         JOIN timetable tt ON slg.timetable_id = tt.timetable_id
         WHERE slg.student_id IN (?)
           AND ${splitGroupWhere('tt')}`,
        [studentIds, classId, subjectId, day, periodId]
      );
    }

    const values = assignments
      .map(item => ({
        studentId: Number(item.student_id),
        timetableId: Number(item.timetable_id)
      }))
      .filter(item => Number.isFinite(item.studentId) && validTimetableIds.has(item.timetableId))
      .map(item => [item.studentId, item.timetableId]);

    if (values.length) {
      await conn.query(
        'INSERT INTO student_lesson_group (student_id, timetable_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.json({ code: 'ASSIGNMENTS_SAVED', message: 'Split lesson assignments saved.', assignedRows: values.length });
  } catch (err) {
    await conn.rollback();
    console.error('Failed to save split lesson assignments:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to save split lesson assignments.' });
  } finally {
    conn.release();
  }
}
