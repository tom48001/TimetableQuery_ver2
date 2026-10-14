import session from 'express-session';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_NAME = 'timetable.sid';
export const SESSION_MS = 2 * 60 * 60 * 1000;
export function passwordTag(password) {
  return createHmac('sha256', process.env.SESSION_SECRET).update(password || 'google-only').digest('hex');
}

export function sessionOptions(store, env = process.env) {
  const production = env.NODE_ENV === 'production';
  if (production && (!env.CLIENT_ORIGIN?.startsWith('https://') || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32)) {
    throw new Error('Production requires HTTPS CLIENT_ORIGIN and SESSION_SECRET of at least 32 characters.');
  }
  return { name: SESSION_NAME, secret: env.SESSION_SECRET, store, resave: false,
    saveUninitialized: false, cookie: { httpOnly: true, secure: production,
      sameSite: 'lax', maxAge: SESSION_MS, path: '/' } };
}

export async function initializeAuthStorage(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS auth_session (
    sid VARCHAR(128) PRIMARY KEY, expires BIGINT NOT NULL, data MEDIUMTEXT NOT NULL,
    INDEX (expires)) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS auth_attempt (
    bucket CHAR(64) PRIMARY KEY, attempts INT NOT NULL, expires BIGINT NOT NULL,
    INDEX (expires)) ENGINE=InnoDB`);
}

export class MysqlSessionStore extends session.Store {
  constructor(db) { super(); this.db = db; }
  get(sid, callback) {
    this.db.query('SELECT data FROM auth_session WHERE sid = ? AND expires > ?', [sid, Date.now()])
      .then(([rows]) => callback(null, rows.length ? JSON.parse(rows[0].data) : null)).catch(callback);
  }
  set(sid, value, callback = () => {}) {
    const expires = value.authExpires || new Date(value.cookie.expires).getTime();
    this.db.query(`INSERT INTO auth_session (sid, expires, data) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE expires = IF(data = 'null', expires, VALUES(expires)),
      data = IF(data = 'null', data, VALUES(data))`,
    [sid, expires, JSON.stringify(value)]).then(() => callback()).catch(callback);
  }
  destroy(sid, callback = () => {}) {
    // Keep a tombstone until any concurrent request with the old ID has expired.
    this.db.query(`INSERT INTO auth_session (sid, expires, data) VALUES (?, ?, 'null')
      ON DUPLICATE KEY UPDATE data = 'null', expires = VALUES(expires)`,
    [sid, Date.now() + SESSION_MS]).then(() => callback()).catch(callback);
  }
  // Authenticated sessions have an absolute lifetime; reads do not extend it.
  touch(sid, value, callback = () => {}) { callback(); }
}

export function csrfToken(req) {
  if (!req.session.csrf) req.session.csrf = randomBytes(32).toString('hex');
  return req.session.csrf;
}

export function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  const expectedOrigin = new URL(process.env.CLIENT_ORIGIN || 'http://localhost:8080').origin;
  const provided = req.headers['x-csrf-token'];
  const expected = req.session?.csrf;
  if ((origin && origin !== expectedOrigin) || typeof provided !== 'string' || !/^[a-f0-9]{64}$/.test(provided) || !expected ||
      provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
    return res.status(403).json({ code: 'CSRF_INVALID', error: 'Please refresh the page and try again.' });
  }
  next();
}

// Atomic shared counters prevent bypass through parallel requests or app restarts.
export function loginLimiter(db) {
  return async (req, res, next) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const account = req.path === '/change-password' ? `user:${req.user.id}` : email;
    const keys = [[`ip:${req.ip}`, 100], [`account:${account || 'unknown'}`, 10]];
    const now = Date.now();
    const expires = now + 15 * 60 * 1000;
    try {
      for (const [key, limit] of keys) {
        const bucket = createHmac('sha256', process.env.SESSION_SECRET).update(key).digest('hex');
        await db.query(`INSERT INTO auth_attempt (bucket, attempts, expires) VALUES (?, 1, ?)
          ON DUPLICATE KEY UPDATE attempts = IF(expires <= ?, 1, attempts + 1),
          expires = IF(expires <= ?, VALUES(expires), expires)`, [bucket, expires, now, now]);
        const [[row]] = await db.query('SELECT attempts, expires FROM auth_attempt WHERE bucket = ?', [bucket]);
        if (row.attempts > limit) {
          res.set('Retry-After', String(Math.max(1, Math.ceil((row.expires - now) / 1000))));
          return res.status(429).json({ error: '登入嘗試過多，請稍後再試。Too many attempts. Please try again later.' });
        }
      }
      next();
    } catch (error) { next(error); }
  };
}
