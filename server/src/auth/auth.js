import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../db.js';
import { passwordTag } from './sessionSecurity.js';
import { permissionsForUser } from './permissions.js';
import { googleDomain, managerEmails, isGoogleEmailAllowed } from '../utils/googleAccess.js';

dotenv.config();

const MANAGER_EMAILS = managerEmails();
const GOOGLE_ALLOWED_DOMAIN = googleDomain();

async function promoteManagerIfNeeded(user) {
  if (MANAGER_EMAILS.includes(String(user.email).trim().toLowerCase()) && user.role !== 'manager') {
    await pool.query("UPDATE user SET role = 'manager' WHERE user_id = ?", [user.user_id]);
    return { ...user, role: 'manager' };
  }

  return user;
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  state: true,
  pkce: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    const googleId = profile.id;

    if (!email || !googleId) {
      return done(null, false, { message: 'Google profile is missing email or id.' });
    }

    if (!isGoogleEmailAllowed(email, GOOGLE_ALLOWED_DOMAIN, MANAGER_EMAILS)) {
      return done(null, false, { message: `Only ${GOOGLE_ALLOWED_DOMAIN} Google accounts are allowed.` });
    }

    const [googleUsers] = await pool.query('SELECT * FROM user WHERE google_id = ?', [googleId]);
    if (googleUsers.length > 0) {
      return done(null, await promoteManagerIfNeeded(googleUsers[0]));
    }

    const [emailUsers] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    if (emailUsers.length === 0) {
      return done(null, false, { message: 'This Google email is not registered. Please ask a manager to add the account first.' });
    }

    const existingUser = emailUsers[0];
    if (existingUser.google_id && existingUser.google_id !== googleId) {
      return done(null, false, { message: 'This user is already linked to another Google account.' });
    }

    await pool.query('UPDATE user SET google_id = ? WHERE user_id = ?', [googleId, existingUser.user_id]);
    return done(null, await promoteManagerIfNeeded({ ...existingUser, google_id: googleId }));
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, { id: user.user_id, passwordTag: passwordTag(user.password) });
});

passport.deserializeUser(async (identity, done) => {
  try {
    const [users] = await pool.query('SELECT * FROM user WHERE user_id = ?', [identity?.id || 0]);
    const user = users[0];
    done(null, user && identity.passwordTag === passwordTag(user.password) ? user : false);
  } catch (error) {
    done(error, null);
  }
});

export function ensureSession(req, res, next) {
  if (!req.isAuthenticated?.() || !req.session.authExpires || req.session.authExpires <= Date.now()) {
    return res.status(401).json({ error: 'Please sign in again.' });
  }
  req.user.id = req.user.user_id;
  req.user.role = String(req.user.role || 'teacher').trim().toLowerCase();
  req.user.permissions = permissionsForUser(req.user);
  return next();
}

export async function ensureTeacherIdentity(req, res, next) {
  try {
    const [teachers] = await pool.query(
      'SELECT teacher_id FROM teacher WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );

    if (!teachers.length) {
      return res.status(403).json({
        code: 'TEACHER_PROFILE_REQUIRED',
        error: 'The signed-in account is not linked to a teacher profile.'
      });
    }

    req.user.teacher_id = teachers[0].teacher_id;
    return next();
  } catch (error) {
    console.error('Failed to resolve teacher identity:', error);
    return res.status(500).json({ error: 'Failed to resolve teacher identity.' });
  }
}

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized' });
}

export function checkRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };
}

export default passport;
