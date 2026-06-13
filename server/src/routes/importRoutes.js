import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import pool from '../db.js';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const REQUIRED_COLUMNS = ['teacher', 'subject', 'class', 'room', 'day', 'period'];

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
  '/excel',
  ensureJWT,
  requirePermission('importTimetable'),
  upload.single('file'),
  async (req, res) => {
    const conn = await pool.getConnection();

    try {
      if (!req.file) {
        return res.status(400).json({
          code: 'MISSING_FILE',
          message: 'Please upload an Excel file.'
        });
      }

      await ensureImportHistoryTables(conn);

      const workbook = xlsx.readFile(req.file.path);
      if (!workbook.SheetNames.includes('Timetable')) {
        return respondImportError(req, res, 400, {
          code: 'MISSING_SHEET',
          message: 'Excel must include a worksheet named Timetable.',
          expectedSheet: 'Timetable'
        });
      }

      const rows = xlsx.utils.sheet_to_json(workbook.Sheets.Timetable, { defval: '' });
      if (rows.length === 0) {
        return respondImportError(req, res, 400, {
          code: 'EMPTY_SHEET',
          message: 'Timetable worksheet is empty.'
        });
      }

      const columns = Object.keys(rows[0]).map(column => column.trim());
      const missingColumns = REQUIRED_COLUMNS.filter(column => !columns.includes(column));
      if (missingColumns.length) {
        return respondImportError(req, res, 400, {
          code: 'MISSING_COLUMNS',
          message: 'Excel is missing required columns.',
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
          message: 'No valid timetable rows were found in the Excel file.',
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
          message: 'Import failed. Please fix the Excel file or database reference data first.',
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

export default router;
