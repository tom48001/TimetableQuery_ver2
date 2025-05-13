import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const MANAGER_EMAILS = process.env.MANAGER_EMAILS
? process.env.MANAGER_EMAILS.split(',').map(e => e.trim()): [];

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const role = MANAGER_EMAILS.includes(email) ? 'manager' : 'teacher';

    const [existing] = await pool.query("SELECT * FROM user WHERE google_id = ?", [profile.id]);

    if (existing.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO user (google_id, user_name, email, role) VALUES (?, ?, ?, ?)",
        [profile.id, profile.displayName, email, role]
      );

      const userId = result.insertId;
      await pool.query("INSERT INTO teacher (user_id, teacher_name) VALUES (?, ?)", [userId, profile.displayName]);

      return done(null, { user_id: userId, google_id: profile.id, user_name: profile.displayName, email, role });
    } else {
      const existingUser = existing[0];

      // 若白名單中的是 manager，但 DB 內不是，就更新
      if (MANAGER_EMAILS.includes(existingUser.email) && existingUser.role !== 'manager') {
        await pool.query("UPDATE user SET role = 'manager' WHERE google_id = ?", [profile.id]);
        existingUser.role = 'manager';
      }

      return done(null, existingUser);
    }
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  const [user] = await pool.query("SELECT * FROM user WHERE user_id = ?", [id]);
  done(null, user[0]);
});

export default passport;
