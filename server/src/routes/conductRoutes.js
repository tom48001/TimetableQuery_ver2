import express from 'express';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import { insertConduct, getVotedStudents, deleteConduct, getConductResults, getSelectConduct } from '../controllers/conductController.js';


const router = express.Router();
router.use(ensureJWT);
router.use(requirePermission('nominations'));

router.post('/insert', insertConduct);
router.get('/voted/:subject_id', getVotedStudents);
router.delete('/delete', deleteConduct);
router.get("/results", getConductResults);
router.get("/students", getSelectConduct);

export default router;