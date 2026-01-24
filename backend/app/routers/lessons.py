from typing import List, Optional, Tuple
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from decimal import Decimal
from ..database import get_db
from ..models.user import User
from ..models.lesson import Lesson, PaymentStatus as LessonPaymentStatus
from ..models.student import Student
from ..models.payment import Payment, PaymentStatusEnum as PaymentStatusEnum
from ..schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from ..utils.security import get_current_user

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

def _compute_payment_fields(
    lesson: Lesson,
    paid_amount: Optional[Decimal],
) -> Tuple[LessonPaymentStatus, Optional[Decimal]]:
    """Compute payment_status and remaining_amount for a lesson."""
    if lesson.amount is None:
        return (lesson.payment_status, None)

    amount = Decimal(lesson.amount)
    paid = Decimal(paid_amount or 0)
    remaining = amount - paid
    if remaining <= 0:
        return (LessonPaymentStatus.PAID, Decimal("0.00"))
    if paid <= 0:
        return (LessonPaymentStatus.UNPAID, remaining)
    return (LessonPaymentStatus.PARTIAL, remaining)

def _serialize_lesson(
    lesson: Lesson,
    *,
    payment_status: LessonPaymentStatus,
    remaining_amount: Optional[Decimal],
) -> dict:
    return {
        "id": lesson.id,
        "user_id": lesson.user_id,
        "student_id": lesson.student_id,
        "datetime_start": lesson.datetime_start,
        "datetime_end": lesson.datetime_end,
        "status": lesson.status,
        "payment_status": payment_status,
        "amount": lesson.amount,
        "remaining_amount": remaining_amount,
        "notes": lesson.notes,
    }


@router.get("/", response_model=List[LessonResponse])
def get_lessons(
    student_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lessons with optional filters"""
    paid_amount = func.coalesce(func.sum(Payment.amount), 0).label("paid_amount")
    query = (
        db.query(Lesson, paid_amount)
        .outerjoin(
            Payment,
            and_(
                Payment.lesson_id == Lesson.id,
                Payment.status == PaymentStatusEnum.COMPLETED,
            ),
        )
        .filter(Lesson.user_id == current_user.id)
        .group_by(Lesson.id)
    )

    if student_id:
        query = query.filter(Lesson.student_id == student_id)

    if start_date:
        query = query.filter(
            Lesson.datetime_start >= datetime.combine(start_date, datetime.min.time())
        )

    if end_date:
        query = query.filter(
            Lesson.datetime_start <= datetime.combine(end_date, datetime.max.time())
        )

    rows = query.order_by(Lesson.datetime_start.desc()).all()
    result: list[dict] = []
    for lesson, paid in rows:
        status_value, remaining = _compute_payment_fields(lesson, paid)
        result.append(
            _serialize_lesson(
                lesson,
                payment_status=status_value,
                remaining_amount=remaining,
            )
        )
    return result


@router.get("/calendar", response_model=List[LessonResponse])
def get_calendar_lessons(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lessons for calendar view"""
    paid_amount = func.coalesce(func.sum(Payment.amount), 0).label("paid_amount")
    rows = (
        db.query(Lesson, paid_amount)
        .outerjoin(
            Payment,
            and_(
                Payment.lesson_id == Lesson.id,
                Payment.status == PaymentStatusEnum.COMPLETED,
            ),
        )
        .filter(
            and_(
                Lesson.user_id == current_user.id,
                Lesson.datetime_start >= datetime.combine(start_date, datetime.min.time()),
                Lesson.datetime_start <= datetime.combine(end_date, datetime.max.time()),
            )
        )
        .group_by(Lesson.id)
        .order_by(Lesson.datetime_start)
        .all()
    )

    result: list[dict] = []
    for lesson, paid in rows:
        status_value, remaining = _compute_payment_fields(lesson, paid)
        result.append(
            _serialize_lesson(
                lesson,
                payment_status=status_value,
                remaining_amount=remaining,
            )
        )
    return result


@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
def create_lesson(
    lesson_data: LessonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new lesson"""
    # Verify student belongs to user
    student = db.query(Student).filter(
        Student.id == lesson_data.student_id,
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    new_lesson = Lesson(
        user_id=current_user.id,
        **lesson_data.model_dump()
    )

    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)

    return new_lesson


@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lesson by ID"""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.user_id == current_user.id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    return lesson


@router.put("/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: str,
    lesson_data: LessonUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update lesson"""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.user_id == current_user.id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    # Update fields
    update_data = lesson_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lesson, field, value)

    # Validate datetime range after update
    if lesson.datetime_start >= lesson.datetime_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="datetime_start must be before datetime_end"
        )

    db.commit()
    db.refresh(lesson)

    return lesson


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete lesson"""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.user_id == current_user.id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    db.delete(lesson)
    db.commit()

    return None
