import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const MANAGER_EMAILS = process.env.MANAGER_EMAILS
  ? process.env.MANAGER_EMAILS.split(',').map(email => email.trim()).filter(Boolean)
  : [];
const GOOGLE_ALLOWED_DOMAIN = process.env.GOOGLE_ALLOWED_DOMAIN || 'gmail.com';

async function promoteManagerIfNeeded(user) {
  if (MANAGER_EMAILS.includes(user.email) && user.role !== 'manager') {
    await pool.query("UPDATE user SET role = 'manager' WHERE user_id = ?", [user.user_id]);
    return { ...user, role: 'manager' };
  }

  return user;
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;

    if (!email || !googleId) {
      return done(null, false, { message: 'Google profile is missing email or id.' });
    }

    if (!email.endsWith(`@${GOOGLE_ALLOWED_DOMAIN}`)) {
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
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await pool.query('SELECT * FROM user WHERE user_id = ?', [id]);
    done(null, users[0] || null);
  } catch (error) {
    done(error, null);
  }
});

export function ensureJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
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
