import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requireAnyPermission } from '../auth/permissions.js';
import db from '../db.js';
import { getStudentElectives, getElectives, getElectiveSubjectOptions, getSubjectHeadOptions } from '../controllers/subjectController.js';
import { ensureStudentAdminSchema } from '../controllers/manageStudentController.js';
import { subjectCanonicalKey } from '../utils/subjectCanonicalKey.js';

const router = express.Router();
const canReadSchoolData = requireAnyPermission(['timetable', 'nominations']);
let nominationColumnReady = false;

async function ensureSubjectNominationColumn() {
  if (nominationColumnReady) return;

  try {
    await db.query('ALTER TABLE subject ADD COLUMN is_nominatable BOOLEAN NOT NULL DEFAULT TRUE AFTER is_elective');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) throw error;
  }

  await db.query(`
    UPDATE subject
    SET is_nominatable = FALSE
    WHERE subject_id IS NOT NULL
      AND (
        TRIM(subject_name) IN ('班主任課', 'Career_Planning')
        OR TRIM(subject_name) LIKE 'SUPP%'
      )
  `);
  nominationColumnReady = true;
}

router.get('/', ensureJWT, canReadSchoolData, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subject ORDER BY subject_id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/class-counts', ensureJWT, canReadSchoolData, async (req, res) => {
  try {
    await ensureSubjectNominationColumn();
    await ensureStudentAdminSchema();
    const [subjects] = await db.query(`
      SELECT subject_id, subject_name, subject_name_zh, subject_name_en, is_elective
      FROM subject
      WHERE is_nominatable = TRUE
      ORDER BY subject_id
    `);
    const [classCounts] = await db.query(`
      SELECT class_id, COUNT(*) AS student_count
      FROM student
      WHERE status = 'active'
      GROUP BY class_id
    `);
    const [electiveChoices] = await db.query(`
      SELECT DISTINCT
        st.student_id,
        st.class_id,
        chosen.subject_name,
        chosen.subject_name_zh,
        chosen.subject_name_en
      FROM student st
      JOIN subject chosen
        ON chosen.subject_id IN (st.x1_subject_id, st.x2_subject_id, st.x3_subject_id)
      WHERE st.status = 'active'
    `);

    const electiveStudents = new Map();
    electiveChoices.forEach(choice => {
      const key = `${subjectCanonicalKey(choice)}|${choice.class_id}`;
      if (!electiveStudents.has(key)) electiveStudents.set(key, new Set());
      electiveStudents.get(key).add(Number(choice.student_id));
    });

    const rows = [];
    subjects.forEach(subject => {
      classCounts.forEach(cls => {
        if (!subject.is_elective) {
          rows.push({
            subject_id: subject.subject_id,
            class_id: cls.class_id,
            student_count: Number(cls.student_count)
          });
          return;
        }

        const selected = electiveStudents.get(`${subjectCanonicalKey(subject)}|${cls.class_id}`);
        if (selected && selected.size) {
          rows.push({
            subject_id: subject.subject_id,
            class_id: cls.class_id,
            student_count: selected.size
          });
        }
      });
    });
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subject class counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/findElective', ensureJWT, canReadSchoolData, getElectiveSubjectOptions);
router.get('/head-options', ensureJWT, canReadSchoolData, getSubjectHeadOptions);

router.post('/list', ensureJWT, canReadSchoolData, getStudentElectives);

router.post('/electiveName', ensureJWT, canReadSchoolData, getElectives);

export default router;
