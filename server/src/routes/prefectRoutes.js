import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import {
  deletePrefect,
  getPrefectResults,
  getSelectPrefect,
  insertPrefect
} from '../controllers/prefectController.js';

const router = express.Router();
router.use(ensureJWT);

router.post('/insert', insertPrefect);
router.delete('/delete', deletePrefect);
router.get('/results', getPrefectResults);
router.get('/students', getSelectPrefect);

export default router;
