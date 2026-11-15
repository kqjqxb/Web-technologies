# Лабораторна робота №5. Створення власного API на Python (FastAPI)

Варіант 11 – технологічні карти: деталь, вид обробки, тривалість обробки (хв). FastAPI + SQLAlchemy + SQLite,
валідація через Pydantic, автоматична документація Swagger UI (`/docs`).

| Файл | Призначення |
|---|---|
| `main.py` | Застосунок FastAPI: маршрути CRUD, пошук, фільтр, сортування, початкові дані |
| `database.py` | Підключення до SQLite (файл `tech_cards.db` створюється автоматично) |
| `models.py` | Таблиця `tech_cards` (SQLAlchemy) |
| `schemas.py` | Pydantic-схеми з валідацією полів |
| `tests/test_api.py` | Тести API (pytest) |
| `results/` | Скриншоти Swagger UI, вивід curl і тестів |

## API

| Метод і шлях | Дія |
|---|---|
| `GET /cards/?search=&processing_type=&sort=&order=` | усі записи |
| `POST /cards/` | додавання |
| `GET /card/?id=N` | один запис |
| `PUT /card/{id}` | повна заміна |
| `PATCH /card/{id}` | часткове оновлення |
| `DELETE /card/{id}` | видалення |

## Запуск

```bash
cd lab5
pip install -r requirements.txt
uvicorn main:app --reload     # http://127.0.0.1:8000/docs
pytest -v tests
```
