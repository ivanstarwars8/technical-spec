from typing import List
from datetime import date, datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract, case
from ..database import get_db
from ..models.user import User
from ..models.payment import Payment, PaymentStatusEnum
from ..models.student import Student
from ..models.lesson import Lesson, PaymentStatus as LessonPaymentStatus
from ..schemas.payment import PaymentCreate, PaymentResponse, PaymentStats
from ..utils.security import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])

def _recalculate_lesson_payment_status(db: Session, lesson: Lesson) -> None:
    """Persist recalculated lesson.payment_status based on completed payments."""
    if lesson.amount is None:
        lesson.payment_status = LessonPaymentStatus.UNPAID
        return

    paid = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
        Payment.lesson_id == lesson.id,
        Payment.status == PaymentStatusEnum.COMPLETED,
    ).scalar()
    paid = Decimal(paid or 0)
    amount = Decimal(lesson.amount)
    remaining = amount - paid

    if remaining <= 0:
        lesson.payment_status = LessonPaymentStatus.PAID
    elif paid <= 0:
        lesson.payment_status = LessonPaymentStatus.UNPAID
    else:
        lesson.payment_status = LessonPaymentStatus.PARTIAL


@router.get("/", response_model=List[PaymentResponse])
def get_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all payments for current user"""
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.payment_date.desc()).all()

    return payments


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new payment"""
    # Verify student belongs to user
    student = db.query(Student).filter(
        Student.id == payment_data.student_id,
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    lesson = None
    # If lesson_id provided, verify it belongs to user
    if payment_data.lesson_id:
        lesson = db.query(Lesson).filter(
            Lesson.id == payment_data.lesson_id,
            Lesson.user_id == current_user.id
        ).first()

        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )

    new_payment = Payment(
        user_id=current_user.id,
        **payment_data.model_dump()
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    # If payment is tied to a lesson, update lesson payment status
    if lesson is not None:
        _recalculate_lesson_payment_status(db, lesson)
        db.commit()

    return new_payment


@router.get("/stats", response_model=PaymentStats)
def get_payment_stats(
    month: int = None,
    year: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment statistics for a specific month/year"""
    if not month or not year:
        now = datetime.now()
        month = now.month
        year = now.year

    total = db.query(func.sum(Payment.amount)).filter(
        and_(
            Payment.user_id == current_user.id,
            extract('month', Payment.payment_date) == month,
            extract('year', Payment.payment_date) == year
        )
    ).scalar()

    return {
        "total_amount": total or Decimal("0.00"),
        "period": f"{year}-{month:02d}"
    }


@router.get("/debtors", response_model=List[dict])
def get_debtors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of students with unpaid lessons"""
    # Compute remaining per lesson (amount - sum(completed payments)), ignore lessons without amount
    paid_amount = func.coalesce(func.sum(Payment.amount), 0).label("paid_amount")
    remaining = func.greatest((Lesson.amount - paid_amount), 0).label("remaining_amount")

    per_lesson = (
        db.query(
            Lesson.student_id.label("student_id"),
            remaining,
        )
        .outerjoin(
            Payment,
            and_(
                Payment.lesson_id == Lesson.id,
                Payment.status == PaymentStatusEnum.COMPLETED,
            ),
        )
        .filter(
            Lesson.user_id == current_user.id,
            Lesson.amount.isnot(None),
        )
        .group_by(Lesson.id)
        .subquery()
    )

    unpaid_count = func.sum(
        case(
            (per_lesson.c.remaining_amount > 0, 1),
            else_=0,
        )
    ).label("unpaid_lessons_count")

    rows = (
        db.query(
            Student.id.label("student_id"),
            Student.name.label("student_name"),
            func.coalesce(func.sum(per_lesson.c.remaining_amount), 0).label("total_debt"),
            unpaid_count,
        )
        .join(per_lesson, per_lesson.c.student_id == Student.id)
        .filter(Student.user_id == current_user.id)
        .group_by(Student.id, Student.name)
        .having(func.sum(per_lesson.c.remaining_amount) > 0)
        .all()
    )

    return [
        {
            "student_id": str(row.student_id),
            "student_name": row.student_name,
            "total_debt": row.total_debt,
            "unpaid_lessons_count": int(row.unpaid_lessons_count or 0),
        }
        for row in rows
    ]
