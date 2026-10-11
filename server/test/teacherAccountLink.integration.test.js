import test from 'node:test';
import assert from 'node:assert/strict';

test('account linking preserves imported identities and schedules with atomic conflicts', {
  skip: process.env.TEACHER_LINK_INTEGRATION !== '1', timeout: 60000
}, async () => {
  assert.match(process.env.DB_NAME || '', /^codex_teacher_link_test_/);
  const { default: express } = await import('express');
  const { default: jwt } = await import('jsonwebtoken');
  const { default: pool } = await import('../src/db.js');
  const { default: teacherRoutes } = await import('../src/routes/teacherRoutes.js');
  const { default: authRoutes } = await import('../src/routes/authRoutes.js');
  const app = express();
  app.use(express.json());
  app.use('/api/teachers', teacherRoutes);
  app.use('/api/auth', authRoutes);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = (id, role = 'manager') => jwt.sign({ id, role }, process.env.JWT_SECRET);
  async function request(path, method = 'GET', body, auth = token(1)) {
    const response = await fetch(`${base}${path}`, {
      method, headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    return { status: response.status, data: await response.json() };
  }
  const account = (email, teacher_id) => ({ user_name: 'Account display name', email, role: 'teacher', teacher_id });
  try {
    await pool.query("INSERT INTO user (user_id,user_name,email,role) VALUES (1,'Manager','manager@example.test','manager')");
    await pool.query(`INSERT INTO teacher (teacher_id,teacher_code,teacher_name,user_id) VALUES
      (1,'IMPORTED','Imported Teacher',NULL), (2,'SECOND','Second Teacher',NULL),
      (3,'OLD','Old placeholder',1), (4,'RACE','Concurrent Teacher',NULL)`);
    await pool.query(`INSERT INTO timetable (teacher_id,subject_id,class_id,room_id,day_of_week,period_id)
      SELECT 1,s.subject_id,c.class_id,r.room_id,'Mon',p.period_id
      FROM subject s,class c,room r,period p
      WHERE s.import_name='ENG' AND c.class_name='6R' AND r.room_name='操場' AND p.period_name='Period 1'`);
    const made = await request('/api/teachers', 'POST', account('teacher@example.test', 1));
    assert.equal(made.status, 200, JSON.stringify(made));
    const [[user]] = await pool.query("SELECT user_id,password FROM user WHERE email='teacher@example.test'");
    assert.equal(user.password, null);
    const own = await request(`/api/teachers/from-user/${user.user_id}`, 'GET', undefined, token(user.user_id, 'teacher'));
    assert.equal(own.data.teacher_id, 1);
    const [[schedule]] = await pool.query('SELECT COUNT(*) AS total FROM timetable WHERE teacher_id=?', [own.data.teacher_id]);
    assert.equal(schedule.total, 1);
    const users = await request('/api/teachers/getAllTeachers');
    assert.equal(users.data.find(row => row.user_id === user.user_id).teacher_code, 'IMPORTED');
    await request('/api/teachers/list');
    const [[teacherCount]] = await pool.query('SELECT COUNT(*) AS total FROM teacher');
    assert.equal(teacherCount.total, 4);
    const options = await request('/api/teachers/link-options');
    assert.equal(options.data.find(row => row.teacher_id === 1).lesson_count, 1);

    const conflict = await request('/api/teachers', 'POST', account('conflict@example.test', 1));
    assert.equal(conflict.status, 409);
    const [[notCreated]] = await pool.query("SELECT COUNT(*) AS total FROM user WHERE email='conflict@example.test'");
    assert.equal(notCreated.total, 0);
    const badTarget = await request('/api/teachers', 'POST', account('missing@example.test', 999));
    assert.equal(badTarget.status, 404);

    const relink = await request('/api/teachers/1', 'PUT', { ...account('manager@example.test', 2), role: 'manager' });
    assert.equal(relink.status, 200);
    const [[old]] = await pool.query('SELECT user_id,teacher_name FROM teacher WHERE teacher_id=3');
    assert.equal(old.user_id, null);
    const failedEdit = await request(`/api/teachers/${user.user_id}`, 'PUT', account('changed@example.test', 2));
    assert.equal(failedEdit.status, 409);
    const [[unchanged]] = await pool.query('SELECT email FROM user WHERE user_id=?', [user.user_id]);
    assert.equal(unchanged.email, 'teacher@example.test');
    const [[profile]] = await pool.query('SELECT teacher_name,user_id FROM teacher WHERE teacher_id=1');
    assert.equal(profile.teacher_name, 'Imported Teacher');
    assert.equal(profile.user_id, user.user_id);

    const races = await Promise.all([
      request('/api/teachers', 'POST', account('race1@example.test', 4)),
      request('/api/teachers', 'POST', account('race2@example.test', 4))
    ]);
    assert.deepEqual(races.map(result => result.status).sort(), [200, 409]);
    const denied = await request('/api/teachers', 'POST', account('denied@example.test', null), token(user.user_id, 'teacher'));
    assert.equal(denied.status, 403);
    const googleOnly = await request('/api/auth/login', 'POST', { email: 'teacher@example.test', password: 'anything' });
    assert.equal(googleOnly.status, 401);
    const removed = await request(`/api/teachers/${user.user_id}`, 'DELETE');
    assert.equal(removed.status, 200);
    const [[preserved]] = await pool.query('SELECT t.user_id, COUNT(tt.timetable_id) AS lessons FROM teacher t LEFT JOIN timetable tt ON tt.teacher_id=t.teacher_id WHERE t.teacher_id=1 GROUP BY t.teacher_id');
    assert.equal(preserved.user_id, null);
    assert.equal(preserved.lessons, 1);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});
