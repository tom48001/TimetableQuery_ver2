import db from '../db.js';

let settingsSchemaReady = false;

export async function ensureSystemSettingsSchema(conn = db) {
  if (settingsSchemaReady) return;
  await conn.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value VARCHAR(255) NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await conn.query(`
    INSERT IGNORE INTO system_settings (setting_key, setting_value)
    VALUES ('academic_year', '2026-2027'), ('current_semester', '1')
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS junior_subject_allocation_rule (
      rule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      grade ENUM('F1', 'F2', 'F3') NOT NULL,
      semester TINYINT NOT NULL,
      subject_id BIGINT NOT NULL,
      class_group ENUM('odd', 'even', 'all', 'disabled') NOT NULL DEFAULT 'disabled',
      UNIQUE KEY unique_junior_allocation (grade, semester, subject_id),
      INDEX idx_junior_allocation_lookup (grade, semester, class_group),
      CONSTRAINT fk_junior_allocation_subject
        FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  settingsSchemaReady = true;
}

export async function loadSchoolSettings(conn = db) {
  await ensureSystemSettingsSchema(conn);
  const [rows] = await conn.query(
    "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('academic_year', 'current_semester')"
  );
  const values = Object.fromEntries(rows.map(row => [row.setting_key, row.setting_value]));
  return {
    academic_year: values.academic_year || '2026-2027',
    current_semester: Number(values.current_semester) === 2 ? 2 : 1,
    automatic_semester_switching: false
  };
}

export const getSemesterAdministration = async (req, res) => {
  try {
    const settings = await loadSchoolSettings();
    const [rules] = await db.query(`
      SELECT rule.rule_id, rule.grade, rule.semester, rule.subject_id, rule.class_group,
             subject.subject_name, subject.subject_name_zh, subject.subject_name_en
      FROM junior_subject_allocation_rule rule
      JOIN subject ON subject.subject_id = rule.subject_id
      ORDER BY FIELD(rule.grade, 'F1', 'F2', 'F3'), rule.semester, subject.subject_name
    `);
    const [subjects] = await db.query(`
      SELECT DISTINCT subject.subject_id, subject.subject_name, subject.subject_name_zh, subject.subject_name_en
      FROM subject
      JOIN timetable ON timetable.subject_id = subject.subject_id
      JOIN class ON class.class_id = timetable.class_id
      WHERE class.grade_level IN ('F1', 'F2', 'F3')
      ORDER BY subject.subject_name
    `);
    res.json({ settings, rules, subjects });
  } catch (error) {
    console.error('Failed to load semester administration:', error);
    res.status(500).json({ error: 'Failed to load semester settings.' });
  }
};

export const updateSemesterSettings = async (req, res) => {
  const academicYear = String(req.body.academic_year || '').trim();
  const semester = Number(req.body.current_semester);
  if (!/^\d{4}-\d{4}$/.test(academicYear) || ![1, 2].includes(semester)) {
    return res.status(400).json({ error: 'Invalid academic year or semester.' });
  }
  try {
    await ensureSystemSettingsSchema();
    await db.query(
      `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?), (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      ['academic_year', academicYear, 'current_semester', String(semester)]
    );
    res.json({ academic_year: academicYear, current_semester: semester, automatic_semester_switching: false });
  } catch (error) {
    console.error('Failed to update semester settings:', error);
    res.status(500).json({ error: 'Failed to save semester settings.' });
  }
};

export const replaceJuniorRules = async (req, res) => {
  const rules = Array.isArray(req.body.rules) ? req.body.rules : [];
  const normalized = rules.map(rule => ({
    grade: String(rule.grade || '').toUpperCase(),
    semester: Number(rule.semester),
    subject_id: Number(rule.subject_id),
    class_group: String(rule.class_group || '').toLowerCase()
  }));
  const validGroups = new Set(['odd', 'even', 'all', 'disabled']);
  const keys = normalized.map(rule => `${rule.grade}|${rule.semester}|${rule.subject_id}`);
  const invalid = normalized.some(rule =>
    !['F1', 'F2', 'F3'].includes(rule.grade) || ![1, 2].includes(rule.semester) ||
    !Number.isInteger(rule.subject_id) || rule.subject_id <= 0 || !validGroups.has(rule.class_group)
  );
  if (invalid || new Set(keys).size !== keys.length) {
    return res.status(400).json({ error: 'Invalid or duplicate junior subject rules.' });
  }

  const conn = await db.getConnection();
  try {
    await ensureSystemSettingsSchema(conn);
    await conn.beginTransaction();
    if (normalized.length) {
      const [subjectRows] = await conn.query('SELECT subject_id FROM subject WHERE subject_id IN (?)', [normalized.map(rule => rule.subject_id)]);
      if (subjectRows.length !== new Set(normalized.map(rule => rule.subject_id)).size) {
        await conn.rollback();
        return res.status(400).json({ error: 'One or more subjects do not exist.' });
      }
    }
    await conn.query('DELETE FROM junior_subject_allocation_rule');
    if (normalized.length) {
      await conn.query(
        'INSERT INTO junior_subject_allocation_rule (grade, semester, subject_id, class_group) VALUES ?',
        [normalized.map(rule => [rule.grade, rule.semester, rule.subject_id, rule.class_group])]
      );
    }
    await conn.commit();
    res.json({ message: 'Junior subject allocation rules saved.', rules: normalized });
  } catch (error) {
    await conn.rollback();
    console.error('Failed to replace junior rules:', error);
    res.status(500).json({ error: 'Failed to save junior subject rules.' });
  } finally {
    conn.release();
  }
};
