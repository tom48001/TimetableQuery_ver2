import express from 'express';
import { ensureSession, ensureTeacherIdentity } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import {
  deletePrefect,
  getPrefectResults,
  getSelectPrefect,
  insertPrefect
} from '../controllers/prefectController.js';

const router = express.Router();
router.use(ensureSession);
router.use(requirePermission('nominations'));

router.post('/insert', ensureTeacherIdentity, insertPrefect);
router.delete('/delete', ensureTeacherIdentity, deletePrefect);
router.get('/results', getPrefectResults);
router.get('/students', ensureTeacherIdentity, getSelectPrefect);

export default router;
