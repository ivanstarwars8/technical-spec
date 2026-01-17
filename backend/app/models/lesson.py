from sqlalchemy import Column, String, Text, Enum as SQLEnum, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from ..database import Base


class LessonStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    MISSED = "missed"


class PaymentStatus(str, enum.Enum):
    PAID = "paid"
    UNPAID = "unpaid"
    PARTIAL = "partial"


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    datetime_start = Column(DateTime, nullable=False, index=True)
    datetime_end = Column(DateTime, nullable=False)
    status = Column(
        SQLEnum(LessonStatus),
        default=LessonStatus.SCHEDULED,
        nullable=False
    )
    payment_status = Column(
        SQLEnum(PaymentStatus),
        default=PaymentStatus.UNPAID,
        nullable=False
    )
    amount = Column(Numeric(10, 2))
    notes = Column(Text)

    # Relationships
    user = relationship("User", back_populates="lessons")
    student = relationship("Student", back_populates="lessons")
    payments = relationship("Payment", back_populates="lesson")
