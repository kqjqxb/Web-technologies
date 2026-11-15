# Лабораторна робота №4. REST API на Node.js та Express. CRUD операції в базі даних

Варіант 11 – база даних технологічних карт: деталь, вид обробки, тривалість обробки (хв).
REST API на Express з MongoDB (mongoose): додавання, перегляд усіх та одного запису, редагування, видалення,
валідація даних і централізована обробка помилок. Вебсторінка працює з API через `fetch`.

| Файл | Призначення |
|---|---|
| `app.js` | Сервер Express, підключення до MongoDB, підключення маршрутів і обробника помилок |
| `models/TechCard.js` | Схема технологічної карти з правилами валідації |
| `routes/cards.js` | Маршрути REST API |
| `controllers/cardsController.js` | CRUD-операції, пошук і сортування |
| `middleware/validate.js` | Валідація тіла запиту та id (express-validator) |
| `middleware/errors.js` | 404 для невідомих маршрутів, обробка помилок |
| `seed.js` | Початкові дані |
| `apiDemo.js` | Перевірка API (вивід – `results/api_demo.txt`) |
| `public/` | Вебсторінка: форма, таблиця, пошук, сортування |

## API

| Метод і шлях | Дія | Коди відповіді |
|---|---|---|
| `GET /api/cards?search=&type=&sort=&order=` | усі записи (пошук, фільтр, сортування) | 200 |
| `GET /api/cards/:id` | один запис | 200, 400, 404 |
| `POST /api/cards` | додавання | 201, 400 |
| `PUT /api/cards/:id` | редагування | 200, 400, 404 |
| `DELETE /api/cards/:id` | видалення | 200, 400, 404 |
| `GET /api/processing-types` | список видів обробки | 200 |

## Запуск

Потрібна MongoDB (`mongodb://127.0.0.1:27017` або адреса в змінній `MONGO_URL`).

```bash
cd lab4
npm install
npm run seed
npm start            # http://localhost:3000
node apiDemo.js      # перевірка API (в іншому терміналі)
```
