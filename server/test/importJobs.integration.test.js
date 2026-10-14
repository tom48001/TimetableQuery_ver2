import { installSessionFixture } from './sessionFixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';

// Run only against an explicitly provisioned disposable schema, never real data.
test('import jobs: real batches, rollback, ownership, student/group completion and restart', {
  skip: process.env.IMPORT_JOB_INTEGRATION !== '1', timeout: 120000
}, async () => {
  assert.match(process.env.DB_NAME || '', /^codex_import_progress_test_/);
  const { default: express } = await import('express');
  const { default: xlsx } = await import('xlsx');
  const { default: pool } = await import('../src/db.js');
  const { default: router } = await import('../src/routes/importRoutes.js');
  const { initializeImportJobs } = await import('../src/utils/importJobs.js');
  await initializeImportJobs();
  await pool.query(`INSERT INTO user (user_id, user_name, email, role)
    VALUES (1, 'Import Test', 'import-test@example.test', 'manager')
    ON DUPLICATE KEY UPDATE user_id=user.user_id`);
  const app = express();
  const sessionCookie = await installSessionFixture(app, pool);
  app.use(express.json());
  app.use('/api/import', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/import`;
  const headers = { Cookie: sessionCookie(1) };
  const otherHeaders = { Cookie: sessionCookie(2) };
  const observed = [];
  // Record DB updates, not simulated percentages, to prove intermediate batches
  // are committed independently of the main import transaction.
  const originalQuery = pool.query.bind(pool);
  pool.query = async (...args) => {
    const result = await originalQuery(...args);
    if (String(args[0]).includes('processed_rows=LEAST')) {
      const [rows] = await originalQuery('SELECT processed_rows FROM import_jobs WHERE job_id=?', [args[1][1]]);
      observed.push(rows[0].processed_rows);
    }
    return result;
  };
  async function upload(path, rows) {
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, xlsx.utils.json_to_sheet(rows), 'Data');
    const form = new FormData();
    form.append('file', new Blob([xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })]), 'test.xlsx');
    const response = await fetch(`${base}/${path}?async=1`, { method: 'POST', headers, body: form });
    assert.equal(response.status, 202);
    return response.json();
  }
  async function finish(job) {
    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const response = await fetch(`${base}/progress/${job.jobId}`, { headers });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const progress = await response.json();
      assert.ok(progress.processedRows <= progress.totalRows);
      if (['success', 'failed'].includes(progress.status)) return progress;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Job did not finish');
  }
  try {
    const rows = Array.from({ length: 1100 }, (_, i) => ({
      teacher: `T${i}`, subject: 'ENG', class: '#6R/6Y', room: 'Test room', day: 'Mon', period: '1'
    }));
    const started = await upload('csv', rows);
    assert.equal(started.status, 'pending');
    assert.equal((await fetch(`${base}/progress/${started.jobId}`, { headers: otherHeaders })).status, 404);
    assert.equal((await fetch(`${base}/progress/${started.jobId}`)).status, 401);
    const success = await finish(started);
    assert.equal(success.status, 'success', JSON.stringify(success));
    assert.equal(success.totalRows, 1100);
    assert.equal(success.processedRows, 1100);
    assert.equal(success.result.insertedTimetable, 1100);
    assert.ok(observed.includes(500) && observed.includes(1000));
    // Duplicate slot in batch two: first batch is processed but all timetable
    // changes must roll back, and progress must stay below total on failure.
    const failed = await finish(await upload('csv', [...rows.slice(0, 500), rows[0]]));
    assert.equal(failed.status, 'failed');
    assert.equal(failed.totalRows, 501);
    assert.equal(failed.processedRows, 500);
    assert.ok(failed.errorMessage);
    const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM timetable');
    assert.equal(count.total, 1100);
    const invalid = await finish(await upload('csv', [{ ...rows[0], class: 'unknown' }]));
    assert.equal(invalid.status, 'failed');
    assert.deepEqual(invalid.result.missingClasses, ['unknown']);
    const student = await finish(await upload('students/file', [{
      regno: 'TEST01', student_ch_name: '測試', student_eng_name: 'Test Student',
      class: '6R', class_number: '01', sex: 'F'
    }]));
    assert.equal(student.status, 'success', JSON.stringify(student));
    assert.equal(student.totalRows, 1);
    assert.equal(student.processedRows, 1);
    const groupResponse = await fetch(`${base}/groups/save?async=1`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [{ studentKey: '6R01', groupCode: 'Group1', validationStatus: 'valid' }] })
    });
    assert.equal(groupResponse.status, 202);
    const group = await finish(await groupResponse.json());
    assert.equal(group.status, 'success', JSON.stringify(group));
    assert.equal(group.processedRows, 1);
    await pool.query("INSERT INTO import_jobs (job_id, owner_id) VALUES ('interrupted-test', 1)");
    await initializeImportJobs();
    const [[interrupted]] = await pool.query("SELECT status,error_message FROM import_jobs WHERE job_id='interrupted-test'");
    assert.equal(interrupted.status, 'failed');
    assert.match(interrupted.error_message, /restarted/);
  } finally {
    pool.query = originalQuery;
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});
