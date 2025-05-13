import pool from '../db.js';

// 查詢某班所有學生
export const getStudentsByClassId = async (req, res) => {
  const { classId } = req.params;
  try {
    const [students] = await pool.query(
      `SELECT DISTINCT student_id, student_name, english_name, sex, class_id, class_name
      FROM timetable
      WHERE class_id = ?
      ORDER BY student_name`, [classId]);
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

// 查學生的時間表
export const getStudentTimetable = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT teacher_name, subject, class_name, room_name, day, period
      FROM timetable
      WHERE student_id = ?
      ORDER BY day, period
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
    const [rows] = await pool.query(`
      SELECT DISTINCT student_id, student_name, english_name, sex, class_id, class_name
      FROM timetable
      ORDER BY class_name, student_name
    `);
    res.json(rows);
  } catch (error) {
    console.error('查詢學生失敗:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
