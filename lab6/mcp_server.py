"""MCP-сервер для бази технологічних карт (варіант 11). Транспорт stdio, підключення через mcp.json."""
import os
import sqlite3
from pathlib import Path
from typing import Literal

from mcp.server import MCPServer

DB_PATH = Path(os.getenv("TECH_CARDS_DB", Path(__file__).with_name("tech_cards.db")))
FIELDS = ("id", "detail", "processing_type", "duration")

mcp = MCPServer(
    "tech-cards",
    instructions="Інструменти для читання бази технологічних карт: деталь (detail), вид обробки "
                 "(processing_type), тривалість обробки в хвилинах (duration).",
    log_level="WARNING",
)


def connect() -> sqlite3.Connection:
    # База відкривається лише для читання
    con = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    # Вбудований lower() SQLite не змінює регістр кирилиці
    con.create_function("ulower", 1, lambda s: s.lower() if s is not None else None, deterministic=True)
    return con


def query(sql: str, params: tuple = ()) -> str:
    """Результат – готова таблиця Markdown: LLM передає її користувачу без перетворень."""
    with connect() as con:
        rows = con.execute(sql, params).fetchall()
    if not rows:
        return "Записів не знайдено."
    lines = [f"Знайдено записів: {len(rows)}", "",
             "| id | Деталь | Вид обробки | Тривалість, хв |", "|---|---|---|---|"]
    lines += [f"| {r['id']} | {r['detail']} | {r['processing_type']} | {r['duration']} |" for r in rows]
    return "\n".join(lines)


@mcp.tool()
def get_tech_cards() -> str:
    """Отримати всі технологічні карти з бази даних: id, деталь, вид обробки, тривалість обробки (хв)."""
    return query(f"SELECT {', '.join(FIELDS)} FROM tech_cards ORDER BY id")


@mcp.tool()
def sort_tech_cards(
    sort_by: Literal["id", "detail", "processing_type", "duration"] = "duration",
    direction: Literal["asc", "desc"] = "asc",
) -> str:
    """Отримати технологічні карти, відсортовані за полем sort_by.

    Args:
        sort_by: поле сортування: detail – деталь, processing_type – вид обробки,
            duration – тривалість обробки, id – номер запису
        direction: asc – за зростанням, desc – за спаданням
    """
    # Назва стовпця підставляється лише з переліку Literal, тому SQL-ін'єкція неможлива
    order = "DESC" if direction == "desc" else "ASC"
    return query(f"SELECT {', '.join(FIELDS)} FROM tech_cards ORDER BY {sort_by} {order}, id")


@mcp.tool()
def search_tech_cards(
    query_text: str,
    field: Literal["detail", "processing_type"] = "detail",
) -> str:
    """Знайти технологічні карти, у яких поле field містить query_text (без урахування регістру).

    Args:
        query_text: текст для пошуку, наприклад «вал» або «Токарна»
        field: detail – пошук за назвою деталі, processing_type – за видом обробки
    """
    text = query_text.strip().lower()
    if not text:
        return "Порожній запит: вкажіть текст для пошуку."
    pattern = "%" + text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
    return query(f"SELECT {', '.join(FIELDS)} FROM tech_cards WHERE ulower({field}) LIKE ? ESCAPE '\\' "
                 "ORDER BY id", (pattern,))


if __name__ == "__main__":
    if not DB_PATH.exists():
        raise SystemExit(f"Базу {DB_PATH} не знайдено – виконайте python init_db.py")
    mcp.run(transport="stdio")
