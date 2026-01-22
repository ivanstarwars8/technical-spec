from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import DataError, SQLAlchemyError
from ..database import get_db
from ..models.user import User
from ..models.student import Student
from ..models.homework import AIHomework
from ..schemas.homework import HomeworkGenerate, HomeworkResponse
from ..utils.security import get_current_user
from ..services.ai_generator import generate_homework, test_connection
from ..config import settings

router = APIRouter(prefix="/api/homework", tags=["homework"])


@router.post("/generate", response_model=HomeworkResponse, status_code=status.HTTP_201_CREATED)
def generate_homework_tasks(
    homework_data: HomeworkGenerate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate homework tasks using AI"""
    if not settings.AI_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI генератор отключен. Укажите OPENAI_API_KEY в .env",
        )

    def required_credits(tasks_count: int) -> int:
        if tasks_count <= 5:
            return 1
        return (tasks_count + 4) // 5

    credits_needed = required_credits(homework_data.tasks_count)

    # Check AI credits
    if current_user.ai_credits_left < credits_needed:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Not enough AI credits. Please upgrade your subscription."
        )

    # Verify student belongs to user
    student = db.query(Student).filter(
        Student.id == homework_data.student_id,
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Validate tasks count
    if homework_data.tasks_count < 3 or homework_data.tasks_count > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tasks count must be between 3 and 10"
        )

    try:
        # Generate homework using AI
        level_value = homework_data.difficulty
        if hasattr(level_value, "value"):
            level_value = level_value.value

        generated_tasks = generate_homework(
            subject=homework_data.subject,
            topic=homework_data.topic,
            level=level_value,
            tasks_count=homework_data.tasks_count
        )

        # Create homework record
        new_homework = AIHomework(
            user_id=current_user.id,
            student_id=homework_data.student_id,
            subject=homework_data.subject,
            topic=homework_data.topic,
            difficulty=homework_data.difficulty,
            tasks_count=homework_data.tasks_count,
            generated_tasks=generated_tasks,
            sent_via_telegram=False
        )

        db.add(new_homework)

        # Deduct AI credits
        current_user.ai_credits_left -= credits_needed

        db.commit()
        db.refresh(new_homework)

        return new_homework

    except DataError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Слишком длинный текст в теме/предмете. Сократите или уберите лишний контекст."
        )
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка базы данных при сохранении задания."
        )


@router.get("/test")
def test_ai_connection(current_user: User = Depends(get_current_user)):
    """Test OpenAI connection"""
    if not settings.AI_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI генератор отключен. Укажите OPENAI_API_KEY в .env",
        )
    try:
        return test_connection()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/", response_model=List[HomeworkResponse])
def get_homework_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get homework generation history"""
    homeworks = db.query(AIHomework).filter(
        AIHomework.user_id == current_user.id
    ).order_by(AIHomework.created_at.desc()).all()

    return homeworks


@router.get("/{homework_id}", response_model=HomeworkResponse)
def get_homework(
    homework_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific homework by ID"""
    homework = db.query(AIHomework).filter(
        AIHomework.id == homework_id,
        AIHomework.user_id == current_user.id
    ).first()

    if not homework:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Homework not found"
        )

    return homework
