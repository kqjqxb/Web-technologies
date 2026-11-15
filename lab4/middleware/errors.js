// Невідомий маршрут API
function notFound(req, res) {
  res.status(404).json({ message: `Маршрут ${req.method} ${req.originalUrl} не знайдено` });
}

// Централізована обробка помилок
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Некоректний JSON у тілі запиту' });
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ message: 'Помилка валідації', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Некоректне значення поля ${err.path}` });
  }
  console.error(err);
  return res.status(500).json({ message: 'Внутрішня помилка сервера' });
}

module.exports = { notFound, errorHandler };
