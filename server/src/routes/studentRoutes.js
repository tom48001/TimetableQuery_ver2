import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
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
  createManagedStudent,
  deleteManagedStudent
} from '../controllers/manageStudentController.js';

const router = express.Router();

router.get('/admin/list', ensureJWT, requirePermission('manageStudents'), getManagedStudents);
router.post('/admin', ensureJWT, requirePermission('manageStudents'), createManagedStudent);
router.delete('/admin/:studentId', ensureJWT, requirePermission('manageStudents'), deleteManagedStudent);

router.get('/by-class/:classId/subject/:subjectId', ensureJWT, getStudentsByClassNSubject);
router.get('/by-class/:classId', ensureJWT, getStudentsByClassId);
router.post('/by-subject', ensureJWT, getStudentsBySubject);

router.get('/elective-subjects', ensureJWT, async (req, res) => {
  const [rows] = await db.query('SELECT DISTINCT subject_name FROM elective_subjects');
  res.json(rows.map(row => row.subject_name));
});

router.post('/elective-students', ensureJWT, async (req, res) => {
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

router.get('/:studentId/timetable', ensureJWT, getStudentTimetable);
router.get('/', ensureJWT, getStudents);

export default router;
