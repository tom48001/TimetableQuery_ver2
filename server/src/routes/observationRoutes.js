import express from 'express';
import { ensureSession } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';

import { getObservationSchedule } from '../controllers/observationController.js';

const router = express.Router();

// 所有路由都需登入
router.use(ensureSession);
router.use(requirePermission('timetable'));

router.post('/observe/schedule', getObservationSchedule);

export default router;