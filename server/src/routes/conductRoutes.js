import express from 'express';
import { ensureJWT, ensureTeacherIdentity } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import { insertConduct, getVotedStudents, deleteConduct, getConductResults, getSelectConduct } from '../controllers/conductController.js';


const router = express.Router();
router.use(ensureJWT);
router.use(requirePermission('nominations'));

router.post('/insert', ensureTeacherIdentity, insertConduct);
router.get('/voted/:subject_id', ensureTeacherIdentity, getVotedStudents);
router.delete('/delete', ensureTeacherIdentity, deleteConduct);
router.get("/results", getConductResults);
router.get("/students", ensureTeacherIdentity, getSelectConduct);

export default router;
