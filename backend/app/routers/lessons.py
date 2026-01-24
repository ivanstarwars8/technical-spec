from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..database import get_db
from ..models.user import User
from ..models.lesson import Lesson
from ..models.student import Student
from ..schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from ..utils.security import get_current_user

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("/", response_model=List[LessonResponse])
def get_lessons(
    student_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lessons with optional filters"""
    query = db.query(Lesson).filter(Lesson.user_id == current_user.id)

    if student_id:
        query = query.filter(Lesson.student_id == student_id)

    if start_date:
        query = query.filter(Lesson.datetime_start >= datetime.combine(start_date, datetime.min.time()))

    if end_date:
        query = query.filter(Lesson.datetime_start <= datetime.combine(end_date, datetime.max.time()))

    lessons = query.order_by(Lesson.datetime_start.desc()).all()
    return lessons


@router.get("/calendar", response_model=List[LessonResponse])
def get_calendar_lessons(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lessons for calendar view"""
    lessons = db.query(Lesson).filter(
        and_(
            Lesson.user_id == current_user.id,
            Lesson.datetime_start >= datetime.combine(start_date, datetime.min.time()),
            Lesson.datetime_start <= datetime.combine(end_date, datetime.max.time())
        )
    ).order_by(Lesson.datetime_start).all()

    return lessons


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
