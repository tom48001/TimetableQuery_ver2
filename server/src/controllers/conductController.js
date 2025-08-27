import pool from '../db.js';

export const insertConduct = async (req, res) => {
  try {
    const { teacher_id, student_ids } = req.body;
    if (!teacher_id || !Array.isArray(student_ids)) {
      return res.status(400).json({ error: '缺少必要資料或 student_ids 不是陣列' });
    }
    // student_ids 為空就直接回成功，不插入
    if (student_ids.length === 0) {
      return res.json({ message: '沒有需要插入的資料', inserted: 0 });
    }

    // 避免重複插入
    const values = student_ids.map(studentId => [teacher_id, studentId]);
    await pool.query(
      `INSERT IGNORE INTO nomination (teacher_id, student_id) VALUES ?`,
      [values]
    );

    res.json({ message: '批量插入成功', inserted: student_ids.length });
  } catch (error) {
    console.error('批量插入失敗:', error);
    res.status(500).json({ error: '批量插入失敗', detail: error.message });
  }
};

export const getVotedStudents = async (req, res) => {
  try {
    const teacher_id = req.user.teacher_id;

    const [rows] = await pool.query(
      `SELECT student_id FROM nomination WHERE teacher_id = ?`,
      [teacher_id]
    );

    res.json(rows.map(r => r.student_id));
  } catch (error) {
    res.status(500).json({ error: '取得已投票學生失敗', detail: error.message });
  }
};

export const deleteConduct = async (req, res) => {
  const { teacherId, removed } = req.body;

  if (!teacherId || !Array.isArray(removed)) {
    return res.status(400).json({ message: '缺少必要參數' });
  }

  if (removed.length === 0) {
    return res.json({ message: '沒有要刪除的學生' });
  }

  try {
    await pool.query(
      `DELETE FROM nomination
       WHERE teacher_id = ? AND student_id IN (?)`,
      [teacherId, removed]
    );
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '刪除失敗' });
  }
};

export const getConductResults = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        n.student_id,
        s.student_ch_name,
        GROUP_CONCAT(t.teacher_name ORDER BY t.teacher_name SEPARATOR ', ') AS teacher_names
      FROM nomination n
      JOIN student s ON n.student_id = s.student_id
      JOIN teacher t ON n.teacher_id = t.teacher_id
      GROUP BY n.student_id, s.student_ch_name
      ORDER BY s.student_id
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("查詢提名結果失敗:", error);
    res.status(500).json({ error: "查詢提名結果失敗" });
  }
};

export const getSelectConduct = async (req, res) => {
  try {
    const { teacher_id } = req.query;

    if (!teacher_id) {
      return res.status(400).json({ error: "缺少必要參數" });
    }

    const [rows] = await pool.query(
      `
      SELECT n.student_id
      FROM nomination n
      WHERE n.teacher_id = ?
      `,
      [teacher_id]
    );

    res.json(rows);
    console.log("getSelectnomination成功:", rows);
  } catch (error) {
    console.error("查詢提名結果失敗:", error);
    res.status(500).json({ error: "查詢提名結果失敗" });
  }
};