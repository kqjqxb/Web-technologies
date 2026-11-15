"""Pydantic-схеми запитів і відповідей з валідацією полів."""
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ProcessingType(str, Enum):
    turning = "Токарна"
    milling = "Фрезерна"
    drilling = "Свердлильна"
    grinding = "Шліфувальна"
    heat = "Термічна"
    welding = "Зварювальна"
    stamping = "Штампування"
    painting = "Фарбування"


class TechCardBase(BaseModel):
    detail: str = Field(min_length=2, max_length=100, examples=["Вал приводний"], description="Деталь")
    processing_type: ProcessingType = Field(examples=["Токарна"], description="Вид обробки")
    duration: int = Field(ge=1, le=10000, examples=[45], description="Тривалість обробки, хв")


class TechCardCreate(TechCardBase):
    pass


class TechCardUpdate(BaseModel):
    """Часткове оновлення (PATCH): передаються лише змінені поля."""
    detail: str | None = Field(default=None, min_length=2, max_length=100)
    processing_type: ProcessingType | None = None
    duration: int | None = Field(default=None, ge=1, le=10000)


class TechCard(TechCardBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
