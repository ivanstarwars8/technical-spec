from pydantic import BaseModel
from typing import Optional
from datetime import date
from uuid import UUID
from decimal import Decimal
from ..models.payment import PaymentMethod, PaymentStatusEnum


class PaymentCreate(BaseModel):
    student_id: UUID
    lesson_id: Optional[UUID] = None
    amount: Decimal
    payment_method: PaymentMethod
    payment_date: date
    status: Optional[PaymentStatusEnum] = PaymentStatusEnum.COMPLETED


class PaymentResponse(BaseModel):
    id: UUID
    user_id: UUID
    student_id: UUID
    lesson_id: Optional[UUID]
    amount: Decimal
    payment_method: PaymentMethod
    payment_date: date
    status: PaymentStatusEnum

    class Config:
        from_attributes = True


class PaymentStats(BaseModel):
    total_amount: Decimal
    period: str
