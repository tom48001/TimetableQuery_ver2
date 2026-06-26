import pool from '../db.js';
import { ensureStudentAdminSchema } from './manageStudentController.js';

// 查詢某班所有學生
export const getStudentsByClassId = async (req, res) => {
  const { classId } = req.params;
  try {
    await ensureStudentAdminSchema();
    const [students] = await pool.query(
      `SELECT 
        s.student_id, 
        s.student_ch_name AS student_name,
        s.student_eng_name AS english_name,
        s.class_number,
        s.sex, 
        s.class_id,
        c.class_name
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      WHERE s.class_id = ? AND s.status = 'active'
      ORDER BY CAST(s.class_number AS UNSIGNED), s.class_number, s.student_ch_name`, 
      [classId]
    );
    res.json(students);
  } catch (error) {
    console.error('查詢班級學生失敗:', error);
    res.status(500).json({ error: '無法查詢學生' });
  }
};

// 查(S4-S6)學生的資料
export const getStudentsBySubject = async (req, res) => {
  const { formLevel, subjectName } = req.body;
  if (!formLevel || !subjectName) {
    return res.status(400).json({ error: '請提供級別與科目' });
  }
  try {
    const [students] = await pool.query(`
      SELECT DISTINCT student_id, student_name, english_name, sex, class_id, class_name, subject
      FROM timetable
      WHERE form_level = ? AND subject = ?
      ORDER BY class_name, student_name
    `, [formLevel, subjectName]);
    res.json(students);
  } catch (error) {
    console.error('查詢學生失敗:', error);
    res.status(500).json({ error: '無法查詢學生' });
  }
};

export const getStudentsByClassNSubject = async (req, res) => {
  const { classId, subjectId } = req.params;

  try {
    await ensureStudentAdminSchema();
    const baseSql = `
      SELECT
        s.student_id,
        s.student_ch_name AS student_name,
        s.student_eng_name AS english_name,
        s.class_number,
        s.sex,
        s.class_id,
        c.class_name
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      WHERE s.class_id = ? AND s.status = 'active'
      ORDER BY CAST(s.class_number AS UNSIGNED), s.student_ch_name
    `;

    const [subjectRows] = await pool.query(
      'SELECT is_elective FROM subject WHERE subject_id = ?',
      [subjectId]
    );

    if (!subjectRows.length) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    if (!subjectRows[0].is_elective) {
      const [students] = await pool.query(baseSql, [classId]);
      return res.json(students);
    }

    const [electiveStudents] = await pool.query(
      `
      SELECT
        s.student_id,
        s.student_ch_name AS student_name,
        s.student_eng_name AS english_name,
        s.class_number,
        s.sex,
        s.class_id,
        c.class_name
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      WHERE s.class_id = ? AND s.status = 'active'
        AND ? IN (s.x1_subject_id, s.x2_subject_id, s.x3_subject_id)
      ORDER BY CAST(s.class_number AS UNSIGNED), s.student_ch_name
      `,
      [classId, subjectId]
    );

    if (electiveStudents.length > 0) {
      return res.json(electiveStudents);
    }

    const [classStudents] = await pool.query(baseSql, [classId]);
    return res.json(classStudents);
  } catch (error) {
    console.error('Failed to load students by class and subject:', error);
    res.status(500).json({ error: 'Failed to load students' });
  }
};

// 查學生的時間表
export const getStudentTimetable = async (req, res) => {
  const { studentId } = req.params;
  try {
    await ensureStudentAdminSchema();
    const [rows] = await pool.query(`
      SELECT 
        t.teacher_name,
        sb.subject_id,
        sb.subject_name AS subject,
        c.class_name,
        r.room_id,
        r.room_name,
        tt.day_of_week AS day,
        p.period_name AS period
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      JOIN timetable tt ON c.class_id = tt.class_id
      JOIN teacher t ON tt.teacher_id = t.teacher_id
      JOIN subject sb ON tt.subject_id = sb.subject_id
      JOIN room r ON tt.room_id = r.room_id
      JOIN period p ON tt.period_id = p.period_id
      WHERE s.student_id = ? AND s.status = 'active'
      ORDER BY tt.day_of_week, tt.period_id
    `, [studentId]);

    res.json(rows);
  } catch (error) {
    console.error('查詢學生課表失敗:', error);
    res.status(500).json({ error: '無法查詢課表' });
  }
};

// 查所有學生
export const getStudents = async (req, res) => {
  try {
    await ensureStudentAdminSchema();
    const [rows] = await pool.query(`
      SELECT 
        s.student_id, 
        s.student_ch_name AS student_name,
        s.student_eng_name AS english_name,
        s.sex, 
        s.class_id,
        c.class_name
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      WHERE s.status = 'active'
      ORDER BY
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        FIELD(SUBSTRING(c.class_name, 2, 1), 'M', 'A', 'R', 'Y'),
        s.student_ch_name
    `);
    res.json(rows);
  } catch (error) {
    console.error('查詢學生失敗:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
