import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import pool from '../db.js';
import { activeImports, checkImportCancellation } from './importCancellation.js';

// Progress uses the pool, never the import transaction's connection, so polling
// can see updates before the transaction commits (or rolls back).
export async function initializeImportJobs() {
  await pool.query(`CREATE TABLE IF NOT EXISTS import_jobs (
    job_id CHAR(36) PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    status ENUM('pending','processing','success','failed') NOT NULL DEFAULT 'pending',
    total_rows INT UNSIGNED NOT NULL DEFAULT 0,
    processed_rows INT UNSIGNED NOT NULL DEFAULT 0,
    error_message TEXT NULL,
    result_json JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_import_jobs_owner (owner_id, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  // This application runs one backend process. Interrupted jobs cannot resume.
  await pool.query(`UPDATE import_jobs SET status='failed',
    error_message='Server restarted during import. Check import history before retrying.'
    WHERE status IN ('pending','processing')`);
}

export async function setImportTotal(req, total) {
  checkImportCancellation(req);
  if (!req.importJobId) return;
  await pool.query('UPDATE import_jobs SET total_rows=? WHERE job_id=?', [total, req.importJobId]);
}

export async function setImportProcessed(req, processed) {
  checkImportCancellation(req);
  if (!req.importJobId) return;
  await pool.query('UPDATE import_jobs SET processed_rows=LEAST(total_rows, ?) WHERE job_id=?', [processed, req.importJobId]);
}

export async function getImportProgress(req, res, next) {
  try {
    const [rows] = await pool.query(`SELECT job_id AS jobId, status,
      total_rows AS totalRows, processed_rows AS processedRows,
      error_message AS errorMessage, result_json AS result
      FROM import_jobs WHERE job_id=? AND owner_id=?`, [req.params.jobId, req.user.id]);
    res.set('Cache-Control', 'no-store');
    if (!rows.length) return res.status(404).json({ message: 'Import job not found.' });
    return res.json(rows[0]);
  } catch (error) { return next(error); }
}

// Keep the original synchronous API available to existing callers. New clients
// request ?async=1 and receive a job ID as soon as the upload has been received.
export function withImportJob(handler) {
  return async (req, res, next) => {
    if (req.query.async !== '1') {
      try { return await handler(req, res); } catch (error) { return next(error); }
    }
    const jobId = randomUUID();
    try {
      await pool.query('INSERT INTO import_jobs (job_id, owner_id) VALUES (?, ?)', [jobId, req.user.id]);
    } catch (error) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return next(error);
    }
    req.importJobId = jobId;
    req.importControl = { ownerId: req.user.id, cancelled: false, committing: false };
    activeImports.set(jobId, req.importControl);
    res.status(202).json({ jobId, status: 'pending', totalRows: 0, processedRows: 0, errorMessage: null });
    setImmediate(async () => {
      let statusCode = 200;
      let result;
      const response = {
        status(code) { statusCode = code; return this; },
        json(payload) { result = payload; return this; }
      };
      try {
        checkImportCancellation(req);
        await pool.query("UPDATE import_jobs SET status='processing' WHERE job_id=?", [jobId]);
        await handler(req, response);
        if (!result) throw new Error('Import ended without a result.');
        const succeeded = statusCode < 400;
        await pool.query(`UPDATE import_jobs SET status=?, error_message=?, result_json=?,
          processed_rows=IF(?, total_rows, processed_rows) WHERE job_id=?`,
        [succeeded ? 'success' : 'failed', succeeded ? null : result.message || 'Import failed.',
          JSON.stringify(result), succeeded, jobId]);
      } catch (error) {
        console.error('Import job failed:', error);
        await pool.query("UPDATE import_jobs SET status='failed', error_message=? WHERE job_id=?",
          [error.message || 'Import failed.', jobId]).catch(failure => console.error('Cannot persist job failure:', failure));
      } finally {
        activeImports.delete(jobId);
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
      }
    });
  };
}
