// Business-route integration fixtures. Authentication and CSRF behavior are
// exercised separately by sessionSecurity.test.js using real login requests.
import session from 'express-session';
import signature from 'cookie-signature';
import { randomBytes } from 'node:crypto';
import { SESSION_NAME, SESSION_MS, passwordTag, sessionOptions, initializeAuthStorage } from '../src/auth/sessionSecurity.js';

export async function installSessionFixture(app, db) {
  process.env.SESSION_SECRET ||= 'integration-test-session-secret-only';
  const { default: passport } = await import('../src/auth/auth.js');
  await initializeAuthStorage(db);
  const store = new session.MemoryStore();
  app.use(session(sessionOptions(store, { SESSION_SECRET: process.env.SESSION_SECRET })));
  app.use(passport.initialize(), passport.session());
  return id => {
    const sid = randomBytes(24).toString('hex');
    store.set(sid, { cookie: { expires: new Date(Date.now() + SESSION_MS), maxAge: SESSION_MS },
      authExpires: Date.now() + SESSION_MS, passport: { user: { id, passwordTag: passwordTag(null) } } });
    return `${SESSION_NAME}=${encodeURIComponent('s:' + signature.sign(sid, process.env.SESSION_SECRET))}`;
  };
}
