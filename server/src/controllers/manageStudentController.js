import db from '../db.js';

let studentAdminSchemaReady = false;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeSex(value) {
  const sex = normalizeText(value).toUpperCase();
  return ['M', 'F'].includes(sex) ? sex : '';
}

function normalizeStatus(value) {
  return normalizeText(value).toLowerCase() === 'inactive' ? 'inactive' : 'active';
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'y', 'ncs'].includes(normalizeText(value).toLowerCase());
}

async function addColumnIfMissing(definition) {
  try {
    await db.query(`ALTER TABLE student ADD COLUMN ${definition}`);
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) throw error;
  }
}

export async function ensureStudentAdminSchema() {
  if (studentAdminSchemaReady) return;

  await addColumnIfMissing('regno VARCHAR(50) NULL');
  await addColumnIfMissing('email VARCHAR(255) NULL');
  await addColumnIfMissing("status ENUM('active','inactive') NOT NULL DEFAULT 'active'");
  await addColumnIfMissing('is_ncs BOOLEAN NOT NULL DEFAULT FALSE');
  await addColumnIfMissing('x1_subject_id BIGINT NULL');
  await addColumnIfMissing('x2_subject_id BIGINT NULL');
  await addColumnIfMissing('x3_subject_id BIGINT NULL');
  await addColumnIfMissing('class_code VARCHAR(20) NULL');
  await addColumnIfMissing('house VARCHAR(50) NULL');
  await addColumnIfMissing('language_group VARCHAR(100) NULL');
  await addColumnIfMissing('supp_class VARCHAR(100) NULL');
  await addColumnIfMissing('maths_group VARCHAR(100) NULL');
  await addColumnIfMissing('citizenship VARCHAR(100) NULL');
  await addColumnIfMissing('dropped_subjects VARCHAR(255) NULL');
  await addColumnIfMissing('remarks TEXT NULL');

  const [classNumberIndexes] = await db.query(
    "SHOW INDEX FROM student WHERE Key_name = 'unique_class_number'"
  );
  if (classNumberIndexes.length) {
    const [classIdIndexes] = await db.query(
      `SHOW INDEX FROM student
       WHERE Key_name <> 'unique_class_number'
         AND Column_name = 'class_id'
         AND Seq_in_index = 1`
    );
    if (!classIdIndexes.length) {
      await db.query('ALTER TABLE student ADD INDEX idx_student_class_id (class_id)');
    }
    await db.query('ALTER TABLE student DROP INDEX unique_class_number');
  }

  studentAdminSchemaReady = true;
}

function studentPayload(body) {
  const classNumber = normalizeText(body.class_number);
  return {
    regno: normalizeText(body.regno) || null,
    email: normalizeText(body.email).toLowerCase() || null,
    student_ch_name: normalizeText(body.student_ch_name),
    student_eng_name: normalizeText(body.student_eng_name),
    class_id: Number(body.class_id),
    class_number: classNumber ? classNumber.padStart(2, '0') : '',
    sex: normalizeSex(body.sex),
    status: normalizeStatus(body.status),
    is_ncs: normalizeBoolean(body.is_ncs),
    x1_subject_id: Number(body.x1_subject_id) || null,
    x2_subject_id: Number(body.x2_subject_id) || null,
    x3_subject_id: Number(body.x3_subject_id) || null,
    class_code: normalizeText(body.class_code) || null,
    house: normalizeText(body.house) || null,
    language_group: normalizeText(body.language_group) || null,
    supp_class: normalizeText(body.supp_class) || null,
    maths_group: normalizeText(body.maths_group) || null,
    citizenship: normalizeText(body.citizenship) || null,
    dropped_subjects: normalizeText(body.dropped_subjects) || null,
    remarks: normalizeText(body.remarks) || null
  };
}

