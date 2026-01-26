from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .middleware import SecurityHeadersMiddleware, RateLimitMiddleware
from .routers import (
    auth_router,
    students_router,
    lessons_router,
    payments_router,
    homework_router,
    subscription_router
)

# Create FastAPI app
app = FastAPI(
    title="TutorAI CRM API",
    description="API for TutorAI CRM - AI-powered homework generator for tutors",
    version="1.0.0"
)

# Configure CORS
_cors_origins = list(settings.CORS_ORIGINS)
if settings.CORS_ORIGINS_EXTRA:
    _cors_origins += [x.strip() for x in settings.CORS_ORIGINS_EXTRA.split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Add security headers
app.add_middleware(SecurityHeadersMiddleware)

# Add rate limiting
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(lessons_router)
app.include_router(payments_router)
app.include_router(homework_router)
app.include_router(subscription_router)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "TutorAI CRM API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/api/features")
def get_features():
    """Feature flags for optional integrations"""
    return {
        "ai_homework": settings.AI_ENABLED,
        "billing": settings.BILLING_ENABLED,
        "ai_homework_reason": None if settings.AI_ENABLED else "AI ключи не заданы (OPENAI_API_KEY / claude_API_KEY)",
        "billing_reason": None if settings.BILLING_ENABLED else "YUKASSA_SHOP_ID/YUKASSA_SECRET_KEY не заданы",
        "ai_providers": {
            "gpt": bool(settings.OPENAI_API_KEY),
            "claude": bool(settings.CLAUDE_API_KEY_EFFECTIVE),
        },
        "ai_proxy_enabled": bool(settings.OPENAI_PROXY),
    }


# Create tables on startup (for development only)
# In production, use Alembic migrations
@app.on_event("startup")
def startup():
    # Base.metadata.create_all(bind=engine)
    pass
