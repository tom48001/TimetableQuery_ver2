import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import pool from '../db.js';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import { ensureStudentAdminSchema } from '../controllers/manageStudentController.js';
import { ensureLessonGroupSchema } from '../controllers/lessonGroupController.js';
import { readGroupFile, parseStudentId } from '../utils/groupImport.js';
import { parseElectiveSubjectCode, subjectCanonicalKey } from '../utils/subjectCanonicalKey.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const DATABASE_BATCH_SIZE = 500;
let importHistorySchemaReady = false;
let studentImportHistorySchemaReady = false;

function chunks(values, size = DATABASE_BATCH_SIZE) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

async function insertRowsInBatches(conn, sql, values) {
  for (const batch of chunks(values)) {
    await conn.query(sql, [batch]);
  }
}

const REQUIRED_COLUMNS = ['teacher', 'subject', 'class', 'room', 'day', 'period'];
const REQUIRED_STUDENT_COLUMNS = [
  'regno',
  'student_ch_name',
  'student_eng_name',
  'class',
  'class_number',
  'sex'
];

const TIMETABLE_COLUMN_ALIASES = {
  teacher: ['abbreviation', 'abbr', 'teacher_code', 'teacher', '教師代號', '教師簡稱', '簡稱'],
  subject: ['subject', 'subject_name', '科目'],
  class: ['class', 'class_name', '班別', '班級', '級別'],
  room: ['room', 'room_name', '課室', '房間'],
  day: ['day', 'weekday', 'day_of_week', '星期', '上課日'],
  period: ['period', '節數', '課節']
};

const STUDENT_COLUMN_ALIASES = {
  regno: ['regno', 'reg_no', 'registration_no', 'registration_number', 'student_regno'],
  student_ch_name: ['student_ch_name', 'chinese_name', 'chi_name', 'ch_name', 'name_ch', '姓名', '中文名', '中文姓名'],
  student_eng_name: ['student_eng_name', 'english_name', 'eng_name', 'en_name', 'enname', 'name_en', '英文名', '英文姓名'],
  email: ['email', 'student_email', 'email_address', '電郵', '電郵地址'],
  grade: ['grade', 'grade_level', 'form', 'form_level', '級別', '年級'],
  class: ['class', 'class_name', '班別', '班級'],
  class_number: ['class_number', 'class_no', 'classnum', 'class_index', 'student_no', 'student_number', '班號', '學號', '班別學號'],
  sex: ['sex', 'gender', '性別'],
  status: ['status', 'student_status', '狀態'],
  ncs: ['ncs', 'is_ncs', 'ncs_status'],
  x1: ['x1', 'elective_x1', 'subject_x1'],
  x2: ['x2', 'elective_x2', 'subject_x2'],
  x3: ['x3', 'x3_m1_apl_ol', 'elective_x3', 'subject_x3'],
  class_code: ['clsno', 'cls_no', 'class_code'],
  house: ['house', '社別'],
  language_group: ['language_group', '語言組別'],
  supp_class: ['supp_class', 'supplementary_class', 'support_class', '支援班', '補課班'],
  maths_group: ['maths', 'math', '數學_maths', '數學'],
  citizenship: ['citizenship', 'citizenship_social_development', '公社'],
  dropped_subjects: ['dropped_subjects', 'withdrawn_subjects', '退選科目'],
  remarks: ['remarks', 'remark', 'notes', '備註']
};

const dayMap = {
  '1': 'Mon',
  '2': 'Tue',
  '3': 'Wed',
  '4': 'Thu',
  '5': 'Fri',
  '6': 'Sat',
  monday: 'Mon',
  mon: 'Mon',
  tuesday: 'Tue',
  tue: 'Tue',
  wednesday: 'Wed',
  wed: 'Wed',
  thursday: 'Thu',
  thu: 'Thu',
  friday: 'Fri',
  fri: 'Fri',
  saturday: 'Sat',
  sat: 'Sat',
  '星期一': 'Mon',
  '週一': 'Mon',
  '周一': 'Mon',
  '星期二': 'Tue',
  '週二': 'Tue',
  '周二': 'Tue',
  '星期三': 'Wed',
  '週三': 'Wed',
  '周三': 'Wed',
  '星期四': 'Thu',
  '週四': 'Thu',
  '周四': 'Thu',
  '星期五': 'Fri',
  '週五': 'Fri',
  '周五': 'Fri',
  '星期六': 'Sat',
  '週六': 'Sat',
  '周六': 'Sat'
};

const subjectAliasMap = {
  ENG: 'ENG',
  ENGLISH: 'ENG',
  'ENGLISH LANGUAGE': 'ENG',
  '英國語文': 'ENG',
  MATH: 'MATH',
  MATHS: 'MATH',
  MATHEMATICS: 'MATH',
  '數學': 'MATH',
  PHY: 'PHY',
  PHYSICS: 'PHY',
  '物理': 'PHY',
  CHEM: 'CHEM',
  CHEMISTRY: 'CHEM',
  '化學': 'CHEM',
  BIO: 'BIO',
  BIOLOGY: 'BIO',
  '生物': 'BIO',
  ECON: 'ECON',
  ECONOMICS: 'ECON',
  '經濟': 'ECON',
  ICT: 'ICT',
  '資訊及通訊科技': 'ICT',
  BAFS: 'BAFS',
  '企業、會計與財務概論': 'BAFS',
  JAP: 'JAP',
  JAPANESE: 'JAP',
  '日語': 'JAP',
  CLIT: 'CLIT',
  '中國文學': 'CLIT',
  CHIST: 'CHIS',
  CHIS: 'CHIS',
  '中國歷史': 'CHIS',
  GEOG: 'GEOG',
  GEOGRAPHY: 'GEOG',
  '地理': 'GEOG',
  HIST: 'HIST',
  HISTORY: 'HIST',
  '歷史': 'HIST',
  'MATH(M1)': 'Math(M1)',
  MATHM1: 'Math(M1)',
  '數學延伸單元一': 'Math(M1)'
};

const NON_TIMETABLE_SUBJECTS = new Set(['OFF', 'CLPC', 'CLPE', 'CLPP']);

function isTimetableImportFile(fileName) {
  return /\.(csv|xlsx|xls)$/i.test(String(fileName || ''));
}

function normalizeDay(day) {
  if (day === undefined || day === null || day === '') return null;
  return dayMap[day.toString().trim().toLowerCase()] || null;
}

function normalizePeriod(period) {
  if (period === undefined || period === null || period === '') return null;

  const raw = period.toString().trim();
  const upper = raw.toUpperCase();

  if (/^P\d+$/.test(upper)) return `Period ${upper.substring(1)}`;
  if (/^\d+$/.test(upper)) return `Period ${upper}`;

  return raw;
}

function normalizeSubject(subject) {
  const raw = subject.toString().trim();
  return subjectAliasMap[raw.toUpperCase()] || raw;
}

async function markInvalidElectiveSelectionsForReview(conn) {
  const [activeSubjects] = await conn.query(`
    SELECT DISTINCT s.subject_id, s.subject_name, s.subject_name_zh, s.subject_name_en
    FROM timetable tt
    JOIN subject s ON s.subject_id = tt.subject_id
    WHERE s.subject_name REGEXP '-B[123]$'
  `);
  const activeGroupsBySubject = new Map();
  activeSubjects.forEach(subject => {
    const parsed = parseElectiveSubjectCode(subject.subject_name);
    if (!parsed.electiveGroup) return;
    const key = subjectCanonicalKey(subject);
    const groups = activeGroupsBySubject.get(key) || new Set();
    groups.add(parsed.electiveGroup);
    activeGroupsBySubject.set(key, groups);
  });

  const [students] = await conn.query(`
    SELECT st.student_id, st.elective_review_required, st.elective_review_note,
      x1.subject_name AS x1_name, x1.subject_name_zh AS x1_name_zh, x1.subject_name_en AS x1_name_en,
      x2.subject_name AS x2_name, x2.subject_name_zh AS x2_name_zh, x2.subject_name_en AS x2_name_en,
      x3.subject_name AS x3_name, x3.subject_name_zh AS x3_name_zh, x3.subject_name_en AS x3_name_en
    FROM student st
    LEFT JOIN subject x1 ON x1.subject_id = st.x1_subject_id
    LEFT JOIN subject x2 ON x2.subject_id = st.x2_subject_id
    LEFT JOIN subject x3 ON x3.subject_id = st.x3_subject_id
  `);

  let reviewCount = 0;
  for (const student of students) {
    const invalid = [];
    ['X1', 'X2', 'X3'].forEach(group => {
      const prefix = group.toLowerCase();
      if (!student[`${prefix}_name`]) return;
      const selected = {
        subject_name: student[`${prefix}_name`],
        subject_name_zh: student[`${prefix}_name_zh`],
        subject_name_en: student[`${prefix}_name_en`]
      };
      const currentGroups = activeGroupsBySubject.get(subjectCanonicalKey(selected));
      if (currentGroups && !currentGroups.has(group)) {
        invalid.push(`${group}: ${parseElectiveSubjectCode(selected.subject_name).subjectCode} is now ${Array.from(currentGroups).join('/')}`);
      }
    });

    const reviewRequired = invalid.length > 0;
    const reviewNote = reviewRequired ? invalid.join('; ') : null;
    if (reviewRequired) reviewCount += 1;
    if (Boolean(student.elective_review_required) !== reviewRequired || (student.elective_review_note || null) !== reviewNote) {
      await conn.query(
        `UPDATE student
         SET elective_review_required = ?, elective_review_note = ?
         WHERE student_id = ?`,
        [reviewRequired, reviewNote, student.student_id]
      );
    }
  }

  return reviewCount;
}

