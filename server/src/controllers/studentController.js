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

export const ListStudentsByClassId = async (req, res) => {
  const { classId } = req.params;
  try {
    const [students] = await pool.query(
      `SELECT DISTINCT student_id, student_ch_name, student_eng_name
      FROM student
      WHERE class_id = ?
      ORDER BY student_ch_name`, [classId]);
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

export const getStudentSchedule = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [rows] = await pool.query(
      `
      SELECT
        t.day_of_week,
        t.period_id,
        p.period_name,
        p.start_time,
        p.end_time,
        c.class_name,
        s.subject_name,
        r.room_name,
        te.teacher_name
      FROM timetable t
      JOIN subject s ON t.subject_id = s.subject_id
      JOIN class c ON t.class_id = c.class_id
      JOIN room r ON t.room_id = r.room_id
      JOIN period p ON t.period_id = p.period_id
      JOIN teacher te ON t.teacher_id = te.teacher_id
      WHERE
        (
          s.is_elective = TRUE AND t.subject_id IN (
            SELECT subject_id FROM student_subject WHERE student_id = ?
          )
        )
        OR (
          s.is_elective = FALSE AND t.class_id = (
            SELECT class_id FROM student WHERE student_id = ?
          )
        )
      ORDER BY
        FIELD(t.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
        p.period_id
    `, [studentId, studentId]
  );
  res.json({ targetSchedule: rows });
  console.log('查詢課表成功:', { targetSchedule: rows });
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
