"""Запит до безкоштовного AI (Groq або Gemini) через OpenAI-сумісний Chat Completions API."""
import httpx

from config import AI_API_KEY, AI_MODEL, AI_URL, PROXY_URL

SYSTEM_PROMPT = ("Ти – помічник у Telegram. Відповідай коротко (до 150 слів) мовою запитання, "
                 "звичайним текстом без Markdown.")
TELEGRAM_LIMIT = 4096


async def ask_ai(prompt: str) -> str:
    if not AI_API_KEY:
        return "AI не налаштовано: відсутній AI_API_KEY."
    payload = {
        "model": AI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 600,
    }
    headers = {"Authorization": f"Bearer {AI_API_KEY}"}
    try:
        async with httpx.AsyncClient(timeout=60, proxy=PROXY_URL) as client:
            response = await client.post(AI_URL, json=payload, headers=headers)
            response.raise_for_status()
            answer = response.json()["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as e:
        return f"Помилка AI: HTTP {e.response.status_code}"
    except (httpx.HTTPError, KeyError, ValueError) as e:
        return f"Помилка з'єднання з AI: {type(e).__name__}"
    return answer[:TELEGRAM_LIMIT]
