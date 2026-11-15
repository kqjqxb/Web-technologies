// Початкове заповнення колекції технологічних карт: npm run seed
const mongoose = require('mongoose');
const TechCard = require('./models/TechCard');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tech_cards';

const cards = [
  { detail: 'Вал приводний', processingType: 'Токарна', duration: 45 },
  { detail: 'Корпус редуктора', processingType: 'Фрезерна', duration: 120 },
  { detail: 'Фланець', processingType: 'Свердлильна', duration: 25 },
  { detail: 'Шестерня z=32', processingType: 'Термічна', duration: 180 },
  { detail: 'Втулка', processingType: 'Шліфувальна', duration: 30 },
];

async function main() {
  await mongoose.connect(MONGO_URL);
  await TechCard.deleteMany({});
  for (const card of cards) await TechCard.create(card); // по одному, щоб зберегти порядок createdAt
  console.log(`Додано записів: ${cards.length}`);
  await mongoose.disconnect();
}

main();
