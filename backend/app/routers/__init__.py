from .auth import router as auth_router
from .students import router as students_router
from .lessons import router as lessons_router
from .payments import router as payments_router
from .homework import router as homework_router
from .subscription import router as subscription_router

__all__ = [
    "auth_router",
    "students_router",
    "lessons_router",
    "payments_router",
    "homework_router",
    "subscription_router"
]
