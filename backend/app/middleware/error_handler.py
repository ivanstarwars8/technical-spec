"""
Global error handlers for the application.
"""
import logging
import traceback
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTP exceptions."""
    logger.warning(
        f"HTTP {exc.status_code}: {exc.detail} - Path: {request.url.path} - Method: {request.method}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": str(request.url.path)
        },
        headers=getattr(exc, "headers", None)
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors."""
    errors = exc.errors()
    logger.warning(
        f"Validation error: {len(errors)} errors - Path: {request.url.path} - Method: {request.method}"
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "status_code": 422,
            "detail": "Validation error",
            "errors": errors,
            "path": str(request.url.path)
        }
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle SQLAlchemy database errors."""
    logger.error(
        f"Database error: {type(exc).__name__}: {str(exc)} - Path: {request.url.path}",
        exc_info=True
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status_code": 500,
            "detail": "Database error occurred. Please try again later.",
            "path": str(request.url.path)
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all other unhandled exceptions."""
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)} - Path: {request.url.path}",
        exc_info=True
    )
    
    # Don't expose internal error details in production
    error_detail = "An internal server error occurred. Please try again later."
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status_code": 500,
            "detail": error_detail,
            "path": str(request.url.path)
        }
    )
