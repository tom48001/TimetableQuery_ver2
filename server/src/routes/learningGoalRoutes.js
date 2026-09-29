import express from 'express';
import { checkRole, ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import {
  getLearningGoalResults,
  getLearningGoalRewardRules,
  getTeacherLearningGoals,
  updateLearningGoalRewardRules,
  upsertLearningGoals
} from '../controllers/learningGoalController.js';

const router = express.Router();
router.use(ensureJWT);
router.use(requirePermission('nominations'));

router.post('/records', upsertLearningGoals);
router.get('/records', getTeacherLearningGoals);
router.get('/results', getLearningGoalResults);
router.get('/reward-rules', getLearningGoalRewardRules);
router.put('/reward-rules', checkRole('manager'), updateLearningGoalRewardRules);

export default router;
