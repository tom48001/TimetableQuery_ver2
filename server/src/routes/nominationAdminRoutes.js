import express from 'express';
import pool from '../db.js';
import { ensureJWT, checkRole } from '../auth/auth.js';

const router = express.Router();

router.use(ensureJWT);
router.use(checkRole('manager'));

router.delete('/reset-all', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [conduct] = await conn.query('DELETE FROM nomination');
    const [prefect] = await conn.query('DELETE FROM prefect_nomination');
    const [bla] = await conn.query('DELETE FROM BLA');
    const [learningGoals] = await conn.query('DELETE FROM learning_goal_record');
    await conn.commit();
    res.json({
      code: 'NOMINATIONS_RESET',
      message: 'All annual nomination records have been reset.',
      deleted: {
        conduct: conduct.affectedRows,
        prefect: prefect.affectedRows,
        bestLearningAttitude: bla.affectedRows,
        learningGoals: learningGoals.affectedRows
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error('Failed to reset annual nominations:', error);
    res.status(500).json({ code: 'NOMINATION_RESET_FAILED', error: 'Failed to reset annual nomination records.' });
  } finally {
    conn.release();
  }
});

export default router;
