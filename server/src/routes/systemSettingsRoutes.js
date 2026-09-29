import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requireRole } from '../auth/permissions.js';
import {
  getSemesterAdministration,
  replaceJuniorRules,
  updateSemesterSettings
} from '../controllers/systemSettingsController.js';

const router = express.Router();
const managerOnly = requireRole('manager');

router.get('/semester', ensureJWT, managerOnly, getSemesterAdministration);
router.put('/semester', ensureJWT, managerOnly, updateSemesterSettings);
router.put('/junior-subject-rules', ensureJWT, managerOnly, replaceJuniorRules);

export default router;
