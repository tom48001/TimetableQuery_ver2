import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 帳密登入
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 驗證 email 和 password 是否存在
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "請輸入帳號和密碼" });
    }
  // 驗證 email 格式是否正確
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(401).json({ error: "帳號不存在" });
    }
    // 驗證密碼是否正確
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: '伺服器密鑰未設置，請聯繫管理員' });
    }
    
    const user = users[0];
    const storedPassword = user.password;

    // const hashedPassword = user.hashed_password;
    if (!storedPassword || password !== storedPassword) {
      return res.status(401).json({ error: "密碼錯誤" });
    }
    
    // 驗證成功，生成 JWT token
    const role = user.role ? user.role.trim().toLowerCase() : 'teacher';
    const token = jwt.sign({ id: user.user_id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // 將 token 儲存到 cookie 中
    res.json({ message: '登入成功', user, token });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

// Google 登入
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google 認證回調
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // 認證成功 → 回到前端頁面
    res.redirect('http://localhost:8080/google-redirect');
  }
);

// 拿使用者資料（適用 session 登入者）
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: '未登入' });
  res.json(req.user);
});

// 登出使用者
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: '登出失敗' });
    res.json({ message: '登出成功' });
  });
});

export default router;
