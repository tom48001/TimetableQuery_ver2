import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import {
  addSplitLessonGroupTeacher,
  deleteSplitLessonGroupTeacher,
  getSplitLessonGroupDetail,
  getSplitLessonGroups,
  saveSplitLessonGroupAssignments
} from '../controllers/lessonGroupController.js';

const router = express.Router();

router.use(ensureJWT);
router.use(requirePermission('timetable'));

router.get('/', getSplitLessonGroups);
router.get('/detail', getSplitLessonGroupDetail);
router.post('/teachers', addSplitLessonGroupTeacher);
router.delete('/teachers/:timetableId', deleteSplitLessonGroupTeacher);
router.post('/assignments', saveSplitLessonGroupAssignments);

export default router;
