from typing import List
from datetime import date, datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from ..database import get_db
from ..models.user import User
from ..models.payment import Payment
from ..models.student import Student
from ..models.lesson import Lesson, PaymentStatus as LessonPaymentStatus
from ..schemas.payment import PaymentCreate, PaymentResponse, PaymentStats
from ..utils.security import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


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
    # Get all unpaid/partial lessons
    unpaid_lessons = db.query(Lesson, Student).join(
        Student, Lesson.student_id == Student.id
    ).filter(
        and_(
            Lesson.user_id == current_user.id,
            Lesson.payment_status.in_([
                LessonPaymentStatus.UNPAID,
                LessonPaymentStatus.PARTIAL
            ])
        )
    ).all()

    # Group by student
    debtors_dict = {}
    for lesson, student in unpaid_lessons:
        student_id = str(student.id)
        if student_id not in debtors_dict:
            debtors_dict[student_id] = {
                "student_id": student_id,
                "student_name": student.name,
                "total_debt": Decimal("0.00"),
                "unpaid_lessons_count": 0
            }

        debtors_dict[student_id]["total_debt"] += lesson.amount or Decimal("0.00")
        debtors_dict[student_id]["unpaid_lessons_count"] += 1

    return list(debtors_dict.values())
