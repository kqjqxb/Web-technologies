const authMiddleware = require('./authMiddleware');

// Пропускає запит, лише якщо в токені є хоча б одна з дозволених ролей
module.exports = function (allowedRoles) {
  return [authMiddleware, (req, res, next) => {
    const hasRole = (req.user.roles || []).some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: `Доступ заборонено: потрібна роль ${allowedRoles.join(' або ')}` });
    }
    next();
  }];
};
