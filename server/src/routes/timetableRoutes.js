import express from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import {
  getTeachersSchedule,
  getFreeTeachers,
  getClassScheduleById,
  getRoomSchedule
} from '../controllers/timetableController.js';
import { getStudentTimetable } from '../controllers/studentController.js';

const router = express.Router();

// 所有課表查詢都需登入
router.use(ensureJWT);

// 多位老師 / 觀課老師課表
router.post('/teachers-schedule', getTeachersSchedule);

// 查空堂老師（day, period）
router.post('/free-teachers', getFreeTeachers);

// 查班級課表（by classId）
router.get('/class/schedule/:classId', getClassScheduleById);

// 查教室課表（by room name）
router.get('/room/schedule/:roomName', getRoomSchedule);

// 查學生課表（by studentId）
router.get('/student/:studentId/timetable', getStudentTimetable);

export default router;
