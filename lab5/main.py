"""FastAPI-застосунок для бази даних технологічних карт (варіант 11). Запуск: uvicorn main:app --reload"""
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, SessionLocal, engine, get_db

SEED = [
    ("Вал приводний", "Токарна", 45),
    ("Корпус редуктора", "Фрезерна", 120),
    ("Фланець", "Свердлильна", 25),
    ("Шестерня z=32", "Термічна", 180),
    ("Втулка", "Шліфувальна", 30),
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Створення таблиці та початкових даних, якщо база порожня
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(models.TechCard.id).limit(1)) is None:
            db.add_all(models.TechCard(detail=d, processing_type=t, duration=m) for d, t, m in SEED)
            db.commit()
    yield


app = FastAPI(title="Технологічні карти API", version="1.0.0",
              description="ЛР5, варіант 11: деталь, вид обробки, тривалість обробки", lifespan=lifespan)


def get_or_404(db: Session, card_id: int) -> models.TechCard:
    card = db.get(models.TechCard, card_id)
    if card is None:
        raise HTTPException(status_code=404, detail=f"Технологічну карту з id={card_id} не знайдено")
    return card


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def root():
    return "<h2>Технологічні карти API</h2><p>Документація: <a href='/docs'>/docs</a></p>"


@app.get("/cards/", response_model=list[schemas.TechCard], summary="Cards")
def read_cards(
    search: str | None = Query(None, description="Пошук за деталлю"),
    processing_type: schemas.ProcessingType | None = Query(None, description="Фільтр за видом обробки"),
    sort: Literal["id", "detail", "processing_type", "duration"] = "id",
    order: Literal["asc", "desc"] = "asc",
    db: Session = Depends(get_db),
):
    stmt = select(models.TechCard)
    if search:
        stmt = stmt.where(func.ulower(models.TechCard.detail).contains(search.lower(), autoescape=True))
    if processing_type:
        stmt = stmt.where(models.TechCard.processing_type == processing_type.value)
    column = getattr(models.TechCard, sort)
    stmt = stmt.order_by(column.desc() if order == "desc" else column.asc())
    return db.scalars(stmt).all()


@app.post("/cards/", response_model=schemas.TechCard, status_code=201, summary="Create Card")
def create_card(card: schemas.TechCardCreate, db: Session = Depends(get_db)):
    db_card = models.TechCard(**card.model_dump(mode="json"))
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card


@app.get("/card/", response_model=schemas.TechCard, summary="Card")
def read_card(id: int = Query(..., ge=1), db: Session = Depends(get_db)):
    return get_or_404(db, id)


@app.put("/card/{id}", response_model=schemas.TechCard, summary="Replace Card")
def replace_card(id: int, card: schemas.TechCardCreate, db: Session = Depends(get_db)):
    db_card = get_or_404(db, id)
    for field, value in card.model_dump(mode="json").items():
        setattr(db_card, field, value)
    db.commit()
    db.refresh(db_card)
    return db_card


@app.patch("/card/{id}", response_model=schemas.TechCard, summary="Update Card")
def update_card(id: int, card: schemas.TechCardUpdate, db: Session = Depends(get_db)):
    db_card = get_or_404(db, id)
    changes = card.model_dump(mode="json", exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="Не передано жодного поля для оновлення")
    for field, value in changes.items():
        if value is None:
            raise HTTPException(status_code=422, detail=f"Поле {field} не може бути null")
        setattr(db_card, field, value)
    db.commit()
    db.refresh(db_card)
    return db_card


@app.delete("/card/{id}", summary="Delete Card")
def delete_card(id: int, db: Session = Depends(get_db)):
    db_card = get_or_404(db, id)
    result = schemas.TechCard.model_validate(db_card)
    db.delete(db_card)
    db.commit()
    return {"message": "Технологічну карту видалено", "card": result}