function isSkippableNonTimetableRow({ subject, className, roomName }) {
  return Boolean(subject) &&
    !className &&
    !roomName &&
    NON_TIMETABLE_SUBJECTS.has(subject.toString().trim().toUpperCase());
}

function isSkippableExternalLesson({ teacherCode, subject, roomName }) {
  return !teacherCode && /^WCU(?:-|$)/i.test(String(subject || '').trim()) && /^VTC(?:\s|$)/i.test(String(roomName || '').trim());
}

function sourceValue(sourceRow, aliases) {
  const entries = Object.entries(sourceRow).map(([key, value]) => [normalizeColumnName(key), value]);
  for (const alias of aliases.map(normalizeColumnName)) {
    const match = entries.find(([key, value]) => key === alias && String(value || '').trim());
    if (match) return String(match[1]).trim();
  }
  return '';
}

function gradeLevelForClass(className) {
  const match = String(className || '').trim().toUpperCase().match(/^[SF]?(\d)/);
  return match && Number(match[1]) >= 1 && Number(match[1]) <= 6 ? `F${match[1]}` : '';
}

function normalizeColumnName(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[.\-/\\()\s]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeAliasedRow(sourceRow, aliasesByField) {
  const normalizedSource = Object.fromEntries(
    Object.entries(sourceRow).map(([key, value]) => [normalizeColumnName(key), value])
  );

  return Object.fromEntries(
    Object.entries(aliasesByField).map(([field, aliases]) => {
      const matchedAlias = aliases.map(normalizeColumnName)
        .find(alias => Object.prototype.hasOwnProperty.call(normalizedSource, alias));
      return [field, matchedAlias ? normalizedSource[matchedAlias] : ''];
    })
  );
}

export function normalizeTimetableRow(sourceRow) {
  return normalizeAliasedRow(sourceRow, TIMETABLE_COLUMN_ALIASES);
}

export function normalizeStudentRow(sourceRow) {
  return normalizeAliasedRow(sourceRow, STUDENT_COLUMN_ALIASES);
}

export function studentSheetRows(workbook) {
  for (const sheetName of workbook.SheetNames) {
    const matrix = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: '',
      raw: false
    });

    const headerIndex = matrix.slice(0, 20).findIndex(row => {
      const normalizedHeaders = row.map(normalizeColumnName);
      return REQUIRED_STUDENT_COLUMNS.every(column =>
        STUDENT_COLUMN_ALIASES[column].map(normalizeColumnName)
          .some(alias => normalizedHeaders.includes(alias))
      );
    });

    if (headerIndex < 0) continue;

    const headers = matrix[headerIndex].map(value => String(value || '').trim());
    return matrix.slice(headerIndex + 1)
      .filter(row => row.some(value => String(value || '').trim()))
      .map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
  }
  return [];
}

export function timetableSheetRows(workbook) {
  return workbook.SheetNames.flatMap(sheetName => {
    const matrix = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: '',
      raw: false
    });

    const headerIndex = matrix.slice(0, 20).findIndex(row => {
      const normalizedHeaders = row.map(normalizeColumnName);
      return REQUIRED_COLUMNS.every(column =>
        TIMETABLE_COLUMN_ALIASES[column].map(normalizeColumnName)
          .some(alias => normalizedHeaders.includes(alias))
      );
    });

    if (headerIndex < 0) return [];

    const headers = matrix[headerIndex].map(value => String(value || '').trim());
    return matrix.slice(headerIndex + 1)
      .filter(row => row.some(value => String(value || '').trim()))
      .map((row, index) => ({
        ...Object.fromEntries(headers.map((header, columnIndex) => [header, row[columnIndex] ?? ''])),
        __sheetName: sheetName,
        __rowNumber: headerIndex + index + 2
      }));
  });
}

function normalizeSchoolClass(grade, className) {
  const normalizedClass = String(className || '').trim().toUpperCase();
  if (/^\d+[A-Z]+$/.test(normalizedClass)) return normalizedClass;

  const gradeMatch = String(grade || '').trim().toUpperCase().match(/(\d+)/);
  if (gradeMatch && normalizedClass) return `${gradeMatch[1]}${normalizedClass}`;
  return normalizedClass;
}

function normalizeStudentStatus(value) {
  const status = String(value || '').trim().toLowerCase();
  if (['inactive', '休學', '退學', '離校', '停學'].includes(status)) return 'inactive';
  return 'active';
}

function formatMissing(rows, key) {
  return rows.map(row => row[key]).filter(Boolean);
}

