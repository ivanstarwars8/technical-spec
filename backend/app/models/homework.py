from sqlalchemy import Column, String, Integer, Boolean, Enum as SQLEnum, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from ..database import Base


class DifficultyLevel(str, enum.Enum):
    OGE = "oge"
    EGE_BASE = "ege_base"
    EGE_PROFILE = "ege_profile"
    OLYMPIAD = "olympiad"


class AIHomework(Base):
    __tablename__ = "ai_homework"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    # Subject/topic могут содержать расширенный контекст/инструкции генерации,
    # поэтому храним как TEXT, чтобы не ловить "value too long for type varchar".
    subject = Column(Text)
    topic = Column(Text)
    difficulty = Column(SQLEnum(DifficultyLevel))
    tasks_count = Column(Integer)
    generated_tasks = Column(JSONB)
    sent_via_telegram = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = relationship("User", back_populates="ai_homeworks")
    student = relationship("Student", back_populates="ai_homeworks")
