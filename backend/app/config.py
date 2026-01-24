from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/tutor_crm"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI Models
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_PROXY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_AI_MODEL: str = "gpt-4o-mini"  # или "claude-3-5-sonnet-20241022"

    # YooKassa
    YUKASSA_SHOP_ID: Optional[str] = None
    YUKASSA_SECRET_KEY: Optional[str] = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator('SECRET_KEY')
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        weak_keys = [
            "your-secret-key-change-in-production",
            "secret",
            "secret-key",
            "change-me",
            "changeme",
            "dev",
            "development"
        ]
        if v.lower() in weak_keys or len(v) < 32:
            logger.critical(
                "⚠️  SECURITY WARNING: Weak SECRET_KEY detected! "
                "Generate a strong key with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
            )
            if v == "your-secret-key-change-in-production":
                raise ValueError(
                    "SECRET_KEY must be changed from default value! "
                    "Generate a strong key with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
                )
        return v

    @property
    def AI_ENABLED(self) -> bool:
        return bool(self.OPENAI_API_KEY or self.ANTHROPIC_API_KEY)

    @property
    def BILLING_ENABLED(self) -> bool:
        return bool(self.YUKASSA_SHOP_ID and self.YUKASSA_SECRET_KEY)


settings = Settings()
