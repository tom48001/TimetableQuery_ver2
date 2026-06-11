import pool from '../db.js';

export const insertPrefect = async (req, res) => {
  try {
    const { teacher_id, student_ids } = req.body;

    if (!teacher_id || !Array.isArray(student_ids)) {
      return res.status(400).json({ error: 'Missing teacher_id or student_ids.' });
    }

    if (student_ids.length === 0) {
      return res.json({ message: 'No prefect nominations to insert.', inserted: 0 });
    }

    const values = student_ids.map(studentId => [teacher_id, studentId]);
    await pool.query(
      'INSERT IGNORE INTO prefect_nomination (teacher_id, student_id) VALUES ?',
      [values]
    );

    res.json({ message: 'Prefect nominations inserted successfully.', inserted: student_ids.length });
  } catch (error) {
    console.error('Failed to insert prefect nominations:', error);
    res.status(500).json({ error: 'Failed to insert prefect nominations.', detail: error.message });
  }
};

export const deletePrefect = async (req, res) => {
  const { teacherId, removed } = req.body;

  if (!teacherId || !Array.isArray(removed)) {
    return res.status(400).json({ message: 'Missing teacherId or removed students.' });
  }

  if (removed.length === 0) {
    return res.json({ message: 'No prefect nominations to delete.' });
  }

  try {
    await pool.query(
      `DELETE FROM prefect_nomination
       WHERE teacher_id = ? AND student_id IN (?)`,
      [teacherId, removed]
    );
    res.json({ message: 'Prefect nominations deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete prefect nominations:', error);
    res.status(500).json({ message: 'Failed to delete prefect nominations.' });
  }
};

export const getPrefectResults = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        pn.student_id,
        c.class_name,
        s.student_ch_name,
        GROUP_CONCAT(t.teacher_name ORDER BY t.teacher_name SEPARATOR ', ') AS teacher_names
      FROM prefect_nomination pn
      JOIN student s ON pn.student_id = s.student_id
      JOIN class c ON s.class_id = c.class_id
      JOIN teacher t ON pn.teacher_id = t.teacher_id
      GROUP BY pn.student_id, c.class_name, s.student_ch_name
      ORDER BY c.class_name, CAST(s.class_number AS UNSIGNED), s.student_id
      `
    );

    res.json(rows);
  } catch (error) {
    console.error('Failed to load prefect nomination results:', error);
    res.status(500).json({ error: 'Failed to load prefect nomination results.' });
  }
};

export const getSelectPrefect = async (req, res) => {
  try {
    const { teacher_id } = req.query;

    if (!teacher_id) {
      return res.status(400).json({ error: 'Missing teacher_id.' });
    }

    const [rows] = await pool.query(
      `
      SELECT pn.student_id
      FROM prefect_nomination pn
      WHERE pn.teacher_id = ?
      `,
      [teacher_id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Failed to load selected prefect nominations:', error);
    res.status(500).json({ error: 'Failed to load selected prefect nominations.' });
  }
};
