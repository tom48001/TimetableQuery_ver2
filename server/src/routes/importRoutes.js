import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import pool from '../db.js';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import { ensureStudentAdminSchema } from '../controllers/manageStudentController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const REQUIRED_COLUMNS = ['teacher', 'subject', 'class', 'room', 'day', 'period'];
const REQUIRED_STUDENT_COLUMNS = [
  'regno',
  'student_ch_name',
  'student_eng_name',
  'class',
  'class_number',
  'sex'
];

const STUDENT_COLUMN_ALIASES = {
  regno: ['regno', 'reg_no', 'registration_no', 'registration_number', 'student_regno'],
  student_ch_name: ['student_ch_name', 'chinese_name', 'chi_name', 'ch_name', 'name_ch', '姓名', '中文名', '中文姓名'],
  student_eng_name: ['student_eng_name', 'english_name', 'eng_name', 'en_name', 'enname', 'name_en', '英文名', '英文姓名'],
  email: ['email', 'student_email', 'email_address', '電郵', '電郵地址'],
  grade: ['grade', 'grade_level', 'form', 'form_level', '級別', '年級'],
  class: ['class', 'class_name', '班別', '班級'],
  class_number: ['class_number', 'class_no', 'classnum', 'clsno', 'cls_no', 'class_index', 'student_no', 'student_number', '班號', '學號', '班別學號'],
  sex: ['sex', 'gender', '性別'],
  status: ['status', 'student_status', '狀態'],
  ncs: ['ncs', 'is_ncs', 'ncs_status'],
  x1: ['x1', 'elective_x1', 'subject_x1'],
  x2: ['x2', 'elective_x2', 'subject_x2'],
  x3: ['x3', 'x3_m1_apl_ol', 'elective_x3', 'subject_x3']
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
  sat: 'Sat'
};

const subjectAliasMap = {
  ENG: 'English',
  MATH: 'Mathematics',
  MATHS: 'Mathematics',
  BIO: 'Biology'
};

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

