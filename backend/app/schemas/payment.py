from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal
from ..models.payment import PaymentMethod, PaymentStatusEnum


class PaymentCreate(BaseModel):
    student_id: str
    lesson_id: Optional[str] = None
    amount: Decimal
    payment_method: PaymentMethod
    payment_date: date
    status: Optional[PaymentStatusEnum] = PaymentStatusEnum.COMPLETED


class PaymentResponse(BaseModel):
    id: str
    user_id: str
    student_id: str
    lesson_id: Optional[str]
    amount: Decimal
    payment_method: PaymentMethod
    payment_date: date
    status: PaymentStatusEnum

    class Config:
        from_attributes = True


class PaymentStats(BaseModel):
    total_amount: Decimal
    period: str
