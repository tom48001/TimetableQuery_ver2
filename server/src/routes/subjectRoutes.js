import { groupNominationSubjects } from '../utils/nominationSubjects.js';
import express from 'express';
import { ensureSession } from '../auth/auth.js';
import { requireAnyPermission } from '../auth/permissions.js';
import db from '../db.js';
import { getStudentElectives, getElectives, getElectiveSubjectOptions, getSubjectHeadOptions } from '../controllers/subjectController.js';
import { ensureStudentAdminSchema } from '../controllers/manageStudentController.js';
import { loadNominationEligibility } from '../utils/nominationEligibility.js';
import { fillChineseSubjectNames } from '../utils/subjectDisplayNames.js';

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

router.get('/', ensureSession, canReadSchoolData, async (req, res) => {
  try {
    await fillChineseSubjectNames(db);
    const [rows] = await db.query('SELECT * FROM subject ORDER BY subject_id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/nomination-options', ensureSession, canReadSchoolData, async (req, res) => {
  try {
    await fillChineseSubjectNames(db);
    const [subjects] = await db.query('SELECT * FROM subject');
    res.json(groupNominationSubjects(subjects));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/class-counts', ensureSession, canReadSchoolData, async (req, res) => {
  try {
    await ensureSubjectNominationColumn();
    await ensureStudentAdminSchema();
    const eligible = await loadNominationEligibility(db);
    const counts = new Map();
    for (const row of eligible) {
      const key = row.subject_id + ':' + row.class_id;
      if (!counts.has(key)) counts.set(key, { subject_id: row.subject_id, class_id: row.class_id, student_count: 0 });
      counts.get(key).student_count += 1;
    }
    const rows = [...counts.values()];
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subject class counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/findElective', ensureSession, canReadSchoolData, getElectiveSubjectOptions);
router.get('/head-options', ensureSession, canReadSchoolData, getSubjectHeadOptions);

router.post('/list', ensureSession, canReadSchoolData, getStudentElectives);

router.post('/electiveName', ensureSession, canReadSchoolData, getElectives);

export default router;
