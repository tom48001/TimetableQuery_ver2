import pool from '../db.js';

export const insertBLA = async (req, res) => {
  try {
    const { teacher_id, subject_id, student_ids } = req.body;
    if (!teacher_id || !subject_id || !Array.isArray(student_ids)) {
      return res.status(400).json({ error: '缺少必要資料或 student_ids 不是陣列' });
    }

    // student_ids 為空就直接回成功，不插入
    if (student_ids.length === 0) {
      return res.json({ message: '沒有需要插入的資料', inserted: 0 });
    }
    // 避免重複插入
    const values = student_ids.map(studentId => [teacher_id, studentId, subject_id]);
    await pool.query(
      `INSERT IGNORE INTO BLA (teacher_id, student_id, subject_id) VALUES ${values.map(() => '(?)').join(',')}`,
      values
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
  console.log('req.body:', req.body)

  if (!subjectId || !teacherId || !Array.isArray(removed)) {
    return res.status(400).json({ message: '缺少必要參數' });
  }

  try {
    if (removed.length > 0) {
      const placeholders = removed.map(() => '?').join(',');
      const sql = `
        DELETE FROM bla
        WHERE subject_id = ? AND teacher_id = ? 
        AND student_id IN (${placeholders})
      `;
      await pool.query(sql, [subjectId, teacherId, ...removed]);
    }

    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error('刪除失敗:', err);
    res.status(500).json({ message: '刪除失敗', detail: err.message });
  }
};


export const getBLAResults = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        b.student_id,
        c.class_name,
        s.student_ch_name,
        GROUP_CONCAT(DISTINCT sub.subject_name ORDER BY sub.subject_id SEPARATOR '、') AS subject_names,
        GROUP_CONCAT(DISTINCT sub.subject_id ORDER BY sub.subject_id SEPARATOR ',') AS subject_ids,
        COUNT(DISTINCT b.subject_id) AS subject_count,
        CASE
          WHEN COUNT(DISTINCT b.subject_id) >= 8 THEN '獲獎'
          ELSE ''
        END AS award
      FROM BLA b
      JOIN student s ON b.student_id = s.student_id
      JOIN class c ON s.class_id = c.class_id
      JOIN subject sub ON b.subject_id = sub.subject_id
      GROUP BY b.student_id, c.class_name, s.student_ch_name
      ORDER BY c.class_name, CAST(s.class_number AS UNSIGNED), s.student_id
      `
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
