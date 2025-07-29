import jwt from 'jsonwebtoken';

// 確保 JWT 令牌存在且有效的中間件
export default function ensureJWT(req, res, next) {
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

// 檢查使用者是否經過身份驗證並具有正確的角色
export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: '未登入' });
  }
  
  export function checkRole(role) {
    return (req, res, next) => {
      console.log('使用者身分:', req.user?.role);
      if (req.user && req.user.role === role) {
        next();
      } else {
        res.status(403).json({ error: '權限不足TEST' });
      }
    };
  }  

