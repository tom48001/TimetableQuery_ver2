import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { ensureJWT } from '../auth/auth.js';
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: MESSAGES.needCredentials });
    }

    await ensurePermissionsColumn();
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(401).json({ error: MESSAGES.invalidCredentials });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: MESSAGES.jwtMissing });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: MESSAGES.invalidCredentials });
    }

    const role = user.role ? user.role.trim().toLowerCase() : 'teacher';
    const permissions = permissionsForUser(user);
    const token = jwt.sign(
      { id: user.user_id, role, user_name: user.user_name, email: user.email, permissions },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    const { password: passwordHash, ...safeUser } = user;
    safeUser.permissions = permissions;

    return res.json({ message: MESSAGES.loginOk, user: safeUser, token });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ error: MESSAGES.serverError });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_ORIGIN}/login?error=google` }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect(`${CLIENT_ORIGIN}/login?error=unauthorized`);
    }

    await ensurePermissionsColumn();
    const role = req.user.role ? req.user.role.trim().toLowerCase() : 'teacher';
    const permissions = permissionsForUser(req.user);
    const token = jwt.sign(
      { id: req.user.user_id, role, user_name: req.user.user_name, email: req.user.email, permissions },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.redirect(`${CLIENT_ORIGIN}/google-redirect?token=${token}`);
  }
);

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: MESSAGES.unauthorized });
  return res.json(req.user);
});

router.put('/change-password', ensureJWT, requirePermission('changePassword'), async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: MESSAGES.passwordFields });
  }

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

    const passwordMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: MESSAGES.currentPasswordWrong });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE user SET password = ? WHERE user_id = ?',
      [hashedPassword, req.user.id]
    );

    return res.json({ message: MESSAGES.passwordChanged });
  } catch (error) {
    console.error('Password change failed:', error);
    return res.status(500).json({ error: MESSAGES.passwordChangeFailed });
  }
});

router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: MESSAGES.logoutFailed });
    return res.json({ message: MESSAGES.logoutOk });
  });
});

export default router;
