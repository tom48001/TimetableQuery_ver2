import express from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import db from '../db.js';
import {
  getStudents,
  getStudentsBySubject,
  getStudentTimetable,
  getStudentsByClassId
} from '../controllers/studentController.js';

const router = express.Router();

// 所有路由需登入才能查
router.use(ensureJWT);

// 根據班級 ID 查學生
router.get('/by-class/:classId', ensureJWT, getStudentsByClassId);

// 取得所有學生資料
router.get('/', getStudents);

// 根據級別與科目查學生
router.post('/by-subject', getStudentsBySubject);

// 根據學生 ID 查學生課表
router.get('/:studentId/timetable', getStudentTimetable);

// 根據班級 ID 查學生的選修科目
router.get('/elective-subjects', async (req, res) => {
  const [rows] = await db.query('SELECT DISTINCT subject_name FROM elective_subjects');
  res.json(rows.map(r => r.subject_name));
});

// 根據班級 ID 查學生的選修科目
router.post('/elective-students', async (req, res) => {
  const { formLevel, subjectName } = req.body;

  // 確保有傳入 formLevel 和 subjectName
  const [rows] = await db.query(
    `SELECT s.name, s.english_name, s.student_id, s.gender,
           c.class_name, e.subject_name
    FROM student s
    JOIN class c ON s.class_id = c.class_id
    JOIN elective_subjects e ON e.student_id = s.student_id
    WHERE c.form_level = ? AND e.subject_name = ?`, [formLevel, subjectName]);

  res.json(rows);
});

export default router;
