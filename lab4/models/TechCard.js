const { Schema, model } = require('mongoose');

// Варіант 11: технологічна карта – деталь, вид обробки, тривалість обробки
const PROCESSING_TYPES = [
  'Токарна', 'Фрезерна', 'Свердлильна', 'Шліфувальна', 'Термічна', 'Зварювальна', 'Штампування', 'Фарбування',
];

const techCardSchema = new Schema({
  detail: {
    type: String,
    required: [true, 'Вкажіть деталь'],
    trim: true,
    minlength: [2, 'Назва деталі – щонайменше 2 символи'],
    maxlength: [100, 'Назва деталі – не більше 100 символів'],
  },
  processingType: {
    type: String,
    required: [true, 'Вкажіть вид обробки'],
    enum: { values: PROCESSING_TYPES, message: 'Невідомий вид обробки: {VALUE}' },
  },
  // Тривалість обробки, хв
  duration: {
    type: Number,
    required: [true, 'Вкажіть тривалість обробки'],
    min: [1, 'Тривалість – щонайменше 1 хв'],
    max: [10000, 'Тривалість – не більше 10000 хв'],
    validate: { validator: Number.isInteger, message: 'Тривалість – ціле число хвилин' },
  },
}, { timestamps: true, versionKey: false });

module.exports = model('TechCard', techCardSchema);
module.exports.PROCESSING_TYPES = PROCESSING_TYPES;
