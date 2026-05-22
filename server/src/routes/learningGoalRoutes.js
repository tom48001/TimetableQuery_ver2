import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import {
  getLearningGoalResults,
  getTeacherLearningGoals,
  upsertLearningGoals
} from '../controllers/learningGoalController.js';

const router = express.Router();
router.use(ensureJWT);

router.post('/records', upsertLearningGoals);
router.get('/records', getTeacherLearningGoals);
router.get('/results', getLearningGoalResults);

export default router;