async function ensureImportHistoryTables(connOrPool = pool) {
  if (importHistorySchemaReady) return;
  await connOrPool.query(`
    CREATE TABLE IF NOT EXISTS import_batches (
      batch_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL,
      imported_by_user_id BIGINT NULL,
      imported_by_name VARCHAR(255) NULL,
      status ENUM('success', 'failed', 'rolled_back') NOT NULL DEFAULT 'success',
      inserted_rows INT NOT NULL DEFAULT 0,
      skipped_rows INT NOT NULL DEFAULT 0,
      error_code VARCHAR(80) NULL,
      error_message TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      rolled_back_at DATETIME NULL,
      INDEX idx_import_batches_created_at (created_at),
      INDEX idx_import_batches_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connOrPool.query(`
    CREATE TABLE IF NOT EXISTS timetable_history (
      history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      batch_id BIGINT NOT NULL,
      timetable_id BIGINT NULL,
      teacher_id BIGINT NOT NULL,
      subject_id BIGINT NOT NULL,
      class_id BIGINT NOT NULL,
      room_id BIGINT NOT NULL,
      day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
      period_id BIGINT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES import_batches(batch_id) ON DELETE CASCADE,
      INDEX idx_timetable_history_batch (batch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  importHistorySchemaReady = true;
}

async function addColumnIfMissing(connOrPool, tableName, definition) {
  try {
    await connOrPool.query(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) throw error;
  }
}

async function ensureStudentImportHistoryTables(connOrPool = pool) {
  if (studentImportHistorySchemaReady) return;
  await connOrPool.query(`
    CREATE TABLE IF NOT EXISTS student_import_batches (
      batch_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL,
      imported_by_user_id BIGINT NULL,
      imported_by_name VARCHAR(255) NULL,
      status ENUM('success', 'failed', 'rolled_back') NOT NULL DEFAULT 'success',
      inserted_rows INT NOT NULL DEFAULT 0,
      updated_rows INT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      rolled_back_at DATETIME NULL,
      INDEX idx_student_import_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connOrPool.query(`
    CREATE TABLE IF NOT EXISTS student_import_history (
      history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
      batch_id BIGINT NOT NULL,
      student_id BIGINT NOT NULL,
      was_existing BOOLEAN NOT NULL,
      regno VARCHAR(50) NULL,
      email VARCHAR(255) NULL,
      student_ch_name VARCHAR(255) NULL,
      student_eng_name VARCHAR(255) NULL,
      class_id BIGINT NULL,
      class_number VARCHAR(10) NULL,
      sex VARCHAR(10) NULL,
      status VARCHAR(20) NULL,
      is_ncs BOOLEAN NULL,
      x1_subject_id BIGINT NULL,
      x2_subject_id BIGINT NULL,
      x3_subject_id BIGINT NULL,
      class_code VARCHAR(20) NULL,
      house VARCHAR(50) NULL,
      language_group VARCHAR(100) NULL,
      supp_class VARCHAR(100) NULL,
      maths_group VARCHAR(100) NULL,
      citizenship VARCHAR(100) NULL,
      dropped_subjects VARCHAR(255) NULL,
      remarks TEXT NULL,
      FOREIGN KEY (batch_id) REFERENCES student_import_batches(batch_id) ON DELETE CASCADE,
      INDEX idx_student_import_history_batch (batch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await addColumnIfMissing(connOrPool, 'student_import_history', 'class_code VARCHAR(20) NULL');
  await addColumnIfMissing(connOrPool, 'student_import_history', 'house VARCHAR(50) NULL');
  await addColumnIfMissing(connOrPool, 'student_import_history', 'language_group VARCHAR(100) NULL');
  await addColumnIfMissing(connOrPool, 'student_import_history', 'supp_class VARCHAR(100) NULL');
  await addColumnIfMissing(connOrPool, 'student_import_history', 'maths_group VARCHAR(100) NULL');
  await addColumnIfMissing(connOrPool, 'student_import_history', 'citizenship VARCHAR(100) NULL');
  await addColumnIfMissing(connOrPool, 'student_import_history', 'dropped_subjects VARCHAR(255) NULL');
  await addColumnIfMissing(connOrPool, 'student_import_history', 'remarks TEXT NULL');
  studentImportHistorySchemaReady = true;
}

async function logFailedImport(fileName, user, code, message, skippedRows = 0) {
  await ensureImportHistoryTables(pool);
  await pool.query(
    `INSERT INTO import_batches
      (file_name, imported_by_user_id, imported_by_name, status, skipped_rows, error_code, error_message)
     VALUES (?, ?, ?, 'failed', ?, ?, ?)`,
    [
      fileName || 'Unknown file',
      user?.id || user?.user_id || null,
      await importUserName(pool, user),
      skippedRows,
      code || 'IMPORT_FAILED',
      message || 'Import failed.'
    ]
  );
}

function userIdFromRequest(req) {
  return req.user?.id || req.user?.user_id || null;
}

async function importUserName(connOrPool, user) {
  const userId = user?.id || user?.user_id;
  if (user?.user_name || user?.email) return user.user_name || user.email;
  if (!userId) return null;

  const [rows] = await connOrPool.query('SELECT user_name, email FROM user WHERE user_id = ?', [userId]);
  if (rows.length === 0) return null;
  return rows[0].user_name || rows[0].email || null;
}

async function respondImportError(req, res, status, payload) {
  await logFailedImport(
    req.file?.originalname,
    req.user,
    payload.code,
    payload.message,
    payload.invalidRows?.length || 0
  );
  return res.status(status).json(payload);
}

router.get('/batches', ensureJWT, requirePermission('importTimetable'), async (req, res) => {
  try {
    await ensureImportHistoryTables(pool);
    const [rows] = await pool.query(`
      SELECT
        b.*,
        COUNT(h.history_id) AS snapshot_rows
      FROM import_batches b
      LEFT JOIN timetable_history h ON b.batch_id = h.batch_id
      GROUP BY b.batch_id
      ORDER BY b.created_at DESC, b.batch_id DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    console.error('Load import batches error:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', message: 'Failed to load import history.' });
  }
});

router.get('/batches/:batchId/json', ensureJWT, requirePermission('importTimetable'), async (req, res) => {
  try {
    const batchId = Number(req.params.batchId);
    if (!batchId) {
      return res.status(400).json({ code: 'INVALID_BATCH', message: 'Invalid import batch.' });
    }

    await ensureImportHistoryTables(pool);

    const [batches] = await pool.query('SELECT * FROM import_batches WHERE batch_id = ?', [batchId]);
    if (batches.length === 0) {
      return res.status(404).json({ code: 'BATCH_NOT_FOUND', message: 'Import batch was not found.' });
    }

    const [snapshotRows] = await pool.query(`
      SELECT
        h.history_id,
        h.timetable_id,
        h.day_of_week,
        t.teacher_code,
        t.teacher_name,
        s.subject_name,
        c.class_name,
        r.room_name,
        p.period_name
      FROM timetable_history h
      LEFT JOIN teacher t ON h.teacher_id = t.teacher_id
      LEFT JOIN subject s ON h.subject_id = s.subject_id
      LEFT JOIN class c ON h.class_id = c.class_id
      LEFT JOIN room r ON h.room_id = r.room_id
      LEFT JOIN period p ON h.period_id = p.period_id
      WHERE h.batch_id = ?
      ORDER BY h.history_id
    `, [batchId]);

    res.json({
      batch: batches[0],
      snapshotRows
    });
  } catch (err) {
    console.error('Load import batch JSON error:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', message: 'Failed to load import batch JSON.' });
  }
});

router.delete('/batches/:batchId', ensureJWT, requirePermission('importTimetable'), async (req, res) => {
  try {
    const batchId = Number(req.params.batchId);
    if (!batchId) {
      return res.status(400).json({ code: 'INVALID_BATCH', message: 'Invalid import batch.' });
    }

    await ensureImportHistoryTables(pool);
    const [result] = await pool.query('DELETE FROM import_batches WHERE batch_id = ?', [batchId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 'BATCH_NOT_FOUND', message: 'Import batch was not found.' });
    }

    res.json({ code: 'BATCH_DELETED', message: 'Import history deleted.', batchId });
  } catch (err) {
    console.error('Delete import batch error:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', message: 'Failed to delete import history.' });
  }
});

router.post('/rollback/:batchId', ensureJWT, requirePermission('importTimetable'), async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const batchId = Number(req.params.batchId);
    if (!batchId) {
      return res.status(400).json({ code: 'INVALID_BATCH', message: 'Invalid import batch.' });
    }

    await ensureImportHistoryTables(conn);
    await conn.beginTransaction();

    const [batches] = await conn.query('SELECT * FROM import_batches WHERE batch_id = ? FOR UPDATE', [batchId]);
    if (batches.length === 0) {
      await conn.rollback();
      return res.status(404).json({ code: 'BATCH_NOT_FOUND', message: 'Import batch was not found.' });
    }

    const batch = batches[0];
    if (batch.status !== 'success') {
      await conn.rollback();
      return res.status(400).json({ code: 'BATCH_NOT_ROLLBACKABLE', message: 'Only successful import batches can be rolled back.' });
    }

    await conn.query('DELETE FROM timetable');
    const [restoreResult] = await conn.query(`
      INSERT INTO timetable
        (teacher_id, subject_id, class_id, room_id, day_of_week, period_id)
      SELECT teacher_id, subject_id, class_id, room_id, day_of_week, period_id
      FROM timetable_history
      WHERE batch_id = ?
      ORDER BY history_id
    `, [batchId]);

    await conn.query(
      `UPDATE import_batches
       SET status = 'rolled_back', rolled_back_at = NOW()
       WHERE batch_id = ?`,
      [batchId]
    );

    await conn.commit();
    res.json({
      code: 'ROLLBACK_OK',
      message: 'Timetable restored to the version before this import.',
      batchId,
      restoredRows: restoreResult.affectedRows
    });
  } catch (err) {
    await conn.rollback();
    console.error('Rollback import error:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', message: 'Rollback failed because of a server or database error.' });
  } finally {
    conn.release();
  }
});

router.post(
  '/csv',
  ensureJWT,
  requirePermission('importTimetable'),
  upload.single('file'),
  async (req, res) => {
    const conn = await pool.getConnection();
    let importLockAcquired = false;

    try {
      if (!req.file) {
        return res.status(400).json({
          code: 'MISSING_FILE',
          message: 'Please upload a CSV or Excel file.'
        });
      }

      await ensureImportHistoryTables(conn);

      if (!isTimetableImportFile(req.file.originalname)) {
        return respondImportError(req, res, 400, {
          code: 'INVALID_FILE_TYPE',
          message: 'Please upload a .csv, .xlsx, or .xls file.'
        });
      }

      const workbook = xlsx.read(await fs.promises.readFile(req.file.path), { type: 'buffer' });
      const rows = timetableSheetRows(workbook);
      if (rows.length === 0) {
        return respondImportError(req, res, 400, {
          code: 'EMPTY_FILE',
          message: 'Timetable file is empty or no valid timetable sheets were found.'
        });
      }

      const columns = Object.keys(rows[0]).map(normalizeColumnName);
      const missingColumns = REQUIRED_COLUMNS.filter(column => (
        !TIMETABLE_COLUMN_ALIASES[column].map(normalizeColumnName)
          .some(alias => columns.includes(alias))
      ));
      if (missingColumns.length) {
        return respondImportError(req, res, 400, {
          code: 'MISSING_COLUMNS',
          message: 'Timetable file is missing required columns.',
          requiredColumns: REQUIRED_COLUMNS,
          missingColumns
        });
      }

      // Ensure review fields exist before opening the import transaction. This
      // avoids running schema DDL while the timetable replacement is in flight.
      await ensureStudentAdminSchema();

      const [[importLock]] = await conn.query(
        "SELECT GET_LOCK('school_management_timetable_import', 5) AS acquired"
      );
      if (Number(importLock.acquired) !== 1) {
        return res.status(409).json({
          code: 'TIMETABLE_IMPORT_IN_PROGRESS',
          message: 'Another timetable import is still running. Please wait for it to finish before uploading again.'
        });
      }
      importLockAcquired = true;

      await conn.beginTransaction();
      await conn.query('DELETE FROM staging_timetable');

      const invalidRows = [];
      let insertedStagingRows = 0;
      let skippedNonTimetableRows = 0;
      let skippedExternalRows = 0;
      const teacherNamesByCode = new Map();

      const stagingRows = [];
      for (const [index, row] of rows.entries()) {
        const rowNumber = row.__rowNumber || index + 2;
        const normalizedRow = normalizeTimetableRow(row);
        const teacherCode = normalizedRow.teacher?.toString().trim();
        const subject = normalizedRow.subject ? normalizeSubject(normalizedRow.subject) : null;
        const className = normalizedRow.class?.toString().trim();
        const roomName = normalizedRow.room?.toString().trim();
        const day = normalizeDay(normalizedRow.day);
        const period = normalizePeriod(normalizedRow.period);
        const teacherName = sourceValue(row, ['teacher_name', 'teacher', '教師姓名', '老師姓名']);

        if (isSkippableNonTimetableRow({ subject, className, roomName })) {
          skippedNonTimetableRows += 1;
          continue;
        }

        if (isSkippableExternalLesson({ teacherCode, subject, roomName })) {
          skippedExternalRows += 1;
          continue;
        }

        if (!teacherCode || !subject || !className || !roomName || !day || !period) {
          invalidRows.push({
            row: rowNumber,
            teacher: normalizedRow.teacher,
            subject: normalizedRow.subject,
            class: normalizedRow.class,
            room: normalizedRow.room,
            day: normalizedRow.day,
            period: normalizedRow.period
          });
          continue;
        }

        stagingRows.push([teacherCode, subject, className, roomName, day, period]);
        if (!teacherNamesByCode.has(teacherCode)) teacherNamesByCode.set(teacherCode, teacherName || teacherCode);
        insertedStagingRows += 1;
      }

      if (insertedStagingRows === 0) {
        await conn.rollback();
        return respondImportError(req, res, 400, {
          code: 'NO_VALID_ROWS',
          message: 'No valid timetable rows were found in the file.',
          invalidRows
        });
      }

      await insertRowsInBatches(
        conn,
        `INSERT INTO staging_timetable
          (teacher_code, subject, class, room, day_of_week, period)
         VALUES ?`,
        stagingRows
      );

      const [missingTeachers] = await conn.query(`
        SELECT DISTINCT st.teacher_code
        FROM staging_timetable st
        LEFT JOIN teacher t ON TRIM(st.teacher_code) = TRIM(t.teacher_code)
        WHERE t.teacher_id IS NULL
      `);

      const [missingSubjects] = await conn.query(`
        SELECT DISTINCT st.subject
        FROM staging_timetable st
        LEFT JOIN subject s ON TRIM(st.subject) = TRIM(s.subject_name)
        WHERE s.subject_id IS NULL
      `);

      const [missingClasses] = await conn.query(`
        SELECT DISTINCT st.class
        FROM staging_timetable st
        LEFT JOIN class c ON TRIM(st.class) = TRIM(c.class_name)
        WHERE c.class_id IS NULL
      `);

      const [missingRooms] = await conn.query(`
        SELECT DISTINCT st.room
        FROM staging_timetable st
        LEFT JOIN room r ON TRIM(st.room) = TRIM(r.room_name)
        WHERE r.room_id IS NULL
      `);

      const [missingPeriods] = await conn.query(`
        SELECT DISTINCT st.period
        FROM staging_timetable st
        LEFT JOIN period p ON TRIM(st.period) = TRIM(p.period_name)
        WHERE p.period_id IS NULL
      `);

      if (missingTeachers.length) {
        await insertRowsInBatches(
          conn,
          'INSERT INTO teacher (teacher_code, teacher_name, status) VALUES ?',
          missingTeachers.map(({ teacher_code: teacherCode }) => [
            teacherCode,
            teacherNamesByCode.get(teacherCode) || teacherCode,
            'active'
          ])
        );
      }

      if (missingSubjects.length) {
        await insertRowsInBatches(
          conn,
          'INSERT INTO subject (subject_name, is_elective) VALUES ?',
          missingSubjects.map(({ subject }) => [subject, /(?:^|-)B[123]$/i.test(subject)])
        );
      }

      const creatableClasses = missingClasses
        .map(({ class: className }) => [className, gradeLevelForClass(className)])
        .filter(([, gradeLevel]) => gradeLevel);
      if (creatableClasses.length) {
        await insertRowsInBatches(
          conn,
          'INSERT INTO class (class_name, grade_level) VALUES ?',
          creatableClasses
        );
      }

      if (missingRooms.length) {
        await insertRowsInBatches(
          conn,
          'INSERT INTO room (room_name) VALUES ?',
          missingRooms.map(({ room }) => [room])
        );
      }

      const createdClassNames = new Set(creatableClasses.map(([className]) => className));
      const unresolvedClasses = missingClasses.filter(({ class: className }) => !createdClassNames.has(className));

      const importErrors = {
        missingTeachers: [],
        missingSubjects: [],
        missingClasses: formatMissing(unresolvedClasses, 'class'),
        missingRooms: [],
        missingPeriods: formatMissing(missingPeriods, 'period'),
        invalidRows
      };

      const hasImportErrors = Object.values(importErrors).some(value => value.length > 0);
      if (hasImportErrors) {
        await conn.rollback();
        return respondImportError(req, res, 400, {
          code: 'IMPORT_VALIDATION_FAILED',
          message: 'Import failed. Please fix the timetable file or database reference data first.',
          ...importErrors
        });
      }

      const [batchResult] = await conn.query(
        `INSERT INTO import_batches
          (file_name, imported_by_user_id, imported_by_name, status, skipped_rows)
         VALUES (?, ?, ?, 'success', ?)`,
        [req.file.originalname, userIdFromRequest(req), await importUserName(conn, req.user), invalidRows.length + skippedNonTimetableRows + skippedExternalRows]
      );
      const batchId = batchResult.insertId;

      const [snapshotResult] = await conn.query(`
        INSERT INTO timetable_history
          (batch_id, timetable_id, teacher_id, subject_id, class_id, room_id, day_of_week, period_id)
        SELECT
          ?,
          timetable_id,
          teacher_id,
          subject_id,
          class_id,
          room_id,
          day_of_week,
          period_id
        FROM timetable
      `, [batchId]);

      await conn.query('DELETE FROM timetable');

      const [insertResult] = await conn.query(`
        INSERT INTO timetable
          (teacher_id, subject_id, class_id, room_id, day_of_week, period_id)
        SELECT
          t.teacher_id,
          s.subject_id,
          c.class_id,
          r.room_id,
          st.day_of_week,
          p.period_id
        FROM staging_timetable st
        JOIN teacher t ON TRIM(st.teacher_code) = TRIM(t.teacher_code)
        JOIN subject s ON TRIM(st.subject) = TRIM(s.subject_name)
        JOIN class c ON TRIM(st.class) = TRIM(c.class_name)
        JOIN room r ON TRIM(st.room) = TRIM(r.room_name)
        JOIN period p ON TRIM(st.period) = TRIM(p.period_name)
      `);

      const electiveReviewCount = await markInvalidElectiveSelectionsForReview(conn);

      await conn.query(
        'UPDATE import_batches SET inserted_rows = ? WHERE batch_id = ?',
        [insertResult.affectedRows, batchId]
      );
      await conn.query('INSERT INTO import_schedule (file_name) VALUES (?)', [req.file.originalname]);
      await conn.commit();

      return res.json({
        code: 'IMPORT_OK',
        message: 'Timetable imported successfully.',
        batchId,
        insertedTimetable: insertResult.affectedRows,
        skippedRows: invalidRows.length + skippedNonTimetableRows + skippedExternalRows,
        skippedNonTimetableRows,
        skippedExternalRows,
        electiveReviewCount,
        createdReferences: {
          teachers: missingTeachers.length,
          subjects: missingSubjects.length,
          classes: creatableClasses.length,
          rooms: missingRooms.length
        },
        snapshotRows: snapshotResult.affectedRows
      });
    } catch (err) {
      await conn.rollback();
      console.error('Import error:', err);
      if (req.file) {
        await logFailedImport(req.file.originalname, req.user, 'DATABASE_ERROR', err.message, 0).catch(logErr => {
          console.error('Failed to log failed import:', logErr);
        });
      }
      const isLockTimeout = err.code === 'ER_LOCK_WAIT_TIMEOUT' || err.errno === 1205;
      return res.status(isLockTimeout ? 409 : 500).json({
        code: isLockTimeout ? 'TIMETABLE_IMPORT_BUSY' : 'DATABASE_ERROR',
        message: isLockTimeout
          ? 'The timetable database is busy with another import. Please wait a moment and try again.'
          : (err.message || 'Import failed because of a server or database error.')
      });
    } finally {
      if (req.file) fs.unlink(req.file.path, () => {});
      if (importLockAcquired) {
        await conn.query("SELECT RELEASE_LOCK('school_management_timetable_import')").catch(error => {
          console.error('Failed to release timetable import lock:', error);
        });
      }
      conn.release();
    }
  }
);

router.post(
  '/students/file',
  ensureJWT,
  requirePermission('manageStudents'),
  upload.single('file'),
  async (req, res) => {
    const conn = await pool.getConnection();

    try {
      if (!req.file) {
        return res.status(400).json({
          code: 'MISSING_FILE',
          message: 'Please upload a CSV or Excel file.'
        });
      }

      if (!/\.(csv|xlsx|xls)$/i.test(req.file.originalname)) {
        return res.status(400).json({
          code: 'INVALID_FILE_TYPE',
          message: 'Please upload a .csv, .xlsx, or .xls file.'
        });
      }

      await ensureStudentAdminSchema();
      await ensureStudentImportHistoryTables(conn);
      const workbook = xlsx.read(await fs.promises.readFile(req.file.path), { type: 'buffer' });
      const rows = studentSheetRows(workbook);

      if (rows.length === 0) {
        return res.status(400).json({
          code: 'MISSING_COLUMNS',
          message: 'Student file does not contain all required columns.',
          requiredColumns: REQUIRED_STUDENT_COLUMNS
        });
      }

      const sourceColumns = Object.keys(rows[0]).map(normalizeColumnName);
      const missingColumns = REQUIRED_STUDENT_COLUMNS.filter(column => (
        !STUDENT_COLUMN_ALIASES[column].map(normalizeColumnName)
          .some(alias => sourceColumns.includes(alias))
      ));
      if (missingColumns.length) {
        return res.status(400).json({
          code: 'MISSING_COLUMNS',
          message: 'Student file is missing required columns.',
          requiredColumns: REQUIRED_STUDENT_COLUMNS,
          missingColumns
        });
      }

      const normalizedRows = rows.map((sourceRow, index) => {
        const row = normalizeStudentRow(sourceRow);
        const classNumber = String(row.class_number || '').trim();
        return {
          row: index + 2,
          regno: String(row.regno || '').trim(),
          student_ch_name: String(row.student_ch_name || '').trim(),
          student_eng_name: String(row.student_eng_name || '').trim(),
          email: String(row.email || '').trim().toLowerCase(),
          class_name: normalizeSchoolClass(row.grade, row.class),
          class_number: classNumber ? classNumber.padStart(2, '0') : '',
          sex: String(row.sex || '').trim().toUpperCase(),
          status: normalizeStudentStatus(row.status),
          is_ncs: ['1', 'true', 'yes', 'y', 'ncs'].includes(String(row.ncs || '').trim().toLowerCase()),
          x1: row.x1 ? normalizeSubject(row.x1) : '',
          x2: row.x2 ? normalizeSubject(row.x2) : '',
          x3: row.x3 ? normalizeSubject(row.x3) : '',
          class_code: String(row.class_code || '').trim(),
          house: String(row.house || '').trim(),
          language_group: String(row.language_group || '').trim(),
          supp_class: String(row.supp_class || '').trim(),
          maths_group: String(row.maths_group || '').trim(),
          citizenship: String(row.citizenship || '').trim(),
          dropped_subjects: String(row.dropped_subjects || '').trim(),
          remarks: String(row.remarks || '').trim()
        };
      });

      const invalidRows = normalizedRows.filter(row => (
        !row.regno ||
        !row.student_ch_name ||
        !row.student_eng_name ||
        !row.class_name ||
        !row.class_number ||
        !['M', 'F'].includes(row.sex) ||
        !['active', 'inactive'].includes(row.status)
      ));

      const duplicateRegnos = normalizedRows
        .map(row => row.regno)
        .filter((value, index, values) => values.indexOf(value) !== index);
      const duplicateEmails = normalizedRows
        .filter(row => row.email)
        .map(row => row.email)
        .filter((value, index, values) => values.indexOf(value) !== index);
      const regnoCounts = normalizedRows.reduce((counts, row) => {
        counts.set(row.regno, (counts.get(row.regno) || 0) + 1);
        return counts;
      }, new Map());
      const [classRows] = await conn.query('SELECT class_id, class_name FROM class');
      const classMap = new Map(classRows.map(row => [String(row.class_name).trim().toUpperCase(), row.class_id]));
      const missingClasses = Array.from(new Set(
        normalizedRows
          .filter(row => row.class_name && !classMap.has(row.class_name.toUpperCase()))
          .map(row => row.class_name)
      ));
      const electiveCodes = Array.from(new Set(
        normalizedRows
          .flatMap(row => [row.x1, row.x2, row.x3])
          .filter(subject => subject && !['NA', 'DROPPED'].includes(subject.toUpperCase()))
      ));

      if (invalidRows.length || missingClasses.length) {
        return res.status(400).json({
          code: 'IMPORT_VALIDATION_FAILED',
          message: 'Student import failed. Please fix the file data first.',
          invalidRows,
          missingClasses
        });
      }

      await conn.beginTransaction();

      const [batchResult] = await conn.query(
        `INSERT INTO student_import_batches
          (file_name, imported_by_user_id, imported_by_name, status)
         VALUES (?, ?, ?, 'success')`,
        [req.file.originalname, userIdFromRequest(req), await importUserName(conn, req.user)]
      );
      const batchId = batchResult.insertId;

      let [subjectRows] = await conn.query(
        'SELECT subject_id, subject_name FROM subject'
      );
      let subjectMap = new Map(
        subjectRows.map(row => [String(row.subject_name).trim().toUpperCase(), row.subject_id])
      );
      const missingElectiveCodes = electiveCodes.filter(subjectName => !subjectMap.has(subjectName.toUpperCase()));
      if (missingElectiveCodes.length) {
        await insertRowsInBatches(
          conn,
          'INSERT INTO subject (subject_name, is_elective) VALUES ?',
          missingElectiveCodes.map(subjectName => [subjectName, true])
        );
        [subjectRows] = await conn.query('SELECT subject_id, subject_name FROM subject');
        subjectMap = new Map(
          subjectRows.map(row => [String(row.subject_name).trim().toUpperCase(), row.subject_id])
        );
      }

      const [existingStudentRows] = await conn.query(
        `SELECT student_id, regno, email, student_ch_name, student_eng_name,
                class_id, class_number, sex, status, is_ncs,
                x1_subject_id, x2_subject_id, x3_subject_id,
                class_code, house, language_group, supp_class,
                maths_group, citizenship, dropped_subjects, remarks
         FROM student`
      );
      const exactStudentMap = new Map();
      const studentsByRegno = new Map();
      const legacyStudentMap = new Map();
      const exactKey = (regno, classId, classNumber) => `${regno || ''}\u0000${classId || ''}\u0000${classNumber || ''}`;
      const addStudentToMaps = student => {
        const key = exactKey(student.regno, student.class_id, student.class_number);
        if (!exactStudentMap.has(key)) exactStudentMap.set(key, student);
        if (student.regno) {
          const matches = studentsByRegno.get(student.regno) || [];
          matches.push(student);
          studentsByRegno.set(student.regno, matches);
        } else {
          const matches = legacyStudentMap.get(exactKey('', student.class_id, student.class_number)) || [];
          matches.push(student);
          legacyStudentMap.set(exactKey('', student.class_id, student.class_number), matches);
        }
      };
      const removeStudentFromMaps = student => {
        const key = exactKey(student.regno, student.class_id, student.class_number);
        if (exactStudentMap.get(key)?.student_id === student.student_id) exactStudentMap.delete(key);
        const indexMap = student.regno ? studentsByRegno : legacyStudentMap;
        const indexKey = student.regno ? student.regno : exactKey('', student.class_id, student.class_number);
        const remaining = (indexMap.get(indexKey) || []).filter(match => match.student_id !== student.student_id);
        if (remaining.length) indexMap.set(indexKey, remaining);
        else indexMap.delete(indexKey);
      };
      existingStudentRows.forEach(addStudentToMaps);

      let insertedStudents = 0;
      let updatedStudents = 0;

      for (const row of normalizedRows) {
        const classId = classMap.get(row.class_name.toUpperCase());
        let existingStudent = exactStudentMap.get(exactKey(row.regno, classId, row.class_number)) || null;

        if (!existingStudent && regnoCounts.get(row.regno) === 1) {
          const regnoMatches = studentsByRegno.get(row.regno) || [];
          if (regnoMatches.length === 1) existingStudent = regnoMatches[0];
        }

        if (!existingStudent) {
          const legacyMatches = legacyStudentMap.get(exactKey('', classId, row.class_number)) || [];
          if (legacyMatches.length === 1) existingStudent = legacyMatches[0];
        }

        if (existingStudent) {
          const before = { ...existingStudent };
          await conn.query(
            `INSERT INTO student_import_history
              (batch_id, student_id, was_existing, regno, email, student_ch_name,
               student_eng_name, class_id, class_number, sex, status, is_ncs,
               x1_subject_id, x2_subject_id, x3_subject_id,
               class_code, house, language_group, supp_class,
               maths_group, citizenship, dropped_subjects, remarks)
             VALUES (?, ?, TRUE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              batchId, before.student_id, before.regno, before.email, before.student_ch_name,
              before.student_eng_name, before.class_id, before.class_number, before.sex,
              before.status, before.is_ncs, before.x1_subject_id, before.x2_subject_id,
              before.x3_subject_id, before.class_code, before.house, before.language_group,
              before.supp_class, before.maths_group, before.citizenship,
              before.dropped_subjects, before.remarks
            ]
          );
          await conn.query(
            `UPDATE student
             SET regno = ?, email = ?, student_ch_name = ?, student_eng_name = ?, class_id = ?,
                 class_number = ?, sex = ?, status = ?, is_ncs = ?,
                 x1_subject_id = ?, x2_subject_id = ?, x3_subject_id = ?,
                 class_code = ?, house = ?, language_group = ?, supp_class = ?,
                 maths_group = ?, citizenship = ?, dropped_subjects = ?, remarks = ?
             WHERE student_id = ?`,
            [
              row.regno,
              row.email || null,
              row.student_ch_name,
              row.student_eng_name,
              classId,
              row.class_number,
              row.sex,
              row.status,
              row.is_ncs,
              subjectMap.get(row.x1.toUpperCase()) || null,
              subjectMap.get(row.x2.toUpperCase()) || null,
              subjectMap.get(row.x3.toUpperCase()) || null,
              row.class_code || null,
              row.house || null,
              row.language_group || null,
              row.supp_class || null,
              row.maths_group || null,
              row.citizenship || null,
              row.dropped_subjects || null,
              row.remarks || null,
              existingStudent.student_id
            ]
          );
          removeStudentFromMaps(existingStudent);
          Object.assign(existingStudent, {
            regno: row.regno,
            email: row.email || null,
            student_ch_name: row.student_ch_name,
            student_eng_name: row.student_eng_name,
            class_id: classId,
            class_number: row.class_number,
            sex: row.sex,
            status: row.status,
            is_ncs: row.is_ncs,
            x1_subject_id: subjectMap.get(row.x1.toUpperCase()) || null,
            x2_subject_id: subjectMap.get(row.x2.toUpperCase()) || null,
            x3_subject_id: subjectMap.get(row.x3.toUpperCase()) || null,
            class_code: row.class_code || null,
            house: row.house || null,
            language_group: row.language_group || null,
            supp_class: row.supp_class || null,
            maths_group: row.maths_group || null,
            citizenship: row.citizenship || null,
            dropped_subjects: row.dropped_subjects || null,
            remarks: row.remarks || null
          });
          addStudentToMaps(existingStudent);
          updatedStudents += 1;
        } else {
          const [insertedResult] = await conn.query(
            `INSERT INTO student
              (regno, email, student_ch_name, student_eng_name, class_id, class_number, sex,
               status, is_ncs, x1_subject_id, x2_subject_id, x3_subject_id,
               class_code, house, language_group, supp_class, maths_group, citizenship,
               dropped_subjects, remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              row.regno,
              row.email || null,
              row.student_ch_name,
              row.student_eng_name,
              classId,
              row.class_number,
              row.sex,
              row.status,
              row.is_ncs,
              subjectMap.get(row.x1.toUpperCase()) || null,
              subjectMap.get(row.x2.toUpperCase()) || null,
              subjectMap.get(row.x3.toUpperCase()) || null,
              row.class_code || null,
              row.house || null,
              row.language_group || null,
              row.supp_class || null,
              row.maths_group || null,
              row.citizenship || null,
              row.dropped_subjects || null,
              row.remarks || null
            ]
          );
          await conn.query(
            `INSERT INTO student_import_history
              (batch_id, student_id, was_existing)
             VALUES (?, ?, FALSE)`,
            [batchId, insertedResult.insertId]
          );
          addStudentToMaps({
            student_id: insertedResult.insertId,
            regno: row.regno,
            email: row.email || null,
            student_ch_name: row.student_ch_name,
            student_eng_name: row.student_eng_name,
            class_id: classId,
            class_number: row.class_number,
            sex: row.sex,
            status: row.status,
            is_ncs: row.is_ncs,
            x1_subject_id: subjectMap.get(row.x1.toUpperCase()) || null,
            x2_subject_id: subjectMap.get(row.x2.toUpperCase()) || null,
            x3_subject_id: subjectMap.get(row.x3.toUpperCase()) || null,
            class_code: row.class_code || null,
            house: row.house || null,
            language_group: row.language_group || null,
            supp_class: row.supp_class || null,
            maths_group: row.maths_group || null,
            citizenship: row.citizenship || null,
            dropped_subjects: row.dropped_subjects || null,
            remarks: row.remarks || null
          });
          insertedStudents += 1;
        }
      }

      await conn.query(
        `UPDATE student_import_batches
         SET inserted_rows = ?, updated_rows = ?
         WHERE batch_id = ?`,
        [insertedStudents, updatedStudents, batchId]
      );
      await conn.commit();
      return res.json({
        code: 'STUDENT_IMPORT_OK',
        message: 'Student data imported successfully.',
        batchId,
        insertedStudents,
        updatedStudents,
        totalRows: normalizedRows.length,
        duplicateRegnos: Array.from(new Set(duplicateRegnos)),
        duplicateEmails: Array.from(new Set(duplicateEmails))
      });
    } catch (err) {
      await conn.rollback();
      console.error('Student import error:', err);
      return res.status(500).json({
        code: 'DATABASE_ERROR',
        message: err.message || 'Student import failed because of a server or database error.'
      });
    } finally {
      if (req.file) fs.unlink(req.file.path, () => {});
      conn.release();
    }
  }
);

router.get('/students/batches', ensureJWT, requirePermission('manageStudents'), async (req, res) => {
  try {
    await ensureStudentImportHistoryTables(pool);
    const [rows] = await pool.query(`
      SELECT b.*, COUNT(h.history_id) AS snapshot_rows
      FROM student_import_batches b
      LEFT JOIN student_import_history h ON b.batch_id = h.batch_id
      GROUP BY b.batch_id
      ORDER BY b.created_at DESC, b.batch_id DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (error) {
    console.error('Load student import batches error:', error);
    res.status(500).json({ code: 'DATABASE_ERROR', message: 'Failed to load student import history.' });
  }
});

router.get('/students/batches/:batchId/json', ensureJWT, requirePermission('manageStudents'), async (req, res) => {
  try {
    const batchId = Number(req.params.batchId);
    if (!batchId) return res.status(400).json({ code: 'INVALID_BATCH', message: 'Invalid import batch.' });

    await ensureStudentImportHistoryTables(pool);
    const [batches] = await pool.query('SELECT * FROM student_import_batches WHERE batch_id = ?', [batchId]);
    if (!batches.length) return res.status(404).json({ code: 'BATCH_NOT_FOUND', message: 'Import batch was not found.' });

    const [snapshotRows] = await pool.query(
      `SELECT h.*, c.class_name,
              x1.subject_name AS x1_subject_name,
              x2.subject_name AS x2_subject_name,
              x3.subject_name AS x3_subject_name
       FROM student_import_history h
       LEFT JOIN class c ON h.class_id = c.class_id
       LEFT JOIN subject x1 ON h.x1_subject_id = x1.subject_id
       LEFT JOIN subject x2 ON h.x2_subject_id = x2.subject_id
       LEFT JOIN subject x3 ON h.x3_subject_id = x3.subject_id
       WHERE h.batch_id = ?
       ORDER BY h.history_id`,
      [batchId]
    );
    res.json({ batch: batches[0], snapshotRows });
  } catch (error) {
    console.error('Load student import batch JSON error:', error);
    res.status(500).json({ code: 'DATABASE_ERROR', message: 'Failed to load student import batch JSON.' });
  }
});

router.delete('/students/batches/:batchId', ensureJWT, requirePermission('manageStudents'), async (req, res) => {
  try {
    const batchId = Number(req.params.batchId);
    if (!batchId) return res.status(400).json({ code: 'INVALID_BATCH', message: 'Invalid import batch.' });

    await ensureStudentImportHistoryTables(pool);
    const [result] = await pool.query('DELETE FROM student_import_batches WHERE batch_id = ?', [batchId]);
    if (!result.affectedRows) return res.status(404).json({ code: 'BATCH_NOT_FOUND', message: 'Import batch was not found.' });
    res.json({ code: 'BATCH_DELETED', message: 'Student import history deleted.', batchId });
  } catch (error) {
    console.error('Delete student import batch error:', error);
    res.status(500).json({ code: 'DATABASE_ERROR', message: 'Failed to delete student import history.' });
  }
});

router.post('/students/rollback/:batchId', ensureJWT, requirePermission('manageStudents'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const batchId = Number(req.params.batchId);
    if (!batchId) return res.status(400).json({ code: 'INVALID_BATCH', message: 'Invalid import batch.' });

    await ensureStudentAdminSchema();
    await ensureStudentImportHistoryTables(conn);
    await conn.beginTransaction();

    const [batches] = await conn.query(
      'SELECT * FROM student_import_batches WHERE batch_id = ? FOR UPDATE',
      [batchId]
    );
    if (!batches.length) {
      await conn.rollback();
      return res.status(404).json({ code: 'BATCH_NOT_FOUND', message: 'Import batch was not found.' });
    }
    if (batches[0].status !== 'success') {
      await conn.rollback();
      return res.status(400).json({ code: 'BATCH_NOT_ROLLBACKABLE', message: 'Only successful imports can be restored.' });
    }

    const [historyRows] = await conn.query(
      'SELECT * FROM student_import_history WHERE batch_id = ? ORDER BY history_id DESC',
      [batchId]
    );

    let restoredRows = 0;
    let removedRows = 0;
    for (const row of historyRows) {
      if (!row.was_existing) {
        const [removed] = await conn.query('DELETE FROM student WHERE student_id = ?', [row.student_id]);
        removedRows += removed.affectedRows;
        continue;
      }

      const [restored] = await conn.query(
        `UPDATE student
         SET regno = ?, email = ?, student_ch_name = ?, student_eng_name = ?,
             class_id = ?, class_number = ?, sex = ?, status = ?, is_ncs = ?,
             x1_subject_id = ?, x2_subject_id = ?, x3_subject_id = ?,
             class_code = ?, house = ?, language_group = ?, supp_class = ?,
             maths_group = ?, citizenship = ?, dropped_subjects = ?, remarks = ?
         WHERE student_id = ?`,
        [
          row.regno, row.email, row.student_ch_name, row.student_eng_name,
          row.class_id, row.class_number, row.sex, row.status, row.is_ncs,
          row.x1_subject_id, row.x2_subject_id, row.x3_subject_id,
          row.class_code, row.house, row.language_group, row.supp_class,
          row.maths_group, row.citizenship, row.dropped_subjects, row.remarks,
          row.student_id
        ]
      );
      restoredRows += restored.affectedRows;
    }

    await conn.query(
      `UPDATE student_import_batches
       SET status = 'rolled_back', rolled_back_at = NOW()
       WHERE batch_id = ?`,
      [batchId]
    );
    await conn.commit();
    res.json({
      code: 'STUDENT_ROLLBACK_OK',
      message: 'Student data restored to before this import.',
      batchId,
      restoredRows,
      removedRows
    });
  } catch (error) {
    await conn.rollback();
    console.error('Rollback student import error:', error);
    res.status(500).json({ code: 'DATABASE_ERROR', message: error.message || 'Student rollback failed.' });
  } finally {
    conn.release();
  }
});

router.post('/groups/preview', ensureJWT, requirePermission('manageStudents'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ code: 'MISSING_FILE', message: 'Please upload an Excel or CSV file.' });
    if (!/\.(csv|xlsx|xls)$/i.test(req.file.originalname)) {
      return res.status(400).json({ code: 'INVALID_FILE_TYPE', message: 'Please upload a .csv, .xlsx, or .xls file.' });
    }
    const preview = readGroupFile(fs.readFileSync(req.file.path));
    const noGroupsFound = preview.records.length === 0 && preview.issues.every(issue => issue.message === 'No group headers or student records were found.');
    if (noGroupsFound) {
      return res.json({ code: 'NO_GROUP_SHEETS', records: [], issues: [], counts: { valid: 0, warning: 0, error: 0, importable: 0, skipped: 0 }, hasErrors: false, hasFatalErrors: false, hasGroups: false });
    }
    return res.status(preview.hasFatalErrors ? 422 : 200).json({
      code: preview.hasFatalErrors ? 'GROUP_IMPORT_FATAL_ERROR' : 'GROUP_IMPORT_PREVIEW_READY',
      ...preview,
      hasGroups: true
    });
  } catch (error) {
    console.error('Group import preview error:', error);
    return res.status(400).json({ code: 'INVALID_GROUP_FILE', message: error.message || 'Could not read the group file.' });
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
});

router.post('/groups/save', ensureJWT, requirePermission('manageStudents'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const records = Array.isArray(req.body.records) ? req.body.records : [];
    if (!records.length) return res.status(400).json({ code: 'EMPTY_GROUP_IMPORT', message: 'No group records were provided.' });
    const invalidRecords = records.filter(record => (
      !parseStudentId(record.studentKey) ||
      !/^Group\d+$/.test(String(record.groupCode || '')) ||
      record.validationStatus === 'error'
    ));
    const validRecords = records.filter(record => !invalidRecords.includes(record));
    if (!validRecords.length) return res.status(422).json({ code: 'NO_VALID_GROUP_RECORDS', message: 'No valid group records are available to import.', invalidRecords });

    await ensureStudentAdminSchema();
    const [classes] = await conn.query('SELECT class_id, class_name FROM class');
    const classMap = new Map(classes.map(row => [String(row.class_name).trim().toUpperCase(), row.class_id]));
    const resolved = [];
    const missingStudents = [];
    for (const record of validRecords) {
      const parsed = parseStudentId(record.studentKey);
      const classId = classMap.get(parsed.className);
      if (!classId) {
        missingStudents.push({ studentKey: parsed.studentKey, message: `Class ${parsed.className} was not found.` });
        continue;
      }
      const [students] = await conn.query(
        'SELECT student_id FROM student WHERE class_id = ? AND class_number = ? LIMIT 1',
        [classId, parsed.studentNo.padStart(2, '0')]
      );
      if (!students.length) {
        missingStudents.push({ studentKey: parsed.studentKey, message: `Student ${parsed.studentKey} was not found.` });
      } else {
        resolved.push({
          studentId: students[0].student_id,
          classId,
          className: parsed.className,
          groupCode: record.groupCode,
          gradeLevel: String(record.gradeLevel || '').trim().toUpperCase(),
          subjectCode: String(record.subjectCode || '').trim()
        });
      }
    }
    if (!resolved.length) return res.status(422).json({ code: 'GROUP_STUDENTS_NOT_FOUND', message: 'None of the valid rows could be matched to a student.', missingStudents });

    const contextualRecords = resolved.filter(record => record.gradeLevel && record.subjectCode);
    const legacyRecords = resolved.filter(record => !record.gradeLevel || !record.subjectCode);
    const importedContexts = [];

    await ensureLessonGroupSchema(conn);
    const [subjects] = await conn.query(
      'SELECT subject_id, subject_name, subject_name_zh, subject_name_en FROM subject'
    );
    const normalizeLookup = value => String(value || '').trim().toLowerCase().replace(/[\s_\-／/()]+/g, '');
    const subjectAliases = {
      eng: ['eng', 'englishlanguage', '英國語文'],
      chi: ['chi', 'chin', 'chinese', 'chineselanguage', '中國語文', '中文'],
      chin: ['chi', 'chin', 'chinese', 'chineselanguage', '中國語文', '中文'],
      中文: ['chi', 'chin', 'chinese', 'chineselanguage', '中國語文', '中文']
    };
    const resolveSubject = subjectCode => {
      const wanted = normalizeLookup(subjectCode);
      const exactMatches = subjects.filter(subject => (
        normalizeLookup(subject.subject_name) === wanted
      ));
      if (exactMatches.length === 1) return exactMatches[0];
      const accepted = new Set([wanted, ...(subjectAliases[wanted] || []).map(normalizeLookup)]);
      const matches = subjects.filter(subject => (
        [subject.subject_name, subject.subject_name_zh, subject.subject_name_en]
          .map(normalizeLookup)
          .some(name => accepted.has(name))
      ));
      return matches.length === 1 ? matches[0] : null;
    };

    const contexts = new Map();
    contextualRecords.forEach(record => {
      const key = `${record.gradeLevel}|${record.subjectCode.toUpperCase()}`;
      if (!contexts.has(key)) contexts.set(key, []);
      contexts.get(key).push(record);
    });

    const contextErrors = [];
    const contextAssignments = [];
    for (const [contextKey, contextRecords] of contexts) {
      const [gradeLevel, subjectCode] = contextKey.split('|');
      const gradeNumber = (gradeLevel.match(/[1-6]/) || [])[0];
      const classCandidates = [`S${gradeNumber}`, `F${gradeNumber}`];
      const masterClasses = classes.filter(row => classCandidates.includes(String(row.class_name).trim().toUpperCase()));
      const relevantClassIds = Array.from(new Set([
        ...masterClasses.map(row => row.class_id),
        ...contextRecords.map(record => record.classId)
      ]));
      const targetSubject = resolveSubject(subjectCode);
      const groupNumbers = Array.from(new Set(
        contextRecords.map(record => Number(record.groupCode.replace(/\D/g, '')))
      )).sort((a, b) => a - b);

      if (!relevantClassIds.length) {
        contextErrors.push(`${gradeLevel}: matching timetable class ${classCandidates.join('/')} or a student class was not found.`);
        continue;
      }
      if (!targetSubject) {
        contextErrors.push(`${gradeLevel}_${subjectCode}: subject was not found or was ambiguous.`);
        continue;
      }
      if (groupNumbers.some((number, index) => number !== index + 1)) {
        contextErrors.push(`${gradeLevel}_${subjectCode}: groups must start at Group 1 without gaps.`);
        continue;
      }

      const [lessonRows] = await conn.query(
        `SELECT tt.timetable_id, tt.day_of_week, tt.period_id,
                tt.teacher_id, tt.room_id, t.teacher_name, r.room_name
         FROM timetable tt
         JOIN teacher t ON tt.teacher_id = t.teacher_id
         JOIN room r ON tt.room_id = r.room_id
         WHERE tt.class_id IN (?) AND tt.subject_id = ?
         ORDER BY FIELD(tt.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
                  tt.period_id, t.teacher_name, r.room_name`,
        [relevantClassIds, targetSubject.subject_id]
      );
      const teachingGroups = new Map();
      lessonRows.forEach(lesson => {
        const teachingGroupKey = `${lesson.teacher_id}|${lesson.room_id}`;
        if (!teachingGroups.has(teachingGroupKey)) teachingGroups.set(teachingGroupKey, []);
        teachingGroups.get(teachingGroupKey).push(lesson);
      });
      const timetableGroups = Array.from(teachingGroups.values());
      if (timetableGroups.length !== groupNumbers.length) {
        const foundDescription = timetableGroups.length
          ? ` The matching timetable contains ${timetableGroups.length} teacher/room group(s).`
          : ' No matching timetable lessons were found.';
        contextErrors.push(`${gradeLevel}_${subjectCode}: ${groupNumbers.length} worksheet groups could not be matched.${foundDescription}`);
        continue;
      }

      const familyTimetableIds = timetableGroups.flat().map(lesson => lesson.timetable_id);
      contextAssignments.push({
        records: contextRecords,
        timetableGroups,
        familyTimetableIds
      });
      importedContexts.push(`${gradeLevel}_${subjectCode}`);
    }

    if (!contextAssignments.length && !legacyRecords.length) return res.status(422).json({
      code: 'GROUP_CONTEXT_NOT_FOUND',
      message: 'No worksheet could be matched to timetable groups.',
      contextErrors,
      missingStudents
    });

    await conn.beginTransaction();
    for (const record of legacyRecords) {
      await conn.query('UPDATE student SET language_group = ? WHERE student_id = ?', [record.groupCode, record.studentId]);
    }
    for (const context of contextAssignments) {
      const studentIds = context.records.map(record => record.studentId);
      await conn.query(
        'DELETE FROM student_lesson_group WHERE student_id IN (?) AND timetable_id IN (?)',
        [studentIds, context.familyTimetableIds]
      );
      const values = context.records.flatMap(record => {
        const groupIndex = Number(record.groupCode.replace(/\D/g, '')) - 1;
        return (context.timetableGroups[groupIndex] || [])
          .map(lesson => [record.studentId, lesson.timetable_id]);
      });
      if (values.length) {
        await conn.query(
          'INSERT INTO student_lesson_group (student_id, timetable_id) VALUES ?',
          [values]
        );
      }
    }
    await conn.commit();
    const importedContextRows = contextAssignments.reduce((total, context) => total + context.records.length, 0);
    const skippedContextRows = contextualRecords.length - importedContextRows;
    const updatedRows = legacyRecords.length + importedContextRows;
    const skippedRows = invalidRecords.length + missingStudents.length + skippedContextRows;
    return res.json({
      code: skippedRows || contextErrors.length ? 'GROUP_IMPORT_PARTIAL' : 'GROUP_IMPORT_SAVED',
      message: skippedRows || contextErrors.length
        ? 'Valid group records were imported; invalid rows or unmatched worksheets were skipped.'
        : 'Group records imported successfully.',
      updatedRows,
      importedContexts,
      skippedRows,
      invalidRecords,
      missingStudents,
      contextErrors
    });
  } catch (error) {
    await conn.rollback();
    console.error('Group import save error:', error);
    return res.status(500).json({ code: 'DATABASE_ERROR', message: 'Failed to save group records.' });
  } finally {
    conn.release();
  }
});

export default router;
