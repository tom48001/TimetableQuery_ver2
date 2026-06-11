import db from '../db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeSex(value) {
  const sex = normalizeText(value).toUpperCase();
  return ['M', 'F'].includes(sex) ? sex : '';
}

export const getManagedStudents = async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT
        s.student_id,
        s.student_ch_name,
        s.student_eng_name,
        s.class_id,
        s.class_number,
        s.sex,
        c.class_name
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      ORDER BY
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        FIELD(SUBSTRING(c.class_name, 2, 1), 'M', 'A', 'R', 'Y'),
        CAST(s.class_number AS UNSIGNED),
        s.student_id`
    );
    res.json(students);
  } catch (error) {
    console.error('Failed to load students:', error);
    res.status(500).json({ error: 'Failed to load students.' });
  }
};

export const createManagedStudent = async (req, res) => {
  const student_ch_name = normalizeText(req.body.student_ch_name);
  const student_eng_name = normalizeText(req.body.student_eng_name);
  const class_id = Number(req.body.class_id);
  const class_number = normalizeText(req.body.class_number).padStart(2, '0');
  const sex = normalizeSex(req.body.sex);

  if (!student_ch_name || !student_eng_name || !class_id || !class_number || !sex) {
    return res.status(400).json({ error: 'Invalid student data.' });
  }

  try {
    const [classRows] = await db.query('SELECT class_id FROM class WHERE class_id = ?', [class_id]);
    if (!classRows.length) {
      return res.status(400).json({ error: 'Class not found.' });
    }

    const [duplicateRows] = await db.query(
      'SELECT student_id FROM student WHERE class_id = ? AND class_number = ?',
      [class_id, class_number]
    );
    if (duplicateRows.length) {
      return res.status(409).json({ error: 'This class number already exists in the selected class.' });
    }

    const [result] = await db.query(
      `INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
       VALUES (?, ?, ?, ?, ?)`,
      [student_ch_name, student_eng_name, class_id, class_number, sex]
    );

    res.status(201).json({ message: 'Student created successfully.', student_id: result.insertId });
  } catch (error) {
    console.error('Failed to create student:', error);
    res.status(500).json({ error: 'Failed to create student.' });
  }
};

export const deleteManagedStudent = async (req, res) => {
  const studentId = Number(req.params.studentId);

  if (!studentId) {
    return res.status(400).json({ error: 'Invalid student id.' });
  }

  try {
    const [result] = await db.query('DELETE FROM student WHERE student_id = ?', [studentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete student:', error);
    res.status(500).json({ error: 'Failed to delete student.' });
  }
};
