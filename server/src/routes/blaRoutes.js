import express from 'express';
import { ensureJWT, ensureTeacherIdentity } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import { insertBLA, getVotedStudents, deleteBLA, getBLAResults, getSelectBLA } from '../controllers/blaController.js';

const router = express.Router();
router.use(ensureJWT);
router.use(requirePermission('nominations'));

router.post('/insert', ensureTeacherIdentity, insertBLA);
router.get('/voted/:subject_id', ensureTeacherIdentity, getVotedStudents);
router.delete('/delete', ensureTeacherIdentity, deleteBLA);
router.get("/results", getBLAResults);
router.get("/students", ensureTeacherIdentity, getSelectBLA);

export default router;
