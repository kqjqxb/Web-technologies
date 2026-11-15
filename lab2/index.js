const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const authRouter = require('./authRouter');
const Role = require('./models/Role');
const { PORT, MONGO_URL } = require('./config');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/auth', authRouter);

// Некоректний JSON у тілі запиту
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Некоректний JSON' });
  next(err);
});

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    // Ролі створюються один раз, якщо колекція порожня
    for (const value of ['USER', 'ADMIN']) {
      await Role.updateOne({ value }, { value }, { upsert: true });
    }
    app.listen(PORT, () => console.log(`Сервер запущено: http://localhost:${PORT}`));
  } catch (e) {
    console.error('Не вдалося підключитися до MongoDB:', e.message);
    process.exit(1);
  }
}

start();