async function validateStudent(conn, student, excludedStudentId = null) {
  if (!student.student_ch_name || !student.student_eng_name || !student.class_id ||
      !student.class_number || !student.sex) {
    return { status: 400, error: 'Invalid student data.' };
  }

  const [classRows] = await conn.query('SELECT class_id FROM class WHERE class_id = ?', [student.class_id]);
  if (!classRows.length) return { status: 400, error: 'Class not found.' };

  const duplicateChecks = [
    {
      field: 'class_number',
      value: student.class_number,
      sql: 'class_id = ? AND class_number = ?',
      params: [student.class_id, student.class_number],
      error: 'This class number already exists in the selected class.'
    },
    {
      field: 'regno',
      value: student.regno,
      sql: 'regno = ?',
      params: [student.regno],
      error: 'This REGNO already exists.'
    },
    {
      field: 'email',
      value: student.email,
      sql: 'LOWER(email) = LOWER(?)',
      params: [student.email],
      error: 'This email already exists.'
    }
  ];

  for (const check of duplicateChecks) {
    if (!check.value) continue;
    const excludeSql = excludedStudentId ? ' AND student_id <> ?' : '';
    const params = excludedStudentId ? [...check.params, excludedStudentId] : check.params;
    const [duplicates] = await conn.query(
      `SELECT student_id FROM student WHERE ${check.sql}${excludeSql} LIMIT 1`,
      params
    );
    if (duplicates.length) {
      return { status: 409, error: check.error, duplicateField: check.field };
    }
  }

  const subjectIds = [student.x1_subject_id, student.x2_subject_id, student.x3_subject_id].filter(Boolean);
  if (subjectIds.length !== new Set(subjectIds).size) {
    return { status: 400, error: 'X1, X2 and X3 must use different subjects.' };
  }

  if (subjectIds.length) {
    const [subjects] = await conn.query(
      'SELECT subject_id FROM subject WHERE subject_id IN (?) AND is_elective = TRUE',
      [subjectIds]
    );
    if (subjects.length !== subjectIds.length) {
      return { status: 400, error: 'One or more elective subjects are invalid.' };
    }
  }

  return null;
}

export const getManagedStudents = async (req, res) => {
  try {
    await ensureStudentAdminSchema();
    const [students] = await db.query(
      `SELECT
        s.student_id,
        s.regno,
        s.email,
        s.student_ch_name,
        s.student_eng_name,
        s.class_id,
        s.class_number,
        s.sex,
        s.status,
        s.is_ncs,
        s.x1_subject_id,
        s.x2_subject_id,
        s.x3_subject_id,
        s.class_code,
        s.house,
        s.language_group,
        s.supp_class,
        s.maths_group,
        s.citizenship,
        s.dropped_subjects,
        s.remarks,
        c.class_name,
        c.grade_level,
        x1.subject_name AS x1_subject_name,
        x2.subject_name AS x2_subject_name,
        x3.subject_name AS x3_subject_name,
        (s.regno IS NOT NULL AND s.regno <> '' AND
          (SELECT COUNT(*) FROM student sr WHERE sr.regno = s.regno) > 1) AS duplicate_regno,
        (s.email IS NOT NULL AND s.email <> '' AND
          (SELECT COUNT(*) FROM student se WHERE LOWER(se.email) = LOWER(s.email)) > 1) AS duplicate_email,
        ((SELECT COUNT(*) FROM student sc
          WHERE sc.class_id = s.class_id AND sc.class_number = s.class_number) > 1) AS duplicate_class_number
      FROM student s
      LEFT JOIN class c ON s.class_id = c.class_id
      LEFT JOIN subject x1 ON s.x1_subject_id = x1.subject_id
      LEFT JOIN subject x2 ON s.x2_subject_id = x2.subject_id
      LEFT JOIN subject x3 ON s.x3_subject_id = x3.subject_id
      ORDER BY
        FIELD(s.status, 'active', 'inactive'),
        CAST(SUBSTRING(c.grade_level, 2) AS UNSIGNED),
        c.class_name,
        CAST(s.class_number AS UNSIGNED),
        s.student_id`
    );
    res.json(students);
  } catch (error) {
    console.error('Failed to load students:', error);
    res.status(500).json({ error: 'Failed to load students.' });
  }
};

