import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import {
  deletePrefect,
  getPrefectResults,
  getSelectPrefect,
  insertPrefect
} from '../controllers/prefectController.js';

const router = express.Router();
router.use(ensureJWT);
router.use(requirePermission('nominations'));

router.post('/insert', insertPrefect);
router.delete('/delete', deletePrefect);
router.get('/results', getPrefectResults);
router.get('/students', getSelectPrefect);

export default router;
