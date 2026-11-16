# Лабораторна робота №6. Робота з LMStudio. Створення MCP-Server та Tools. Робота з БД за допомогою MCP-Server

Варіант 11 – база технологічних карт (деталь, вид обробки, тривалість обробки). MCP-сервер на Python
(SDK `mcp`, транспорт stdio) надає локальній LLM у LM Studio три інструменти для читання SQLite-бази.

| Файл | Призначення |
|---|---|
| `init_db.py` | Створення `tech_cards.db` (таблиця `tech_cards`, як у ЛР5; 10 записів) |
| `mcp_server.py` | MCP-сервер: `get_tech_cards`, `sort_tech_cards`, `search_tech_cards` (база лише для читання) |
| `test_client.py` | Перевірка сервера без LLM: ініціалізація, `tools/list`, виклик інструментів |
| `mcp.json` | Зразок конфігурації для LM Studio |
| `requirements.txt` | Залежності |
| `results/` | Вивід перевірки протоколу, скриншоти LM Studio |

## Запуск

```bash
cd lab6
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python init_db.py
.venv/bin/python test_client.py      # перевірка сервера
```

Підключення до LM Studio: Integrations → Install → Edit mcp.json, додати сервер з `mcp.json`, замінивши
`/шлях/до/` на абсолютний шлях до репозиторію; у чаті ввімкнути інтеграцію `mcp/tech-cards`.
Модель: `qwen/qwen3-1.7b` (підтримує виклик інструментів).