export const getElectiveSubjects = async (req, res) => {
  try {
    const [subjects] = await db.query(
      `SELECT subject_id, subject_name
       FROM subject
       WHERE is_elective = TRUE
       ORDER BY subject_name`
    );
    res.json(subjects);
  } catch (error) {
    console.error('Failed to load elective subjects:', error);
    res.status(500).json({ error: 'Failed to load elective subjects.' });
  }
};

export const createManagedStudent = async (req, res) => {
  try {
    await ensureStudentAdminSchema();
    const student = studentPayload(req.body);
    const validationError = await validateStudent(db, student);
    if (validationError) return res.status(validationError.status).json(validationError);

    const [result] = await db.query(
      `INSERT INTO student
        (regno, email, student_ch_name, student_eng_name, class_id, class_number, sex,
         status, is_ncs, x1_subject_id, x2_subject_id, x3_subject_id,
         class_code, house, language_group, supp_class, maths_group, citizenship, dropped_subjects, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student.regno, student.email, student.student_ch_name, student.student_eng_name,
        student.class_id, student.class_number, student.sex, student.status, student.is_ncs,
        student.x1_subject_id, student.x2_subject_id, student.x3_subject_id,
        student.class_code, student.house, student.language_group, student.supp_class,
        student.maths_group, student.citizenship, student.dropped_subjects, student.remarks
      ]
    );

    res.status(201).json({ message: 'Student created successfully.', student_id: result.insertId });
  } catch (error) {
    console.error('Failed to create student:', error);
    res.status(500).json({ error: 'Failed to create student.' });
  }
};

export const updateManagedStudent = async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ error: 'Invalid student id.' });

  try {
    await ensureStudentAdminSchema();
    const student = studentPayload(req.body);
    const validationError = await validateStudent(db, student, studentId);
    if (validationError) return res.status(validationError.status).json(validationError);

    const [result] = await db.query(
      `UPDATE student
       SET regno = ?, email = ?, student_ch_name = ?, student_eng_name = ?,
           class_id = ?, class_number = ?, sex = ?, status = ?, is_ncs = ?,
           x1_subject_id = ?, x2_subject_id = ?, x3_subject_id = ?,
           class_code = ?, house = ?, language_group = ?, supp_class = ?,
           maths_group = ?, citizenship = ?, dropped_subjects = ?, remarks = ?
       WHERE student_id = ?`,
      [
        student.regno, student.email, student.student_ch_name, student.student_eng_name,
        student.class_id, student.class_number, student.sex, student.status, student.is_ncs,
        student.x1_subject_id, student.x2_subject_id, student.x3_subject_id,
        student.class_code, student.house, student.language_group, student.supp_class,
        student.maths_group, student.citizenship, student.dropped_subjects, student.remarks,
        studentId
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Student updated successfully.' });
  } catch (error) {
    console.error('Failed to update student:', error);
    res.status(500).json({ error: 'Failed to update student.' });
  }
};

export const deleteManagedStudent = async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ error: 'Invalid student id.' });

  try {
    await ensureStudentAdminSchema();
    const [result] = await db.query('DELETE FROM student WHERE student_id = ?', [studentId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete student:', error);
    res.status(500).json({ error: 'Failed to delete student.' });
  }
};

export const setManagedStudentStatus = async (req, res) => {
  const studentId = Number(req.params.studentId);
  const status = normalizeStatus(req.body.status);
  if (!studentId) return res.status(400).json({ error: 'Invalid student id.' });

  try {
    await ensureStudentAdminSchema();
    const [result] = await db.query(
      'UPDATE student SET status = ? WHERE student_id = ?',
      [status, studentId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found.' });
    res.json({ message: `Student ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
  } catch (error) {
    console.error('Failed to update student status:', error);
    res.status(500).json({ error: 'Failed to update student status.' });
  }
};
