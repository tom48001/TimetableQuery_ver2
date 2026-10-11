import test from 'node:test';
import assert from 'node:assert/strict';
import xlsx from 'xlsx';
process.env.GOOGLE_CLIENT_ID ||= 'test-client';
process.env.GOOGLE_CLIENT_SECRET ||= 'test-secret';
const { studentSheetSelection, normalizeStudentRow } = await import('../src/routes/importRoutes.js');

const headers = ['REGNO', '級別', '班別', '學號', '姓名', 'ENNAME', 'SEX', 'X1', 'X2', 'X3/M1/APL/OL', '數學/Maths'];
function workbook() {
  const book = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([headers, ['old', 'S4', '4M', 1, '舊資料', 'Old Student', 'F']]), 'Archive');
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([headers, ['262001', 'S4', '4M', 1, '測試學生', 'Test Student', 'F', '地理(C)', '生物(E)', 'M1(C)', 'Group1']]), '2627 Students');
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([['各班人數', 25]]), 'Statistics');
  return book;
}

test('annual roster is preferred over archived students, with all elective columns preserved', () => {
  const selected = studentSheetSelection(workbook());
  assert.equal(selected.sheetName, '2627 Students');
  assert.deepEqual(selected.skippedSheets, ['Archive', 'Statistics']);
  assert.equal(selected.rows.length, 1);
  const row = normalizeStudentRow(selected.rows[0]);
  assert.equal(row.regno, '262001');
  assert.deepEqual([row.x1, row.x2, row.x3, row.maths_group], ['地理(C)', '生物(E)', 'M1(C)', 'Group1']);
  assert.equal(studentSheetSelection(workbook(), 'missing').rows.length, 0);
});

test('student roster preview writes no students, confirm saves electives, reimport preserves ID', {
  skip: process.env.STUDENT_ROSTER_INTEGRATION !== '1', timeout: 60000
}, async () => {
  assert.match(process.env.DB_NAME || '', /^codex_student_roster_test_/);
  const { default: express } = await import('express');
  const { default: jwt } = await import('jsonwebtoken');
  const { default: pool } = await import('../src/db.js');
  const { default: router } = await import('../src/routes/importRoutes.js');
  const { initializeImportJobs } = await import('../src/utils/importJobs.js');
  await initializeImportJobs();
  await pool.query("INSERT INTO user (user_id,user_name,email,role) VALUES (1,'Manager','manager@example.test','manager')");
  const app = express(); app.use(express.json()); app.use('/api/import', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/import`;
  const auth = { Authorization: `Bearer ${jwt.sign({ id: 1, role: 'manager' }, process.env.JWT_SECRET)}` };
  async function upload(preview, sheetName = '') {
    const form = new FormData();
    form.append('file', new Blob([xlsx.write(workbook(), { type: 'buffer', bookType: 'xlsx' })]), 'roster.xlsx');
    form.append('sheetName', sheetName);
    const response = await fetch(`${base}/students/roster?${preview ? 'preview=1' : 'async=1'}`, { method: 'POST', headers: auth, body: form });
    const result = await response.json();
    if (preview) { assert.equal(response.status, 200, JSON.stringify(result)); return result; }
    assert.equal(response.status, 202);
    for (let i = 0; i < 500; i++) {
      const progress = await (await fetch(`${base}/progress/${result.jobId}`, { headers: auth })).json();
      if (['success', 'failed'].includes(progress.status)) return progress;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Import timed out');
  }
  try {
    const preview = await upload(true);
    assert.equal(preview.sheetName, '2627 Students');
    assert.equal(preview.totalRows, 1);
    assert.equal(preview.electiveRows, 1);
    const [[before]] = await pool.query('SELECT COUNT(*) AS n FROM student');
    assert.equal(before.n, 0);
    const first = await upload(false, preview.sheetName);
    assert.equal(first.status, 'success', JSON.stringify(first));
    assert.equal(first.processedRows, 1);
    const [[student]] = await pool.query('SELECT * FROM student');
    assert.equal(student.regno, '262001');
    assert.ok(student.x1_subject_id && student.x2_subject_id && student.x3_subject_id);
    const [subjects] = await pool.query('SELECT import_name FROM subject WHERE subject_id IN (?,?,?)', [student.x1_subject_id, student.x2_subject_id, student.x3_subject_id]);
    assert.deepEqual(subjects.map(row => row.import_name).sort(), ['地理(C)', '生物(E)', 'M1(C)'].sort());
    const repeat = await upload(false, preview.sheetName);
    assert.equal(repeat.status, 'success');
    assert.equal(repeat.result.insertedStudents, 0);
    assert.equal(repeat.result.updatedStudents, 1);
    const [after] = await pool.query('SELECT student_id FROM student');
    assert.deepEqual(after.map(row => row.student_id), [student.student_id]);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});
