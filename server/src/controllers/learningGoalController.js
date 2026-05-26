import pool from '../db.js';

const MESSAGES = {
  missingTeacher: '\u627e\u4e0d\u5230\u6b64\u5e33\u6236\u5c0d\u61c9\u7684\u8001\u5e2b\u8cc7\u6599\uff0c\u672a\u80fd\u5132\u5b58\u3002',
  invalidRecords: '\u8acb\u63d0\u4f9b\u6709\u6548\u7684\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u3002',
  noRecords: '\u6c92\u6709\u53ef\u5132\u5b58\u7684\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u3002',
  saved: '\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u5df2\u5132\u5b58\u3002',
  saveFailed: '\u5132\u5b58\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u5931\u6557\u3002',
  loadFailed: '\u8b80\u53d6\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u5931\u6557\u3002',
  resultFailed: '\u8b80\u53d6\u5b78\u7fd2\u76ee\u6a19\u734e\u52f5\u7d50\u679c\u5931\u6557\u3002'
};

function getAward(totalGoals) {
  if (totalGoals >= 8) return '\u91d1\u7ae0\u734e';
  if (totalGoals >= 6) return '\u9280\u7ae0\u734e';
  if (totalGoals >= 3) return '\u9285\u7ae0\u734e';
  if (totalGoals >= 2) return '\u7d00\u5ff5\u54c1';
  return '\u672a\u7372\u734e';
}

async function getTeacherId(req, providedTeacherId) {
  if (providedTeacherId) return Number(providedTeacherId);

  const userId = req.user?.id;
  if (!userId) return null;

  const [rows] = await pool.query(
    'SELECT teacher_id FROM teacher WHERE user_id = ?',
    [userId]
  );

  return rows.length ? rows[0].teacher_id : null;
}

export const upsertLearningGoals = async (req, res) => {
  try {
    const { teacher_id, records } = req.body;
    const resolvedTeacherId = await getTeacherId(req, teacher_id);

    if (!resolvedTeacherId) {
      return res.status(400).json({ error: MESSAGES.missingTeacher });
    }

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: MESSAGES.invalidRecords });
    }

    const normalizedRecords = records
      .map(record => ({
        student_id: String(record.student_id || '').trim(),
        completed_goals: Math.max(0, Number(record.completed_goals) || 0)
      }))
      .filter(record => record.student_id);

    if (normalizedRecords.length === 0) {
      return res.status(400).json({ error: MESSAGES.noRecords });
    }

    const values = normalizedRecords.map(record => [
      resolvedTeacherId,
      record.student_id,
      record.completed_goals
    ]);

    await pool.query(
      `
      INSERT INTO learning_goal_record (teacher_id, student_id, completed_goals)
      VALUES ?
      ON DUPLICATE KEY UPDATE completed_goals = VALUES(completed_goals)
      `,
      [values]
    );

    res.json({ message: MESSAGES.saved, updated: normalizedRecords.length });
  } catch (error) {
    console.error('Failed to save learning goal records:', error);
    res.status(500).json({
      error: MESSAGES.saveFailed,
      detail: error.message
    });
  }
};

export const getTeacherLearningGoals = async (req, res) => {
  try {
    const resolvedTeacherId = await getTeacherId(req, req.query.teacher_id);

    if (!resolvedTeacherId) {
      return res.status(400).json({ error: MESSAGES.missingTeacher });
    }

    const [rows] = await pool.query(
      `
      SELECT student_id, completed_goals
      FROM learning_goal_record
      WHERE teacher_id = ?
      `,
      [resolvedTeacherId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Failed to load learning goal records:', error);
    res.status(500).json({
      error: MESSAGES.loadFailed,
      detail: error.message
    });
  }
};

export const getLearningGoalResults = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        s.student_id,
        c.class_name,
        s.class_number,
        s.student_ch_name,
        COALESCE(SUM(lgr.completed_goals), 0) AS completed_goals
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      LEFT JOIN learning_goal_record lgr ON s.student_id = lgr.student_id
      GROUP BY s.student_id, c.class_name, s.class_number, s.student_ch_name
      HAVING completed_goals > 0
      ORDER BY
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        FIELD(SUBSTRING(c.class_name, 2, 1), 'M', 'A', 'R', 'Y'),
        CAST(s.class_number AS UNSIGNED),
        s.student_ch_name
      `
    );

    const results = rows.map(row => {
      const completedGoals = Number(row.completed_goals) || 0;
      return {
        student_id: row.student_id,
        class_name: row.class_name,
        class_number: row.class_number,
        student_ch_name: row.student_ch_name,
        completed_goals: completedGoals,
        award: getAward(completedGoals),
        merit_offset_count: completedGoals
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Failed to load learning goal results:', error);
    res.status(500).json({
      error: MESSAGES.resultFailed,
      detail: error.message
    });
  }
};
