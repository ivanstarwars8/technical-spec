from pydantic import BaseModel, model_validator
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

    @model_validator(mode='after')
    def validate_datetime_range(self):
        if self.datetime_start >= self.datetime_end:
            raise ValueError('datetime_start must be before datetime_end')
        return self


class LessonUpdate(BaseModel):
    student_id: Optional[UUID] = None
    datetime_start: Optional[datetime] = None
    datetime_end: Optional[datetime] = None
    status: Optional[LessonStatus] = None
    payment_status: Optional[PaymentStatus] = None
    amount: Optional[Decimal] = None
    notes: Optional[str] = None

    @model_validator(mode='after')
    def validate_datetime_range(self):
        if self.datetime_start is not None and self.datetime_end is not None:
            if self.datetime_start >= self.datetime_end:
                raise ValueError('datetime_start must be before datetime_end')
        return self


class LessonResponse(BaseModel):
    id: UUID
    user_id: UUID
    student_id: UUID
    datetime_start: datetime
    datetime_end: datetime
    status: LessonStatus
    payment_status: PaymentStatus
    amount: Optional[Decimal]
    remaining_amount: Optional[Decimal] = None
    notes: Optional[str]

    class Config:
        from_attributes = True
