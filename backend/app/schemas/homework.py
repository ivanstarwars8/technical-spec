from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from ..models.homework import DifficultyLevel


class HomeworkGenerate(BaseModel):
    student_id: UUID
    subject: str
    topic: str
    difficulty: DifficultyLevel
    tasks_count: int = 5

    class Config:
        use_enum_values = True


class HomeworkResponse(BaseModel):
    id: UUID
    user_id: UUID
    student_id: UUID
    subject: str
    topic: str
    difficulty: DifficultyLevel
    tasks_count: int
    generated_tasks: Optional[Dict[str, Any]]
    sent_via_telegram: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TaskItem(BaseModel):
    number: int
    text: str
    solution: str
    answer: str
