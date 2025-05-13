import express from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import {
  getTeacherLessons,
  getSubstituteCandidates
} from '../controllers/swapController.js';

const router = express.Router();

router.use(ensureJWT);

// 取得老師的所有課堂（調課用）
router.get('/teacher-lessons/:teacherId', getTeacherLessons);

// 查找可代課老師
router.post('/substitute-candidates', getSubstituteCandidates);

export default router;
