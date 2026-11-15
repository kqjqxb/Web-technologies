const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const cardsRouter = require('./routes/cards');
const { notFound, errorHandler } = require('./middleware/errors');

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tech_cards';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', cardsRouter);
app.use('/api', notFound);
app.use(errorHandler);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('Підключено до MongoDB');
    app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Помилка підключення до MongoDB:', error.message);
    process.exit(1);
  });
