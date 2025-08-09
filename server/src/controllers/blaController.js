import pool from '../db.js';

export const insertBLA = async (req, res) => {
  try {
    const { teacher_id, subject_id, student_ids } = req.body;

    if (!teacher_id || !subject_id || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: '缺少必要資料或 student_ids 不是陣列' });
    }

    // 生成批量插入的值
    const values = student_ids.map(studentId => [teacher_id, studentId, subject_id]);

    // SQL: 一次插入多筆
    const sql = `
      INSERT INTO BLA (teacher_id, student_id, subject_id)
      VALUES ?
    `;

    await pool.query(sql, [values]); // MySQL 批量插入用 VALUES ?

    res.json({ message: '批量插入成功', inserted: student_ids.length });

  } catch (error) {
    console.error('批量插入失敗:', error);
    res.status(500).json({ error: '批量插入失敗', detail: error.message });
  }
};

export const getBLAResults = async (req, res) => {
  try {
    const { subject_id } = req.query;

    if (!subject_id) {
      return res.status(400).json({ error: "缺少必要參數" });
    }
    // , s.student_name, t.teacher_name
    const [rows] = await pool.query(
      `
      SELECT b.BLA_id, b.teacher_id, b.student_id, s.student_ch_name, t.teacher_name
      FROM BLA b
      JOIN student s ON b.student_id = s.student_id
      JOIN teacher t ON b.teacher_id = t.teacher_id
      WHERE b.subject_id = ?
      `,
      [subject_id]
    );

    res.json(rows);
    console.log("查詢提名結果成功:", rows);
  } catch (error) {
    console.error("查詢提名結果失敗:", error);
    res.status(500).json({ error: "查詢提名結果失敗" });
  }
};
