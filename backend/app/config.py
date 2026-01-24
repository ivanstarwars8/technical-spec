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

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_PROXY: Optional[str] = None

    # Claude (Anthropic)
    CLAUDE_API_KEY: Optional[str] = None
    claude_API_KEY: Optional[str] = None
    # Models
    CLAUDE_SONNET_MODEL: str = "claude-sonnet-4-5-20250929"
    GPT_NANO_MODEL: str = "gpt-5-nano"
    GPT_MINI_MODEL: str = "gpt-5-mini"

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
    def CLAUDE_API_KEY_EFFECTIVE(self) -> Optional[str]:
        return self.CLAUDE_API_KEY or self.claude_API_KEY

    @property
    def AI_ENABLED(self) -> bool:
        return bool(self.OPENAI_API_KEY or self.CLAUDE_API_KEY_EFFECTIVE)

    @property
    def BILLING_ENABLED(self) -> bool:
        return bool(self.YUKASSA_SHOP_ID and self.YUKASSA_SECRET_KEY)


settings = Settings()
