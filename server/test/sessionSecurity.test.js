import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { passwordError } from '../src/auth/passwordPolicy.js';
import { csrfProtection, sessionOptions, MysqlSessionStore } from '../src/auth/sessionSecurity.js';

test('password policy handles short, repeated, Unicode and bcrypt byte limits', () => {
  for (const value of [null, {}, '', '字'.repeat(25)]) assert.ok(passwordError(value));
  for (const value of ['123', 'a', 'short', 'a'.repeat(15), '123456789012345']) assert.equal(passwordError(value), null);
  assert.equal(passwordError('A school phrase with spaces!'), null);
  assert.equal(passwordError('這是一組足夠長度而且不同字元的密碼'), null);
});

test('production sessions require HTTPS and set secure cookie attributes', () => {
  assert.throws(() => sessionOptions(null, { NODE_ENV: 'production' }));
  const options = sessionOptions(null, { NODE_ENV: 'production', CLIENT_ORIGIN: 'https://school.test', SESSION_SECRET: 'a'.repeat(32) });
  assert.equal(options.cookie.secure, true);
  assert.equal(options.cookie.httpOnly, true);
  assert.equal(options.cookie.sameSite, 'lax');
});

test('HTTP login, CSRF, OAuth binding, revocation and shared throttling', async () => {
  process.env.SESSION_SECRET = 'isolated-test-secret-never-used-in-production';
  process.env.GOOGLE_CLIENT_ID = 'test-client';
  process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
  process.env.GOOGLE_CALLBACK_URL = 'http://localhost/api/auth/google/callback';
  process.env.CLIENT_ORIGIN = 'http://localhost:8080';
  const { default: pool } = await import('../src/db.js');
  const password = 'School test phrase with spaces';
  let user = { user_id: 1, user_name: 'Test', email: 'test@school.test', role: 'manager', password: await bcrypt.hash(password, 10) };
  const counters = new Map();
  // No live DB: fake only the persistence boundary; exercise real middleware/routes.
  pool.query = async (sql, args = []) => {
    if (sql.startsWith('ALTER TABLE')) return [[]];
    if (sql.includes('information_schema.COLUMNS')) return [[{ COLUMN_TYPE: "enum('subject_head')" }]];
    if (sql.startsWith('INSERT INTO auth_attempt')) {
      const previous = counters.get(args[0]);
      counters.set(args[0], previous && previous.expires > args[2] ? { ...previous, attempts: previous.attempts + 1 } : { attempts: 1, expires: args[1] });
      return [[]];
    }
    if (sql.startsWith('SELECT attempts')) return [[counters.get(args[0])]];
    if (sql.startsWith('UPDATE user SET password')) { user.password = args[0]; return [[]]; }
    if (sql.includes('FROM user WHERE')) {
      return [[...(user && (args[0] === user.email || args[0] === user.user_id) ? [{ ...user }] : [])]];
    }
    throw new Error(`Unexpected test query: ${sql}`);
  };
  const { default: passport, ensureSession } = await import('../src/auth/auth.js');
  const { default: routes } = await import('../src/routes/authRoutes.js');
  const app = express();
  app.use(express.json(), session(sessionOptions(new session.MemoryStore(), { SESSION_SECRET: process.env.SESSION_SECRET })));
  app.use(passport.initialize(), passport.session(), csrfProtection);
  app.use('/api/auth', routes);
  app.get('/protected', ensureSession, (req, res) => res.json({ role: req.user.role }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  function browser() {
    return { cookie: '', csrf: '', async request(path, method = 'GET', body, headers = {}) {
      const response = await fetch(base + path, { method, redirect: 'manual', headers: {
        Cookie: this.cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': this.csrf, ...headers
      }, body: body === undefined ? undefined : JSON.stringify(body) });
      if (response.headers.get('set-cookie')) this.cookie = response.headers.get('set-cookie').split(';')[0];
      return response;
    }, async prepare() {
      this.csrf = (await (await this.request('/api/auth/csrf')).json()).csrfToken;
    }, async login() {
      await this.prepare();
      const response = await this.request('/api/auth/login', 'POST', { email: user.email, password });
      assert.equal(response.status, 200);
      const data = await response.json();
      assert.equal(data.token, undefined);
      assert.equal(data.user.password, undefined);
      assert.match(response.headers.get('set-cookie'), /HttpOnly/);
      await this.prepare();
    } };
  }
  try {
    const first = browser();
    assert.equal((await first.request('/protected', 'GET', undefined, { Authorization: 'Bearer old-token' })).status, 401);
    await first.prepare();
    const anonymousCookie = first.cookie;
    assert.equal((await first.request('/api/auth/login', 'POST', { email: user.email, password }, { 'X-CSRF-Token': '' })).status, 403);
    assert.equal((await first.request('/api/auth/login', 'POST', { email: user.email, password }, { Origin: 'https://attacker.test' })).status, 403);
    assert.equal((await first.request('/api/auth/login', 'POST', {}, { 'X-CSRF-Token': 'é'.repeat(64) })).status, 403);
    await first.login();
    assert.notEqual(first.cookie, anonymousCookie);
    user.role = 'teacher';
    assert.equal((await (await first.request('/protected')).json()).role, 'teacher');
    user.role = 'manager';
    const stolenCookie = first.cookie;
    assert.equal((await first.request('/api/auth/logout', 'POST')).status, 200);
    first.cookie = stolenCookie;
    assert.equal((await first.request('/protected')).status, 401);

    const second = browser();
    await first.login(); await second.login();
    const changed = '123';
    assert.equal((await first.request('/api/auth/change-password', 'PUT', { currentPassword: password, newPassword: changed, confirmPassword: changed })).status, 200);
    assert.equal((await second.request('/protected')).status, 401);
    assert.equal((await first.request('/protected')).status, 401);

    const oauth = browser();
    const redirect = await oauth.request('/api/auth/google');
    const location = new URL(redirect.headers.get('location'));
    assert.ok(location.searchParams.get('state'));
    assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
    assert.ok(location.searchParams.get('code_challenge'));
    const wrong = await oauth.request('/api/auth/google/callback?code=unused&state=wrong');
    assert.match(wrong.headers.get('location'), /error=google/);
    const noSession = await browser().request(`/api/auth/google/callback?code=unused&state=${location.searchParams.get('state')}`);
    assert.match(noSession.headers.get('location'), /error=google/);
    const stateStore = passport._strategy('google')._stateStore;
    const req = { session: {} };
    const state = await new Promise((resolve, reject) => stateStore.store(req, 'test-verifier', null, {}, (error, value) => error ? reject(error) : resolve(value)));
    const verify = () => new Promise((resolve, reject) => stateStore.verify(req, state, (error, value) => error ? reject(error) : resolve(value)));
    assert.equal(await verify(), 'test-verifier');
    assert.equal(await verify(), false);

    counters.clear();
    const brute = browser(); await brute.prepare();
    for (let i = 0; i < 10; i++) assert.equal((await brute.request('/api/auth/login', 'POST', { email: 'missing@school.test', password: 'wrong' })).status, 401);
    const blocked = await brute.request('/api/auth/login', 'POST', { email: 'MISSING@school.test', password: 'wrong' });
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get('retry-after')) > 0);
    const another = browser(); await another.prepare();
    assert.equal((await another.request('/api/auth/login', 'POST', { email: 'missing@school.test', password: 'wrong' })).status, 429);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});

