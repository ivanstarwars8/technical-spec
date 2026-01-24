from sqlalchemy import Column, String, Integer, Enum as SQLEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from ..database import Base


class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    subscription_tier = Column(
        SQLEnum(SubscriptionTier),
        default=SubscriptionTier.FREE,
        nullable=False
    )
    ai_credits_left = Column(Integer, default=10, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime)

    # Relationships
    students = relationship("Student", back_populates="user", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    ai_homeworks = relationship("AIHomework", back_populates="user", cascade="all, delete-orphan")
