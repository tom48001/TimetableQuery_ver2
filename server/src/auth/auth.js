// auth.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// ====== Manager 白名單處理 ======
const MANAGER_EMAILS = process.env.MANAGER_EMAILS
  ? process.env.MANAGER_EMAILS.split(',').map(e => e.trim())
  : [];

// ====== Google OAuth2 Strategy ======
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const role = MANAGER_EMAILS.includes(email) ? 'manager' : 'teacher';

    // 先用 google_id 找
    let [existing] = await pool.query("SELECT * FROM user WHERE google_id = ?", [profile.id]);

    if (existing.length === 0) {
      // 如果 google_id 沒找到，就用 email 找
      [existing] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);
    }

    if (existing.length === 0) {
      // 如果完全沒有，就新增 user
      const [result] = await pool.query(
        "INSERT INTO user (google_id, user_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [profile.id, profile.displayName, email, null, role]  // Google 登入的帳號 password 設為 NULL
      );

      const userId = result.insertId;
      await pool.query(
        "INSERT INTO teacher (user_id, teacher_name) VALUES (?, ?)",
        [userId, profile.displayName]
      );

      return done(null, { user_id: userId, google_id: profile.id, user_name: profile.displayName, email, role });
    } else {
      const existingUser = existing[0];

      // 如果已有帳號但沒 google_id，就補上
      if (!existingUser.google_id) {
        await pool.query("UPDATE user SET google_id = ? WHERE user_id = ?", [profile.id, existingUser.user_id]);
      }

      // 如果這個 email 在白名單，但 role 不是 manager，就升級
      if (MANAGER_EMAILS.includes(existingUser.email) && existingUser.role !== 'manager') {
        await pool.query("UPDATE user SET role = 'manager' WHERE user_id = ?", [existingUser.user_id]);
        existingUser.role = 'manager';
      }

      return done(null, existingUser);
    }
  } catch (error) {
    return done(error, null);
  }
}));

// ====== Session 序列化 / 反序列化 ======
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  const [user] = await pool.query("SELECT * FROM user WHERE user_id = ?", [id]);
  done(null, user[0]);
});

// ====== JWT Middleware ======
export function ensureJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Token 無效' });
  }
}

// 檢查是否登入
export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: '未登入' });
}

// 檢查角色
export function checkRole(role) {
  return (req, res, next) => {
    console.log('使用者身分:', req.user?.role);
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ error: '權限不足' });
    }
  };
}

export default passport;
