# Лабораторна робота №3. Створення telegram-боту з меню та запитом до AI

Бот на Python (python-telegram-bot 21) з меню: **Студент**, **IT-технології**, **Контакти**, **Prompt AI**.
У режимі «Prompt AI» повідомлення користувача надсилається безкоштовному AI (Groq або Gemini через
OpenAI-сумісний API), відповідь повертається в чат.

| Файл | Призначення |
|---|---|
| `bot.py` | Обробники `/start`, кнопок меню і текстових повідомлень, запуск (long polling) |
| `ai.py` | Запит до AI (Chat Completions API) |
| `config.py` | Налаштування та тексти розділів меню |
| `requirements.txt` | Залежності |
| `.env.example` | Зразок файлу змінних середовища (токени не зберігаються в репозиторії) |

## Локальний запуск

```bash
cd lab3
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env      # вписати TELEGRAM_TOKEN і AI_API_KEY
.venv/bin/python bot.py
```

## Деплой на PythonAnywhere

1. Зареєструватися на https://www.pythonanywhere.com (Beginner, безкоштовно), відкрити **Consoles → Bash**.
2. Завантажити код і встановити залежності:
   ```bash
   git clone https://github.com/kqjqxb/Web-technologies.git
   cd Web-technologies/lab3
   pip3 install --user -r requirements.txt
   cp .env.example .env && nano .env
   ```
   У `.env` вписати токени і `PROXY_URL=http://proxy.server:3128` (безкоштовний акаунт виходить в інтернет
   лише через проксі і лише до сайтів з білого списку; якщо Groq недоступний – `AI_PROVIDER=gemini`).
3. Запустити бота в консолі: `python3 bot.py` (консоль продовжує працювати після закриття вкладки браузера).
