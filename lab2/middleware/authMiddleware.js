const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Перевіряє токен із заголовка Authorization: Bearer <token>
module.exports = function (req, res, next) {
  if (req.method === 'OPTIONS') return next();

  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Користувач не авторизований: токен відсутній' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    const message = e.name === 'TokenExpiredError'
      ? 'Термін дії токена минув, увійдіть повторно'
      : 'Недійсний токен';
    return res.status(401).json({ message });
  }
};
