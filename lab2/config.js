// Налаштування застосунку; секрет і адресу БД можна перевизначити змінними середовища
const VARIANT = 11;

module.exports = {
  PORT: process.env.PORT || 5001, // 5000 на macOS зайнятий AirPlay
  MONGO_URL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/auth_roles',
  JWT_SECRET: process.env.JWT_SECRET || 'lab2-dev-secret-change-me',
  // Час життя токена 60 + N = 71 с
  JWT_EXPIRES_IN: 60 + VARIANT,
  // Дані студента, що записуються в payload токена
  STUDENT: { student: 'Ломакін М.', group: 'ІП-33', variant: VARIANT },
};
