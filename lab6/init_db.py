"""Створення бази tech_cards.db (структура таблиці tech_cards – як у ЛР5). Запуск: python init_db.py"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("tech_cards.db")

CARDS = [
    ("Вал приводний", "Токарна", 45),
    ("Корпус редуктора", "Фрезерна", 120),
    ("Фланець", "Свердлильна", 25),
    ("Шестерня z=32", "Термічна", 180),
    ("Втулка", "Шліфувальна", 30),
    ("Кронштейн", "Зварювальна", 35),
    ("Кришка підшипника", "Токарна", 40),
    ("Вал-шестерня", "Фрезерна", 95),
    ("Рама", "Фарбування", 60),
    ("Шайба", "Штампування", 5),
]


def main():
    DB_PATH.unlink(missing_ok=True)
    with sqlite3.connect(DB_PATH) as con:
        con.execute("""
            CREATE TABLE tech_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                detail VARCHAR(100) NOT NULL,
                processing_type VARCHAR(30) NOT NULL,
                duration INTEGER NOT NULL,
                CONSTRAINT duration_range CHECK (duration BETWEEN 1 AND 10000)
            )""")
        con.executemany("INSERT INTO tech_cards (detail, processing_type, duration) VALUES (?, ?, ?)", CARDS)
    print(f"Створено {DB_PATH.name}: {len(CARDS)} записів")


if __name__ == "__main__":
    main()
