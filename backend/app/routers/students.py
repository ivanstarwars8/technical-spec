import random
import string
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, SubscriptionTier
from ..models.student import Student
from ..schemas.student import StudentCreate, StudentUpdate, StudentResponse, TelegramLinkCode
from ..utils.security import get_current_user

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("/", response_model=List[StudentResponse])
def get_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all students for current user"""
    students = db.query(Student).filter(Student.user_id == current_user.id).all()
    return students


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_data: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new student"""
    # Check student limit for FREE tier
    if current_user.subscription_tier == SubscriptionTier.FREE:
        student_count = db.query(Student).filter(Student.user_id == current_user.id).count()
        if student_count >= 5:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free tier limited to 5 students. Please upgrade your subscription."
            )

    new_student = Student(
        user_id=current_user.id,
        **student_data.model_dump()
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get student by ID"""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    return student


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    student_data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update student"""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Update fields
    update_data = student_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete student"""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    db.delete(student)
    db.commit()

    return None


@router.post("/{student_id}/generate-link-code", response_model=TelegramLinkCode)
def generate_telegram_link_code(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate Telegram link code for student"""
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Generate unique 6-digit code with max attempts
    max_attempts = 100
    code = None
    for attempt in range(max_attempts):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        # Check if code is unique
        existing = db.query(Student).filter(Student.telegram_link_code == code).first()
        if not existing:
            break
    
    # If we exhausted all attempts and still have a duplicate, raise error
    if code is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate code. Please try again."
        )
    
    # Double-check uniqueness before saving
    existing_check = db.query(Student).filter(Student.telegram_link_code == code).first()
    if existing_check:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate unique code after {max_attempts} attempts. Please try again."
        )

    student.telegram_link_code = code
    db.commit()
    db.refresh(student)

    return {"link_code": code}
