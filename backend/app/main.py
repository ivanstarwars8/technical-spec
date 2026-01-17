from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# Create tables on startup (for development only)
# In production, use Alembic migrations
@app.on_event("startup")
def startup():
    # Base.metadata.create_all(bind=engine)
    pass
