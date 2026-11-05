import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { initializeAuthStorage, MysqlSessionStore, loginLimiter } from '../src/auth/sessionSecurity.js';

test('MySQL session persistence, expiry, logout race tombstone and rate counters', {
  skip: process.env.AUTH_STORAGE_INTEGRATION !== '1'
}, async () => {
  const env = dotenv.parse(readFileSync(new URL('../../.env.docker', import.meta.url)));
  process.env.SESSION_SECRET = 'auth-storage-isolated-test-key';
  const conn = await mysql.createConnection({ host: '127.0.0.1', port: 3307,
    user: env.DB_USER, password: env.DB_PASS, database: env.MYSQL_DATABASE || env.DB_NAME });
  // Connection-private TEMPORARY tables shadow any real table; closing the
  // connection automatically removes them. No school rows are read or changed.
  const db = { query(sql, args) { return conn.query(sql.replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMPORARY TABLE'), args); } };
  try {
    await initializeAuthStorage(db);
    const store = new MysqlSessionStore(db);
    const call = (method, ...args) => new Promise((resolve, reject) => store[method](...args, (error, value) => error ? reject(error) : resolve(value)));
    const value = { cookie: { expires: new Date(Date.now() + 60000) }, authExpires: Date.now() + 60000, passport: { user: { id: 123 } } };
    await call('set', 'test-session', value);
    assert.equal((await call('get', 'test-session')).passport.user.id, 123);
    await call('destroy', 'test-session');
    await call('set', 'test-session', value);
    assert.equal(await call('get', 'test-session'), null);
    await call('set', 'expired', { ...value, authExpires: Date.now() - 1 });
    assert.equal(await call('get', 'expired'), null);
    const limiter = loginLimiter(db);
    const attempt = async (email, ip = '127.0.0.1') => {
      let status = 200;
      const res = { set() {}, status(code) { status = code; return this; }, json() {} };
      await limiter({ path: '/login', ip, body: { email } }, res, error => { if (error) throw error; });
      return status;
    };
    for (let i = 0; i < 10; i++) assert.equal(await attempt('test@example.test'), 200);
    assert.equal(await attempt('TEST@example.test', '127.0.0.2'), 429);
    await conn.query('UPDATE auth_attempt SET expires = 0');
    assert.equal(await attempt('test@example.test'), 200);
    const burst = await Promise.all(Array.from({ length: 12 }, () => attempt('burst@example.test')));
    assert.ok(burst.includes(429));
  } finally { await conn.end(); }
});
