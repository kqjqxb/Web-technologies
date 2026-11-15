"""Налаштування бота: секрети читаються зі змінних середовища або файлу .env."""
import os

from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
# Безкоштовні AI з OpenAI-сумісним API: groq або gemini
AI_PROVIDERS = {
    "groq": ("https://api.groq.com/openai/v1/chat/completions", "llama-3.3-70b-versatile"),
    "gemini": ("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
               "gemini-2.5-flash"),
}
AI_PROVIDER = os.getenv("AI_PROVIDER", "groq")
AI_URL, _default_model = AI_PROVIDERS[AI_PROVIDER]
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL") or _default_model
PROXY_URL = os.getenv("PROXY_URL") or None

STUDENT_TEXT = "<b>Студент:</b> Ломакін Максим, група ІП-33"
IT_TEXT = (
    "<b>IT-технології:</b>\n"
    "• Front-end: HTML, CSS, JavaScript, React\n"
    "• Back-end: Node.js (Express), Python (FastAPI)\n"
    "• Бази даних: MongoDB, PostgreSQL, SQLite\n"
    "• WEB-технології: REST API, WebSocket, JWT, Telegram Bot API"
)
CONTACTS_TEXT = (
    "<b>Контакти:</b>\n"
    f"тел. {os.getenv('CONTACT_PHONE', '+380 XX XXX XX XX')}\n"
    "e-mail: work.maksym.lomakin@gmail.com"
)
