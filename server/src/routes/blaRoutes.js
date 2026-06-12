import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import { insertBLA, getVotedStudents, deleteBLA, getBLAResults, getSelectBLA } from '../controllers/blaController.js';

const router = express.Router();
router.use(ensureJWT);
router.use(requirePermission('nominations'));

router.post('/insert', insertBLA);
router.get('/voted/:subject_id', getVotedStudents);
router.delete('/delete', deleteBLA);
router.get("/results", getBLAResults);
router.get("/students", getSelectBLA);

export default router;