function normalizeColumnName(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[.\-/\\()\s]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function normalizeStudentRow(sourceRow) {
  const normalizedSource = Object.fromEntries(
    Object.entries(sourceRow).map(([key, value]) => [normalizeColumnName(key), value])
  );

  return Object.fromEntries(
    Object.entries(STUDENT_COLUMN_ALIASES).map(([field, aliases]) => {
      const matchedAlias = aliases.map(normalizeColumnName)
        .find(alias => Object.prototype.hasOwnProperty.call(normalizedSource, alias));
      return [field, matchedAlias ? normalizedSource[matchedAlias] : ''];
    })
  );
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
}

async function ensureStudentImportHistoryTables(connOrPool = pool) {
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
      FOREIGN KEY (batch_id) REFERENCES student_import_batches(batch_id) ON DELETE CASCADE,
      INDEX idx_student_import_history_batch (batch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
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

    try {
      if (!req.file) {
        return res.status(400).json({
          code: 'MISSING_FILE',
          message: 'Please upload a CSV file.'
        });
      }

      await ensureImportHistoryTables(conn);

      if (!/\.csv$/i.test(req.file.originalname)) {
        return respondImportError(req, res, 400, {
          code: 'INVALID_FILE_TYPE',
          message: 'Please upload a .csv file.'
        });
      }

      const workbook = xlsx.read(fs.readFileSync(req.file.path), { type: 'buffer' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(firstSheet, { defval: '' });
      if (rows.length === 0) {
        return respondImportError(req, res, 400, {
          code: 'EMPTY_FILE',
          message: 'CSV file is empty.'
        });
      }

      const columns = Object.keys(rows[0]).map(column => column.trim());
      const missingColumns = REQUIRED_COLUMNS.filter(column => !columns.includes(column));
      if (missingColumns.length) {
        return respondImportError(req, res, 400, {
          code: 'MISSING_COLUMNS',
          message: 'CSV is missing required columns.',
          requiredColumns: REQUIRED_COLUMNS,
          missingColumns
        });
      }

      await conn.beginTransaction();
      await conn.query('DELETE FROM staging_timetable');

      const invalidRows = [];
      let insertedStagingRows = 0;

      for (const [index, row] of rows.entries()) {
        const rowNumber = index + 2;
        const teacherCode = row.teacher?.toString().trim();
        const subject = row.subject ? normalizeSubject(row.subject) : null;
        const className = row.class?.toString().trim();
        const roomName = row.room?.toString().trim();
        const day = normalizeDay(row.day);
        const period = normalizePeriod(row.period);

        if (!teacherCode || !subject || !className || !roomName || !day || !period) {
          invalidRows.push({
            row: rowNumber,
            teacher: row.teacher,
            subject: row.subject,
            class: row.class,
            room: row.room,
            day: row.day,
            period: row.period
          });
          continue;
        }

        await conn.query(
          `INSERT INTO staging_timetable
            (teacher_code, subject, class, room, day_of_week, period)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [teacherCode, subject, className, roomName, day, period]
        );
        insertedStagingRows += 1;
      }

      if (insertedStagingRows === 0) {
        await conn.rollback();
        return respondImportError(req, res, 400, {
          code: 'NO_VALID_ROWS',
          message: 'No valid timetable rows were found in the CSV file.',
          invalidRows
        });
      }

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

      const importErrors = {
        missingTeachers: formatMissing(missingTeachers, 'teacher_code'),
        missingSubjects: formatMissing(missingSubjects, 'subject'),
        missingClasses: formatMissing(missingClasses, 'class'),
        missingRooms: formatMissing(missingRooms, 'room'),
        missingPeriods: formatMissing(missingPeriods, 'period'),
        invalidRows
      };

      const hasImportErrors = Object.values(importErrors).some(value => value.length > 0);
      if (hasImportErrors) {
        await conn.rollback();
        return respondImportError(req, res, 400, {
          code: 'IMPORT_VALIDATION_FAILED',
          message: 'Import failed. Please fix the CSV file or database reference data first.',
          ...importErrors
        });
      }

      const [batchResult] = await conn.query(
        `INSERT INTO import_batches
          (file_name, imported_by_user_id, imported_by_name, status, skipped_rows)
         VALUES (?, ?, ?, 'success', ?)`,
        [req.file.originalname, userIdFromRequest(req), await importUserName(conn, req.user), invalidRows.length]
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
        skippedRows: invalidRows.length,
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
      return res.status(500).json({
        code: 'DATABASE_ERROR',
        message: err.message || 'Import failed because of a server or database error.'
      });
    } finally {
      if (req.file) fs.unlink(req.file.path, () => {});
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
          message: 'Please upload a CSV file.'
        });
      }

      if (!/\.csv$/i.test(req.file.originalname)) {
        return res.status(400).json({
          code: 'INVALID_FILE_TYPE',
          message: 'Please upload a .csv file.'
        });
      }

      await ensureStudentAdminSchema();
      await ensureStudentImportHistoryTables(conn);
      const workbook = xlsx.read(fs.readFileSync(req.file.path), { type: 'buffer' });
      const rows = studentSheetRows(workbook);

      if (rows.length === 0) {
        return res.status(400).json({
          code: 'MISSING_COLUMNS',
          message: 'CSV does not contain all required student columns.',
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
          x1: String(row.x1 || '').trim(),
          x2: String(row.x2 || '').trim(),
          x3: String(row.x3 || '').trim()
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

      for (const subjectName of electiveCodes) {
        const [existingSubjects] = await conn.query(
          'SELECT subject_id FROM subject WHERE UPPER(TRIM(subject_name)) = ? LIMIT 1',
          [subjectName.toUpperCase()]
        );
        if (!existingSubjects.length) {
          await conn.query(
            'INSERT INTO subject (subject_name, is_elective) VALUES (?, TRUE)',
            [subjectName]
          );
        }
      }

      const [subjectRows] = await conn.query(
        'SELECT subject_id, subject_name FROM subject'
      );
      const subjectMap = new Map(
        subjectRows.map(row => [String(row.subject_name).trim().toUpperCase(), row.subject_id])
      );

      let insertedStudents = 0;
      let updatedStudents = 0;

      for (const row of normalizedRows) {
        const classId = classMap.get(row.class_name.toUpperCase());
        const [exactStudents] = await conn.query(
          `SELECT student_id
           FROM student
           WHERE regno = ? AND class_id = ? AND class_number = ?
           LIMIT 1`,
          [row.regno, classId, row.class_number]
        );
        let existingStudentId = exactStudents.length ? exactStudents[0].student_id : null;

        if (!existingStudentId && regnoCounts.get(row.regno) === 1) {
          const [studentsByRegno] = await conn.query(
            'SELECT student_id FROM student WHERE regno = ? LIMIT 2',
            [row.regno]
          );
          if (studentsByRegno.length === 1) existingStudentId = studentsByRegno[0].student_id;
        }

        if (!existingStudentId) {
          const [legacyStudents] = await conn.query(
            `SELECT student_id
             FROM student
             WHERE (regno IS NULL OR regno = '')
               AND class_id = ? AND class_number = ?
             LIMIT 2`,
            [classId, row.class_number]
          );
          if (legacyStudents.length === 1) existingStudentId = legacyStudents[0].student_id;
        }

        if (existingStudentId) {
          const [beforeRows] = await conn.query(
            `SELECT student_id, regno, email, student_ch_name, student_eng_name,
                    class_id, class_number, sex, status, is_ncs,
                    x1_subject_id, x2_subject_id, x3_subject_id
             FROM student WHERE student_id = ?`,
            [existingStudentId]
          );
          const before = beforeRows[0];
          await conn.query(
            `INSERT INTO student_import_history
              (batch_id, student_id, was_existing, regno, email, student_ch_name,
               student_eng_name, class_id, class_number, sex, status, is_ncs,
               x1_subject_id, x2_subject_id, x3_subject_id)
             VALUES (?, ?, TRUE, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              batchId, before.student_id, before.regno, before.email, before.student_ch_name,
              before.student_eng_name, before.class_id, before.class_number, before.sex,
              before.status, before.is_ncs, before.x1_subject_id, before.x2_subject_id,
              before.x3_subject_id
            ]
          );
          await conn.query(
            `UPDATE student
             SET regno = ?, email = ?, student_ch_name = ?, student_eng_name = ?, class_id = ?,
                 class_number = ?, sex = ?, status = ?, is_ncs = ?,
                 x1_subject_id = ?, x2_subject_id = ?, x3_subject_id = ?
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
              existingStudentId
            ]
          );
          updatedStudents += 1;
        } else {
          const [insertedResult] = await conn.query(
            `INSERT INTO student
              (regno, email, student_ch_name, student_eng_name, class_id, class_number, sex,
               status, is_ncs, x1_subject_id, x2_subject_id, x3_subject_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
              subjectMap.get(row.x3.toUpperCase()) || null
            ]
          );
          await conn.query(
            `INSERT INTO student_import_history
              (batch_id, student_id, was_existing)
             VALUES (?, ?, FALSE)`,
            [batchId, insertedResult.insertId]
          );
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
             x1_subject_id = ?, x2_subject_id = ?, x3_subject_id = ?
         WHERE student_id = ?`,
        [
          row.regno, row.email, row.student_ch_name, row.student_eng_name,
          row.class_id, row.class_number, row.sex, row.status, row.is_ncs,
          row.x1_subject_id, row.x2_subject_id, row.x3_subject_id, row.student_id
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

export default router;
