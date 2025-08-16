import pool from '../db.js';
import db from '../db.js';

export const insertBLA = async (req, res) => {
  try {
    const { teacher_id, subject_id, student_ids } = req.body;
    if (!teacher_id || !subject_id || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: '缺少必要資料或 student_ids 不是陣列' });
    }

    // 避免重複插入
    const values = student_ids.map(studentId => [teacher_id, studentId, subject_id]);
    await pool.query(
      `INSERT IGNORE INTO BLA (teacher_id, student_id, subject_id) VALUES ?`,
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
    const { subject_id } = req.params;
    const teacher_id = req.user.teacher_id;

    const [rows] = await pool.query(
      `SELECT student_id FROM BLA WHERE subject_id = ? AND teacher_id = ?`,
      [subject_id, teacher_id]
    );

    res.json(rows.map(r => r.student_id));
  } catch (error) {
    res.status(500).json({ error: '取得已投票學生失敗', detail: error.message });
  }
};

export const deleteBLA = async (req, res) => {
  const { subjectId, teacherId, removed } = req.body;

  if (!subjectId || !teacherId || !Array.isArray(removed)) {
    return res.status(400).json({ message: '缺少必要參數' });
  }

  if (removed.length === 0) {
    return res.json({ message: '沒有要刪除的學生' });
  }

  try {
    await pool.query(
      `DELETE FROM bla
       WHERE subject_id = ? AND teacher_id = ? AND student_id IN (?)`,
      [subjectId, teacherId, removed]
    );
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '刪除失敗' });
  }
};

export const getBLAResults = async (req, res) => {
  try {
    const { subject_id } = req.query;

    if (!subject_id) {
      return res.status(400).json({ error: "缺少必要參數" });
    }
    const [rows] = await pool.query(
      `
      SELECT 
        b.student_id,
        s.student_ch_name,
        GROUP_CONCAT(t.teacher_name ORDER BY t.teacher_name SEPARATOR ', ') AS teacher_names
      FROM BLA b
      JOIN student s ON b.student_id = s.student_id
      JOIN teacher t ON b.teacher_id = t.teacher_id
      WHERE b.subject_id = ?
      GROUP BY b.student_id, s.student_ch_name
      ORDER BY s.student_id
      `,
      [subject_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("查詢提名結果失敗:", error);
    res.status(500).json({ error: "查詢提名結果失敗" });
  }
};

export const getSelectBLA = async (req, res) => {
  try {
    const { subject_id, teacher_id } = req.query;

    if (!subject_id || !teacher_id) {
      return res.status(400).json({ error: "缺少必要參數" });
    }

    const [rows] = await pool.query(
      `
      SELECT b.student_id
      FROM BLA b
      WHERE b.subject_id = ? AND b.teacher_id = ?
      `,
      [subject_id, teacher_id]
    );

    res.json(rows);
    console.log("getSelectBLA成功:", rows);
  } catch (error) {
    console.error("查詢提名結果失敗:", error);
    res.status(500).json({ error: "查詢提名結果失敗" });
  }
};

