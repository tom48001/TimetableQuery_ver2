import express from 'express';
import ensureJWT from '../auth/authMiddleware.js';
import { insertBLA } from '../controllers/blaController.js';
import { getBLAResults } from "../controllers/blaController.js";

const router = express.Router();
router.use(ensureJWT);

router.post('/insert', insertBLA);
router.get("/results", getBLAResults);


export default router;
