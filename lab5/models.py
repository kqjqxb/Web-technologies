"""Таблиця технологічних карт (варіант 11): деталь, вид обробки, тривалість обробки."""
from sqlalchemy import CheckConstraint, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class TechCard(Base):
    __tablename__ = "tech_cards"
    __table_args__ = (CheckConstraint("duration BETWEEN 1 AND 10000", name="duration_range"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    detail: Mapped[str] = mapped_column(String(100), nullable=False)
    processing_type: Mapped[str] = mapped_column(String(30), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, nullable=False)  # хвилини
