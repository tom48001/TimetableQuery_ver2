import db from '../db.js';
import { ensureStudentAdminSchema } from './manageStudentController.js';

const normaliseClassListSql = `
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(ttc.class_name, '#', ''),
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

export const getElectives = async (req, res) => {
  try {
    const { subject } = req.body;
    const [rows] = await db.query(
      `SELECT subject_id, subject_name, subject_name_zh, subject_name_en
       FROM subject
       WHERE subject_id = ?`,
      [subject]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Failed to load elective subject:', error);
    res.status(500).json({ error: 'Failed to load elective subject.' });
  }
};

export const getStudentElectives = async (req, res) => {
  const { form, subject } = req.body;
  if (!form || !subject) {
    return res.status(400).json({ error: 'Please provide form and subject.' });
  }

  try {
    await ensureStudentAdminSchema();

    const [rows] = await db.query(
      `
      SELECT
        c.class_name,
        c.grade_level,
        s.student_id,
        s.class_number,
        s.student_ch_name,
        s.student_eng_name,
        s.sex,
        tt.timetable_id,
        tt.day_of_week,
        p.period_name,
        p.period_id,
        t.teacher_name,
        r.room_name,
        ttc.class_name AS timetable_class_name,
        sub.subject_name
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      LEFT JOIN (
        timetable tt
        JOIN class ttc ON tt.class_id = ttc.class_id
      )
        ON tt.subject_id = ?
       AND (
          tt.class_id = s.class_id
          OR FIND_IN_SET(REPLACE(c.class_name, ' ', ''), ${normaliseClassListSql}) > 0
          OR REPLACE(ttc.class_name, ' ', '') IN (?, ?)
       )
      LEFT JOIN period p ON tt.period_id = p.period_id
      LEFT JOIN teacher t ON tt.teacher_id = t.teacher_id
      LEFT JOIN room r ON tt.room_id = r.room_id
      LEFT JOIN subject sub ON tt.subject_id = sub.subject_id
      WHERE c.grade_level = ?
        AND s.status = 'active'
        AND ? IN (s.x1_subject_id, s.x2_subject_id, s.x3_subject_id)
      ORDER BY
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        FIELD(SUBSTRING(c.class_name, 2, 1), 'M', 'A', 'R', 'Y'),
        c.class_name,
        CAST(s.class_number AS UNSIGNED),
        s.class_number,
        tt.day_of_week,
        p.period_id
      `,
      [subject, form, form.replace('F', 'S'), form, subject]
    );

    res.json(rows);
  } catch (err) {
    console.error('Failed to load elective students:', err);
    res.status(500).json({ error: 'Failed to load elective students.' });
  }
};
