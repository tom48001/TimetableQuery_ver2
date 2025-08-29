import pool from '../db.js';

// 查詢某班所有學生
export const getStudentsByClassId = async (req, res) => {
  const { classId } = req.params;
  try {
    const [students] = await pool.query(
      `SELECT 
        s.student_id, 
        s.student_ch_name AS student_name,
        s.student_eng_name AS english_name,
        s.sex, 
        s.class_id,
        c.class_name
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      WHERE s.class_id = ?
      ORDER BY s.student_ch_name`, 
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
    const [students] = await pool.query(
      `SELECT 
        s.student_id, 
        s.student_ch_name AS student_name,
        s.student_eng_name AS english_name,
        s.sex, 
        s.class_id,
        c.class_name
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      JOIN student_subject ss ON s.student_id = ss.student_id
      WHERE s.class_id = ? AND ss.subject_id = ?
      ORDER BY s.student_ch_name`, 
      [classId, subjectId]
    );
    res.json(students);
  } catch (error) {
    console.error('查詢班級學生失敗:', error);
    res.status(500).json({ error: '無法查詢學生' });
  }
};

// 查學生的時間表
export const getStudentTimetable = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.teacher_name,
        sb.subject_name AS subject,
        c.class_name,
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
      WHERE s.student_id = ?
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
      ORDER BY c.class_name, s.student_ch_name
    `);
    res.json(rows);
  } catch (error) {
    console.error('查詢學生失敗:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
