import express from 'express';
import { ensureSession } from '../auth/auth.js';
import { requireAnyPermission, requirePermission } from '../auth/permissions.js';
import db from '../db.js';
import {
  getStudents,
  getStudentsBySubject,
  getStudentTimetable,
  getStudentsByClassId,
  getStudentsByClassNSubject
} from '../controllers/studentController.js';
import {
  getManagedStudents,
  getElectiveSubjects,
  createManagedStudent,
  updateManagedStudent,
  deleteManagedStudent,
  setManagedStudentStatus
} from '../controllers/manageStudentController.js';

const router = express.Router();
const canReadStudentData = requireAnyPermission(['timetable', 'nominations', 'manageStudents']);

router.get('/admin/list', ensureSession, requirePermission('manageStudents'), getManagedStudents);
router.get('/admin/elective-subjects', ensureSession, requirePermission('manageStudents'), getElectiveSubjects);
router.post('/admin', ensureSession, requirePermission('manageStudents'), createManagedStudent);
router.put('/admin/:studentId', ensureSession, requirePermission('manageStudents'), updateManagedStudent);
router.delete('/admin/:studentId', ensureSession, requirePermission('manageStudents'), deleteManagedStudent);
router.patch('/admin/:studentId/status', ensureSession, requirePermission('manageStudents'), setManagedStudentStatus);

router.get('/by-class/:classId/subject/:subjectId', ensureSession, canReadStudentData, getStudentsByClassNSubject);
router.get('/by-class/:classId', ensureSession, canReadStudentData, getStudentsByClassId);
router.post('/by-subject', ensureSession, canReadStudentData, getStudentsBySubject);

router.get('/elective-subjects', ensureSession, canReadStudentData, async (req, res) => {
  const [rows] = await db.query('SELECT DISTINCT subject_name FROM elective_subjects');
  res.json(rows.map(row => row.subject_name));
});

router.post('/elective-students', ensureSession, canReadStudentData, async (req, res) => {
  const { formLevel, subjectName } = req.body;

  const [rows] = await db.query(
    `SELECT s.name, s.english_name, s.student_id, s.gender,
            c.class_name, e.subject_name
     FROM student s
     JOIN class c ON s.class_id = c.class_id
     JOIN elective_subjects e ON e.student_id = s.student_id
     WHERE c.form_level = ? AND e.subject_name = ?`,
    [formLevel, subjectName]
  );

  res.json(rows);
});

router.get('/:studentId/timetable', ensureSession, requirePermission('timetable'), getStudentTimetable);
router.get('/', ensureSession, canReadStudentData, getStudents);

export default router;
