import pool from '../db.js';
import { ensureStudentAdminSchema } from './manageStudentController.js';
import {
  normalizeCompletedGoals
} from '../utils/learningGoalReward.js';

const MESSAGES = {
  missingTeacher: '\u627e\u4e0d\u5230\u6b64\u5e33\u6236\u5c0d\u61c9\u7684\u8001\u5e2b\u8cc7\u6599\uff0c\u672a\u80fd\u5132\u5b58\u3002',
  invalidRecords: '\u8acb\u63d0\u4f9b\u6709\u6548\u7684\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u3002',
  noRecords: '\u6c92\u6709\u53ef\u5132\u5b58\u7684\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u3002',
  saved: '\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u5df2\u5132\u5b58\u3002',
  saveFailed: '\u5132\u5b58\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u5931\u6557\u3002',
  loadFailed: '\u8b80\u53d6\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u5931\u6557\u3002',
  resultFailed: '\u8b80\u53d6\u5b78\u7fd2\u76ee\u6a19\u734e\u52f5\u7d50\u679c\u5931\u6557\u3002'
};

let learningGoalSchemaReady = false;

function normalizeSemester(value) {
  return value === 'second' ? 'second' : 'first';
}

async function ensureLearningGoalSchema() {
  if (learningGoalSchemaReady) return;

  try {
    await pool.query(
      "ALTER TABLE learning_goal_record ADD COLUMN semester ENUM('first','second') NOT NULL DEFAULT 'first'"
    );
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) throw error;
  }

  const [legacyUniqueIndex] = await pool.query(
    "SHOW INDEX FROM learning_goal_record WHERE Key_name = 'unique_learning_goal_record'"
  );
  const legacyHasSemester = legacyUniqueIndex.some(index => index.Column_name === 'semester');

  const [semesterUniqueIndex] = await pool.query(
    "SHOW INDEX FROM learning_goal_record WHERE Key_name = 'unique_learning_goal_record_semester'"
  );

  if (!semesterUniqueIndex.length && !legacyHasSemester) {
    await pool.query(
      `ALTER TABLE learning_goal_record
       ADD UNIQUE KEY unique_learning_goal_record_semester (teacher_id, student_id, semester)`
    );
  }

  if (legacyUniqueIndex.length && !legacyHasSemester) {
    await pool.query('ALTER TABLE learning_goal_record DROP INDEX unique_learning_goal_record');
  }

  await pool.query(
    `CREATE TABLE IF NOT EXISTS learning_goal_reward_rule (
      rule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      min_goals INT NOT NULL,
      max_goals INT NOT NULL,
      award_name VARCHAR(100) NOT NULL,
      has_prize BOOLEAN NOT NULL DEFAULT FALSE,
      merit_offset_count INT NOT NULL DEFAULT 0,
      display_order INT NOT NULL DEFAULT 0
    )`
  );

  await pool.query(
    `INSERT INTO learning_goal_reward_rule
      (min_goals, max_goals, award_name, has_prize, merit_offset_count, display_order)
     SELECT defaults.min_goals, defaults.max_goals, defaults.award_name,
            defaults.has_prize, defaults.merit_offset_count, defaults.display_order
     FROM (
       SELECT 2 min_goals, 2 max_goals, '紀念品' award_name, FALSE has_prize, 0 merit_offset_count, 1 display_order
       UNION ALL SELECT 3, 4, '銅獎', TRUE, 1, 2
       UNION ALL SELECT 5, 6, '銀獎', TRUE, 1, 3
       UNION ALL SELECT 7, 8, '金獎', TRUE, 2, 4
     ) defaults
     WHERE NOT EXISTS (SELECT 1 FROM learning_goal_reward_rule)`
  );

  learningGoalSchemaReady = true;
}

async function loadRewardRules(connection = pool) {
  const [rules] = await connection.query(
    `SELECT rule_id, min_goals, max_goals, award_name, has_prize,
            merit_offset_count, display_order
     FROM learning_goal_reward_rule
     ORDER BY display_order, min_goals`
  );
  return rules.map(rule => ({
    ...rule,
    has_prize: Boolean(rule.has_prize)
  }));
}

