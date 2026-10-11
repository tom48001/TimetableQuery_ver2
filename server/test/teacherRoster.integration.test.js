import test from 'node:test';
import assert from 'node:assert/strict';

test('teacher roster import preserves IDs and permissions, links accounts, reimports and rejects conflicts atomically', {
  skip: process.env.TEACHER_ROSTER_INTEGRATION !== '1', timeout: 60000
}, async () => {
  assert.match(process.env.DB_NAME || '', /^codex_teacher_roster_test_/);
  const { default: express } = await import('express');
  const { default: jwt } = await import('jsonwebtoken');
  const { default: pool } = await import('../src/db.js');
  const { default: imports } = await import('../src/routes/importRoutes.js');
  const { initializeImportJobs } = await import('../src/utils/importJobs.js');
  await initializeImportJobs();
  const app = express(); app.use(express.json()); app.use('/api/import', imports);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/import`;
  const headers = { Authorization: `Bearer ${jwt.sign({ id: 1, role: 'manager' }, process.env.JWT_SECRET)}`, 'Content-Type': 'application/json' };
  async function request(path, body) {
    const response = await fetch(`${base}${path}`, { method: body ? 'POST' : 'GET', headers, body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, data: await response.json() };
  }
  async function save(records) {
    const start = await request('/teachers/save?async=1', { records });
    assert.equal(start.status, 202);
    for (let i = 0; i < 500; i += 1) {
      const result = await request(`/progress/${start.data.jobId}`);
      if (['success', 'failed'].includes(result.data.status)) return result.data;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Job timed out');
  }
  try {
    await pool.query("INSERT INTO user (user_id,user_name,email,role,permissions) VALUES (1,'Manager','manager@example.test','manager',NULL),(2,'Head','head@example.test','subject_head','{\"manageUsers\":true}')");
    await pool.query("INSERT INTO teacher (teacher_id,teacher_code,teacher_name,user_id) VALUES (1,'甲','UPDATED   NAME',NULL),(2,'乙','Original Two',2)");
    await pool.query(`INSERT INTO timetable (teacher_id,subject_id,class_id,room_id,day_of_week,period_id)
      SELECT 1,s.subject_id,c.class_id,r.room_id,'Mon',p.period_id FROM subject s,class c,room r,period p
      WHERE s.import_name='ENG' AND c.class_name='6R' AND r.room_name='操場' AND p.period_name='Period 1'`);
    const records = [
      { teacher_code: '', source_login: 'login-a', english_name: 'Updated Name', chinese_name: '新姓名', email: 'new@example.test' },
      { teacher_code: '', english_name: 'Existing Head', email: 'head@example.test' },
      { teacher_code: '', source_login: 'staff-no-timetable', english_name: 'No Email', email: '' }
    ];
    const preview = await request('/teachers/validate', { records });
    assert.equal(preview.data.hasErrors, false);
    assert.equal(preview.data.records[0].matchMethod, '姓名自動配對');
    assert.equal(preview.data.records[1].matchMethod, '電郵自動配對');
    const result = await save(records);
    assert.equal(result.status, 'success', JSON.stringify(result));
    assert.equal(result.processedRows, 3);
    assert.equal(result.result.createdAccounts, 1);
    assert.equal(result.result.withoutAccounts, 1);
    assert.equal(result.result.updatedTeachers, 2);
    const [[schedule]] = await pool.query('SELECT COUNT(*) AS count FROM timetable WHERE teacher_id=1');
    assert.equal(schedule.count, 1);
    const [[teacher]] = await pool.query('SELECT t.*,u.role FROM teacher t JOIN user u ON u.user_id=t.user_id WHERE t.teacher_id=1');
    assert.equal(teacher.role, 'teacher');
    assert.equal(teacher.chinese_name, '新姓名');
    const [[head]] = await pool.query('SELECT role,permissions FROM user WHERE user_id=2');
    assert.equal(head.role, 'subject_head');
    assert.equal(head.permissions, '{"manageUsers":true}');
    const withoutCode = records.map((record, index) => index === 0 ? { ...record, teacher_code: '' } : record);
    const mapped = await request('/teachers/validate', { records: withoutCode });
    assert.equal(mapped.data.records[0].teacher_number, '001');
    assert.equal(mapped.data.records[0].teacher_code, '甲');
    assert.equal(mapped.data.records[0].mappingReused, true);
    const repeat = await save(withoutCode);
    assert.equal(repeat.result.createdTeachers, 0);
    assert.equal(repeat.result.createdAccounts, 0);
    const conflictingMapping = await save([{ ...records[0], teacher_code: '乙' }]);
    assert.equal(conflictingMapping.status, 'failed');
    const failed = await save([{ ...records[0], english_name: 'Should not persist' }, { ...records[2], teacher_code: '丙', email: 'head@example.test' }]);
    assert.equal(failed.status, 'failed');
    assert.ok(failed.result.records[1].errors.length);
    const [[unchanged]] = await pool.query('SELECT teacher_name FROM teacher WHERE teacher_id=1');
    assert.equal(unchanged.teacher_name, 'Updated Name');
  } finally {
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});
