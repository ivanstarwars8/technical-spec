from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.student import StudentLevel


class StudentCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    subject: str
    level: Optional[StudentLevel] = None
    notes: Optional[str] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[StudentLevel] = None
    notes: Optional[str] = None


class StudentResponse(BaseModel):
    id: str
    user_id: str
    name: str
    phone: Optional[str]
    telegram_id: Optional[int]
    telegram_link_code: Optional[str]
    parent_name: Optional[str]
    parent_phone: Optional[str]
    subject: str
    level: Optional[StudentLevel]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TelegramLinkCode(BaseModel):
    link_code: str