function rewardForGoals(rules, completedGoals) {
  const rule = rules.find(item => (
    completedGoals >= Number(item.min_goals) &&
    completedGoals <= Number(item.max_goals)
  ));
  return rule
    ? {
      award: rule.award_name,
      prize: Boolean(rule.has_prize),
      merit_offset_count: Number(rule.merit_offset_count) || 0
    }
    : {
      award: '未獲獎',
      prize: false,
      merit_offset_count: 0
    };
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
    await ensureLearningGoalSchema();
    const { teacher_id, records } = req.body;
    const semester = normalizeSemester(req.body.semester);
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
        completed_goals: normalizeCompletedGoals(record.completed_goals)
      }))
      .filter(record => record.student_id);

    if (normalizedRecords.length === 0) {
      return res.status(400).json({ error: MESSAGES.noRecords });
    }

    const values = normalizedRecords.map(record => [
      resolvedTeacherId,
      record.student_id,
      record.completed_goals,
      semester
    ]);

    await pool.query(
      `
      INSERT INTO learning_goal_record (teacher_id, student_id, completed_goals, semester)
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
    await ensureLearningGoalSchema();
    const resolvedTeacherId = await getTeacherId(req, req.query.teacher_id);
    const semester = normalizeSemester(req.query.semester);

    if (!resolvedTeacherId) {
      return res.status(400).json({ error: MESSAGES.missingTeacher });
    }

    const [rows] = await pool.query(
      `
      SELECT student_id, completed_goals
      FROM learning_goal_record
      WHERE teacher_id = ? AND semester = ?
      `,
      [resolvedTeacherId, semester]
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
    await ensureLearningGoalSchema();
    await ensureStudentAdminSchema();
    const semester = normalizeSemester(req.query.semester);
    const rewardRules = await loadRewardRules();
    const [rows] = await pool.query(
      `
      SELECT
        s.student_id,
        s.regno,
        c.class_name,
        c.grade_level,
        s.class_number,
        s.student_ch_name,
        s.student_eng_name,
        s.sex,
        x1.subject_name AS x1_subject_name,
        x2.subject_name AS x2_subject_name,
        x3.subject_name AS x3_subject_name,
        COALESCE(SUM(lgr.completed_goals), 0) AS completed_goals
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      LEFT JOIN subject x1 ON s.x1_subject_id = x1.subject_id
      LEFT JOIN subject x2 ON s.x2_subject_id = x2.subject_id
      LEFT JOIN subject x3 ON s.x3_subject_id = x3.subject_id
      LEFT JOIN learning_goal_record lgr
        ON s.student_id = lgr.student_id
       AND lgr.semester = ?
      GROUP BY
        s.student_id, s.regno, c.class_name, c.grade_level, s.class_number,
        s.student_ch_name, s.student_eng_name, s.sex,
        x1.subject_name, x2.subject_name, x3.subject_name
      HAVING completed_goals > 0
      ORDER BY
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        FIELD(SUBSTRING(c.class_name, 2, 1), 'M', 'A', 'R', 'Y'),
        CAST(s.class_number AS UNSIGNED),
        s.student_ch_name
      `,
      [semester]
    );

    const results = rows.map(row => {
      const completedGoals = normalizeCompletedGoals(row.completed_goals);
      const reward = rewardForGoals(rewardRules, completedGoals);
      return {
        student_id: row.student_id,
        sid: row.regno || String(row.student_id),
        class_name: row.class_name,
        class_number: row.class_number,
        student_ch_name: row.student_ch_name,
        student_eng_name: row.student_eng_name,
        sex: row.sex,
        electives: /^F?[4-6]$/i.test(String(row.grade_level || ''))
          ? [row.x1_subject_name, row.x2_subject_name, row.x3_subject_name].filter(Boolean)
          : [],
        semester,
        completed_goals: completedGoals,
        ...reward
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

export const getLearningGoalRewardRules = async (req, res) => {
  try {
    await ensureLearningGoalSchema();
    res.json(await loadRewardRules());
  } catch (error) {
    console.error('Failed to load learning goal reward rules:', error);
    res.status(500).json({ error: '讀取獎勵規則失敗。', detail: error.message });
  }
};

export const updateLearningGoalRewardRules = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await ensureLearningGoalSchema();
    const rules = Array.isArray(req.body.rules) ? req.body.rules : [];
    const normalized = rules.map((rule, index) => ({
      min_goals: Math.max(0, Math.floor(Number(rule.min_goals))),
      max_goals: Math.min(8, Math.floor(Number(rule.max_goals))),
      award_name: String(rule.award_name || '').trim(),
      has_prize: Boolean(rule.has_prize),
      merit_offset_count: Math.max(0, Math.floor(Number(rule.merit_offset_count) || 0)),
      display_order: index + 1
    }));

    if (!normalized.length || normalized.some(rule => (
      !Number.isFinite(rule.min_goals) ||
      !Number.isFinite(rule.max_goals) ||
      rule.min_goals > rule.max_goals ||
      !rule.award_name
    ))) {
      return res.status(400).json({ error: '請提供有效的獎勵規則。' });
    }

    const occupiedGoals = new Set();
    for (const rule of normalized) {
      for (let goal = rule.min_goals; goal <= rule.max_goals; goal += 1) {
        if (occupiedGoals.has(goal)) {
          return res.status(400).json({ error: `目標數目 ${goal} 的獎勵範圍重疊。` });
        }
        occupiedGoals.add(goal);
      }
    }

    await connection.beginTransaction();
    await connection.query('DELETE FROM learning_goal_reward_rule');
    await connection.query(
      `INSERT INTO learning_goal_reward_rule
        (min_goals, max_goals, award_name, has_prize, merit_offset_count, display_order)
       VALUES ?`,
      [normalized.map(rule => [
        rule.min_goals,
        rule.max_goals,
        rule.award_name,
        rule.has_prize,
        rule.merit_offset_count,
        rule.display_order
      ])]
    );
    await connection.commit();
    res.json({ message: '獎勵規則已更新。', rules: await loadRewardRules() });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to update learning goal reward rules:', error);
    res.status(500).json({ error: '更新獎勵規則失敗。', detail: error.message });
  } finally {
    connection.release();
  }
};
