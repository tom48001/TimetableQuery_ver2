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

    // 1. 檢查 domain
    if (!email.endsWith('@gmail.com')) {
      return done(null, false, { message: "只允許 smcc.edu.hk 帳號登入" });
    }

    // 2. 查 DB user 白名單
    let [existing] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);

    if (existing.length === 0) {
      return done(null, false, { message: "帳號未註冊，請聯絡 admin 開帳號。" });
    }

    let existingUser = existing[0];

    // 3. 如果已有帳號但冇 google_id → 補上
    if (!existingUser.google_id) {
      await pool.query("UPDATE user SET google_id = ? WHERE user_id = ?", [profile.id, existingUser.user_id]);
    }

    // 4. Manager 白名單 → 升級 role
    if (MANAGER_EMAILS.includes(existingUser.email) && existingUser.role !== 'manager') {
      await pool.query("UPDATE user SET role = 'manager' WHERE user_id = ?", [existingUser.user_id]);
      existingUser.role = 'manager';
    }

    return done(null, existingUser);

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
