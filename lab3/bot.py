"""Telegram-бот з меню (Студент, IT-технології, Контакти, Prompt AI) і запитом до AI."""
import logging

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.constants import ChatAction, ParseMode
from telegram.ext import (Application, CallbackQueryHandler, CommandHandler, ContextTypes,
                          MessageHandler, filters)

from ai import ask_ai
from config import CONTACTS_TEXT, IT_TEXT, PROXY_URL, STUDENT_TEXT, TELEGRAM_TOKEN

logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s: %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)

WELCOME = "Вас вітає чат-бот! Виберіть відповідну команду"
PROMPT_HINT = "Напишіть запит до AI одним повідомленням 👇"

MAIN_MENU = InlineKeyboardMarkup([
    [InlineKeyboardButton("Студент", callback_data="student")],
    [InlineKeyboardButton("IT-технології", callback_data="it")],
    [InlineKeyboardButton("Контакти", callback_data="contacts")],
    [InlineKeyboardButton("Prompt AI", callback_data="ai")],
])
BACK = InlineKeyboardMarkup([[InlineKeyboardButton("Назад", callback_data="back")]])
SECTIONS = {"student": STUDENT_TEXT, "it": IT_TEXT, "contacts": CONTACTS_TEXT}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    context.user_data["await_prompt"] = False
    await update.message.reply_text(WELCOME, reply_markup=MAIN_MENU)


async def menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    choice = query.data

    if choice in SECTIONS:
        context.user_data["await_prompt"] = False
        await query.edit_message_text(SECTIONS[choice], parse_mode=ParseMode.HTML, reply_markup=BACK)
    elif choice == "ai":
        context.user_data["await_prompt"] = True
        await query.edit_message_text(f"<b>Prompt AI</b>\n{PROMPT_HINT}", parse_mode=ParseMode.HTML,
                                      reply_markup=BACK)
    else:  # back
        context.user_data["await_prompt"] = False
        await query.edit_message_text(WELCOME, reply_markup=MAIN_MENU)


async def text_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Текст іде до AI лише після вибору пункту «Prompt AI»
    if not context.user_data.get("await_prompt"):
        await update.message.reply_text("Оберіть пункт меню або «Prompt AI», щоб поставити запитання.",
                                        reply_markup=MAIN_MENU)
        return
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action=ChatAction.TYPING)
    answer = await ask_ai(update.message.text)
    await update.message.reply_text(answer)
    await update.message.reply_text(f"Наступний запит або повернення до меню. {PROMPT_HINT}",
                                    reply_markup=BACK)


def build_app() -> Application:
    builder = Application.builder().token(TELEGRAM_TOKEN)
    if PROXY_URL:
        builder = builder.proxy(PROXY_URL).get_updates_proxy(PROXY_URL)
    app = builder.build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(menu))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_message))
    return app


if __name__ == "__main__":
    if not TELEGRAM_TOKEN:
        raise SystemExit("Не задано TELEGRAM_TOKEN (див. .env.example)")
    build_app().run_polling(allowed_updates=Update.ALL_TYPES)
