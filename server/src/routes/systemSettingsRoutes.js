import express from 'express';
import { ensureSession } from '../auth/auth.js';
import { requireRole } from '../auth/permissions.js';
import {
  getSemesterAdministration,
  replaceJuniorRules,
  updateSemesterSettings
} from '../controllers/systemSettingsController.js';

const router = express.Router();
const managerOnly = requireRole('manager');

router.get('/semester', ensureSession, managerOnly, getSemesterAdministration);
router.put('/semester', ensureSession, managerOnly, updateSemesterSettings);
router.put('/junior-subject-rules', ensureSession, managerOnly, replaceJuniorRules);

export default router;
