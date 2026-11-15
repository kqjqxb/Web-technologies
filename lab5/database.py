"""Підключення до бази даних SQLite через SQLAlchemy."""
import os
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DB_PATH = Path(os.getenv("TECH_CARDS_DB", Path(__file__).with_name("tech_cards.db")))
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)


@event.listens_for(engine, "connect")
def _register_functions(dbapi_connection, _):
    # Вбудований lower() SQLite працює лише з ASCII; для пошуку кирилицею – Python str.lower
    dbapi_connection.create_function("ulower", 1, lambda s: s.lower() if s is not None else None,
                                     deterministic=True)


class Base(DeclarativeBase):
    pass


def get_db():
    """Залежність FastAPI: сесія БД на час одного запиту."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
