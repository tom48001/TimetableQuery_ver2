import { subjectHeadIds } from '../utils/subjectHeadSubjects.js';
import express from 'express';
import passport from 'passport';
import { SESSION_NAME, SESSION_MS, csrfToken, loginLimiter } from '../auth/sessionSecurity.js';
import { passwordError } from '../auth/passwordPolicy.js';
import db from '../db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { ensureSession } from '../auth/auth.js';
import { ensurePermissionsColumn, permissionsForUser, requirePermission } from '../auth/permissions.js';

dotenv.config();
const router = express.Router();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080';

const MESSAGES = {
  needCredentials: '\u8acb\u8f38\u5165\u96fb\u90f5\u53ca\u5bc6\u78bc\u3002',
  invalidCredentials: '\u96fb\u90f5\u6216\u5bc6\u78bc\u4e0d\u6b63\u78ba\u3002',
  jwtMissing: '\u4f3a\u670d\u5668\u672a\u8a2d\u5b9a JWT_SECRET\u3002',
  loginOk: '\u767b\u5165\u6210\u529f\u3002',
  serverError: '\u4f3a\u670d\u5668\u932f\u8aa4\u3002',
  unauthorized: '\u672a\u767b\u5165\u3002',
  logoutOk: '\u767b\u51fa\u6210\u529f\u3002',
  logoutFailed: '\u767b\u51fa\u5931\u6557\u3002',
  passwordFields: '\u8acb\u8f38\u5165\u539f\u5bc6\u78bc\u3001\u65b0\u5bc6\u78bc\u53ca\u518d\u6b21\u78ba\u8a8d\u65b0\u5bc6\u78bc\u3002',
  passwordMismatch: '\u5169\u6b21\u8f38\u5165\u7684\u65b0\u5bc6\u78bc\u4e0d\u76f8\u540c\u3002',
  currentPasswordWrong: '\u539f\u5bc6\u78bc\u4e0d\u6b63\u78ba\u3002',
  passwordChanged: '\u5bc6\u78bc\u5df2\u66f4\u65b0\u3002',
  userMissing: '\u627e\u4e0d\u5230\u4f7f\u7528\u8005\u3002',
  passwordChangeFailed: '\u66f4\u65b0\u5bc6\u78bc\u5931\u6557\u3002'
};

const limitLogin = loginLimiter(db);
const dummyHash = await bcrypt.hash('dummy comparison password only', 10);
function publicUser(user) {
  return { id: user.user_id, user_id: user.user_id, role: String(user.role || 'teacher').trim().toLowerCase(),
    user_name: user.user_name, email: user.email, permissions: permissionsForUser(user),
    subject_head_subject_id: user.subject_head_subject_id || null, subject_head_subject_ids: subjectHeadIds(user) };
}
function finishLogin(req, res, next, user, google = false) {
  // Passport regenerates the session ID, preventing session fixation.
  req.logIn(user, error => {
    if (error) return next(error);
    req.session.authExpires = Date.now() + SESSION_MS;
    csrfToken(req);
    req.session.save(error => {
      if (error) return next(error);
      if (google) return res.redirect(`${CLIENT_ORIGIN}/google-redirect`);
      return res.json({ message: MESSAGES.loginOk, user: publicUser(user) });
    });
  });
}

router.get('/csrf', (req, res) => res.json({ csrfToken: csrfToken(req) }));
router.post('/login', limitLogin, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || !password || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ error: MESSAGES.needCredentials });
    }
    await ensurePermissionsColumn();
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email.trim().toLowerCase()]);
    const user = users[0];
    const matches = await bcrypt.compare(password, user?.password || dummyHash);
    if (!user?.password || !matches) return res.status(401).json({ error: MESSAGES.invalidCredentials });
    return finishLogin(req, res, next, user);
  } catch (error) { next(error); }
});

router.get('/google', (req, res, next) => {
  req.session.oauthStarted = Date.now();
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
  const started = req.session.oauthStarted;
  delete req.session.oauthStarted;
  if (!started || Date.now() - started > 10 * 60 * 1000) {
    return res.redirect(`${CLIENT_ORIGIN}/login?error=google`);
  }
  passport.authenticate('google', { session: false }, async (error, user) => {
    if (error) return next(error);
    if (!user) return res.redirect(`${CLIENT_ORIGIN}/login?error=google`);
    try {
      await ensurePermissionsColumn();
      return finishLogin(req, res, next, user, true);
    } catch (error) { next(error); }
  })(req, res, next);
});
router.get('/me', ensureSession, (req, res) => res.json(publicUser(req.user)));

router.put('/change-password', ensureSession, requirePermission('changePassword'), limitLogin, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (typeof currentPassword !== 'string' || !currentPassword || Buffer.byteLength(currentPassword) > 72 || typeof confirmPassword !== 'string') {
    return res.status(400).json({ error: MESSAGES.passwordFields });
  }

  const policyError = passwordError(newPassword);
  if (policyError) return res.status(400).json({ error: policyError });
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: MESSAGES.passwordMismatch });
  }

  try {
    const [users] = await db.query(
      'SELECT user_id, password FROM user WHERE user_id = ?',
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ error: MESSAGES.userMissing });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, users[0].password || dummyHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: MESSAGES.currentPasswordWrong });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE user SET password = ? WHERE user_id = ?',
      [hashedPassword, req.user.id]
    );

    return req.session.destroy(error => {
      if (error) return res.status(500).json({ error: MESSAGES.passwordChangeFailed });
      res.clearCookie(SESSION_NAME, { path: '/' });
      return res.json({ message: MESSAGES.passwordChanged, signInRequired: true });
    });
  } catch (error) {
    console.error('Password change failed:', error);
    return res.status(500).json({ error: MESSAGES.passwordChangeFailed });
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error);
    res.clearCookie(SESSION_NAME, { path: '/' });
    return res.json({ message: MESSAGES.logoutOk });
  });
});

export default router;
