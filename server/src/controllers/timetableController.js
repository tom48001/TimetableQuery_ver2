import pool from '../db.js';

// 查詢多位老師課表（也可用於觀課老師）
export const getTeachersSchedule = async (req, res) => {
  const { teacherIds } = req.body;
  if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
    return res.status(400).json({ error: '請提供老師 ID 陣列' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT teacher_id, teacher_name, class_name, room, subject, day, period
      FROM timetable
      WHERE teacher_id IN (?)`, [teacherIds]);
    res.json(rows);
  } catch (err) {
    console.error('查詢老師課表失敗:', err);
    res.status(500).json({ error: '無法查詢老師課表' });
  }
};

// 查詢空堂老師
export const getFreeTeachers = async (req, res) => {
  const { day, period } = req.body;
  if (!day || !period) {
    return res.status(400).json({ error: '請提供星期與節次' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT teacher_id, teacher_name
      FROM teacher
      WHERE teacher_id NOT IN (
        SELECT teacher_id FROM timetable WHERE day = ? AND period = ?
      )`, [day, period]);
    res.json(rows);
  } catch (err) {
    console.error('查詢空堂老師失敗:', err);
    res.status(500).json({ error: '無法查詢空堂老師' });
  }
};

// 查班級課表
export const getClassScheduleById = async (req, res) => {
  const { classId } = req.params;
  try {
    const [rows] = await pool.query(
    //* 獲取班級課表的資訊，老師、教室和科目名稱 */
      `SELECT 
        t.teacher_name,
        c.class_name,
        r.room_name AS room,
        s.subject_name AS subject,
        tt.day_of_week,
        tt.period
      FROM timetable tt
      JOIN teacher t ON tt.teacher_id = t.teacher_id
      JOIN class c ON tt.class_id = c.class_id
      JOIN room r ON tt.room_id = r.room_id
      JOIN subject s ON tt.subject_id = s.subject_id
      WHERE c.class_id = ?
      ORDER BY tt.day_of_week, tt.period`, [classId]);
    res.json(rows);
  } catch (err) {
    console.error('查詢班級課表失敗:', err);
    res.status(500).json({ error: '無法查詢班級課表' });
  }
};

// 查房課表（用 room name）
export const getRoomSchedule = async (req, res) => {
  const { roomName } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT teacher_name, class_name, room, subject, day, period
      FROM timetable
      WHERE room = ?`, [roomName]);
    res.json(rows);
  } catch (err) {
    console.error('查詢課室課表失敗:', err);
    res.status(500).json({ error: '無法查詢課室課表' });
  }
};
