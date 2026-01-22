from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from uuid import UUID
from decimal import Decimal
from ..models.lesson import LessonStatus, PaymentStatus


class LessonCreate(BaseModel):
    student_id: UUID
    datetime_start: datetime
    datetime_end: datetime
    status: Optional[LessonStatus] = LessonStatus.SCHEDULED
    payment_status: Optional[PaymentStatus] = PaymentStatus.UNPAID
    amount: Optional[Decimal] = None
    notes: Optional[str] = None


class LessonUpdate(BaseModel):
    student_id: Optional[UUID] = None
    datetime_start: Optional[datetime] = None
    datetime_end: Optional[datetime] = None
    status: Optional[LessonStatus] = None
    payment_status: Optional[PaymentStatus] = None
    amount: Optional[Decimal] = None
    notes: Optional[str] = None


class LessonResponse(BaseModel):
    id: UUID
    user_id: UUID
    student_id: UUID
    datetime_start: datetime
    datetime_end: datetime
    status: LessonStatus
    payment_status: PaymentStatus
    amount: Optional[Decimal]
    notes: Optional[str]

    class Config:
        from_attributes = True
