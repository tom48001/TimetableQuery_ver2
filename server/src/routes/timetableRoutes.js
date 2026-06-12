import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import {
  getTeachersSchedule,
  getFreeTeachers,
  getClassScheduleById,
  getRoomSchedule
} from '../controllers/timetableController.js';
import { getStudentTimetable } from '../controllers/studentController.js';

const router = express.Router();

router.use(ensureJWT);
router.use(requirePermission('timetable'));

router.post('/teachers-schedule', getTeachersSchedule);
router.post('/free-teachers', getFreeTeachers);
router.get('/class/schedule/:classId', getClassScheduleById);
router.get('/room/schedule/:roomName', getRoomSchedule);
router.get('/student/:studentId/timetable', getStudentTimetable);

export default router;
