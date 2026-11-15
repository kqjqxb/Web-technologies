# Лабораторна робота №2. Створення системи реєстрації та авторизації користувачів ресурсу за допомогою JWT токенів

Node.js + Express + MongoDB (mongoose). Паролі зберігаються як bcrypt-хеші, вхід видає JWT (HS256) з
прізвищем, групою та варіантом у payload і терміном дії 60 + N = 71 с (варіант N = 11). Токен передається в
заголовку `Authorization: Bearer <token>`; ролі USER та ADMIN обмежують доступ до маршрутів.

| Файл | Призначення |
|---|---|
| `index.js` | Запуск сервера, підключення до MongoDB, створення ролей USER/ADMIN |
| `config.js` | Порт, адреса БД, секрет і час життя токена, дані для payload |
| `authRouter.js` | Маршрути `/auth/*` і правила валідації |
| `authController.js` | Реєстрація, вхід (видача JWT), профіль, дії адміністратора |
| `middleware/authMiddleware.js` | Перевірка JWT із заголовка Authorization |
| `middleware/roleMiddleware.js` | Перевірка ролі користувача |
| `models/User.js`, `models/Role.js` | Схеми MongoDB |
| `createAdmin.js` | Створення адміністратора з консолі |
| `apiDemo.js` | Перевірка всіх сценаріїв API (вивід – `results/api_demo.txt`) |
| `public/` | Вебклієнт: реєстрація, вхід, вміст токена, дії USER/ADMIN |

## API

| Метод і шлях | Доступ | Дія |
|---|---|---|
| `POST /auth/registration` | усі | реєстрація (роль USER) |
| `POST /auth/login` | усі | вхід, повертає `{ token, expiresIn }` |
| `GET /auth/profile` | USER, ADMIN | профіль і вміст токена |
| `GET /auth/users` | ADMIN | список користувачів |
| `PATCH /auth/users/:id/roles` | ADMIN | зміна ролей `{ "roles": ["USER", "ADMIN"] }` |
| `DELETE /auth/users/:id` | ADMIN | видалення користувача |

## Запуск

Потрібна MongoDB (локально на `mongodb://127.0.0.1:27017` або інша адреса в змінній `MONGO_URL`).

```bash
cd lab2
npm install
npm run create-admin -- admin admin123
npm start            # http://localhost:5001
node apiDemo.js      # перевірка API (в іншому терміналі)
```
