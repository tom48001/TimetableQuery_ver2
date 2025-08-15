import express from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import { insertBLA, getVotedStudents, deleteBLA, getBLAResults, getSelectBLA } from '../controllers/blaController.js';

const router = express.Router();
router.use(ensureJWT);

router.post('/insert', insertBLA);
router.get('/voted/:subject_id', getVotedStudents);
router.delete('/delete', deleteBLA);
router.get("/results", getBLAResults);
router.get("/students", getSelectBLA);


export default router;
