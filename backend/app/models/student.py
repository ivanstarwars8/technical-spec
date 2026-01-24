from sqlalchemy import Column, String, BigInteger, Text, Enum as SQLEnum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from ..database import Base


class StudentLevel(str, enum.Enum):
    OGE = "oge"
    EGE_BASE = "ege_base"
    EGE_PROFILE = "ege_profile"
    OLYMPIAD = "olympiad"


class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    telegram_id = Column(BigInteger, unique=True, index=True)
    telegram_link_code = Column(String(6), unique=True, index=True)
    parent_name = Column(String(100))
    parent_phone = Column(String(20))
    subject = Column(String(50), nullable=False)
    level = Column(SQLEnum(StudentLevel))
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="students")
    lessons = relationship("Lesson", back_populates="student", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="student", cascade="all, delete-orphan")
    ai_homeworks = relationship("AIHomework", back_populates="student", cascade="all, delete-orphan")
