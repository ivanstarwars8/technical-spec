from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple
import asyncio


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware.

    Limits:
    - General: 100 requests per minute per IP
    - Auth endpoints: 5 requests per minute per IP
    - AI homework: 10 requests per minute per IP

    Each endpoint type has independent rate limits.

    Note: For production with multiple workers, consider using Redis for shared state.
    """

    def __init__(self, app):
        super().__init__(app)
        # Format: {ip: [(timestamp, endpoint_type), ...]}
        self.request_history: Dict[str, list] = defaultdict(list)
        # Clean up old entries every 5 minutes
        asyncio.create_task(self._cleanup_task())

    async def _cleanup_task(self):
        """Background task to clean up old request history"""
        while True:
            await asyncio.sleep(300)  # 5 minutes
            cutoff = datetime.now() - timedelta(minutes=5)
            for ip in list(self.request_history.keys()):
                self.request_history[ip] = [
                    (ts, endpoint_type) for ts, endpoint_type in self.request_history[ip]
                    if ts > cutoff
                ]
                if not self.request_history[ip]:
                    del self.request_history[ip]

    def _get_endpoint_type(self, path: str) -> str:
        """
        Determine endpoint type for rate limiting categories.

        Returns: endpoint_type string
        """
        # Auth endpoints: stricter limits
        if "/api/auth/login" in path or "/api/auth/register" in path:
            return "auth"

        # AI homework generation: moderate limits
        if "/api/homework/generate" in path:
            return "ai_homework"

        # Default category
        return "general"

    def _get_rate_limits(self, endpoint_type: str) -> Tuple[int, int]:
        """
        Get rate limit for specific endpoint type.

        Returns: (max_requests, window_seconds)
        """
        limits = {
            "auth": (5, 60),       # 5 per minute
            "ai_homework": (10, 60),  # 10 per minute
            "general": (100, 60)   # 100 per minute
        }
        return limits.get(endpoint_type, (100, 60))

    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # Determine endpoint type
        endpoint_type = self._get_endpoint_type(path)

        # Get rate limits for this endpoint type
        max_requests, window_seconds = self._get_rate_limits(endpoint_type)

        # Clean up old requests (outside the time window)
        cutoff = datetime.now() - timedelta(seconds=window_seconds)
        self.request_history[client_ip] = [
            (ts, ep_type) for ts, ep_type in self.request_history[client_ip]
            if ts > cutoff
        ]

        # Count recent requests ONLY for this endpoint type
        recent_requests = sum(
            1 for ts, ep_type in self.request_history[client_ip]
            if ep_type == endpoint_type
        )

        # Check if rate limit exceeded
        if recent_requests >= max_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds} seconds."
                },
                headers={
                    "Retry-After": str(window_seconds),
                    "X-RateLimit-Limit": str(max_requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int((cutoff + timedelta(seconds=window_seconds)).timestamp()))
                }
            )

        # Record this request with its endpoint type
        self.request_history[client_ip].append((datetime.now(), endpoint_type))

        # Process request
        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Remaining"] = str(max_requests - recent_requests - 1)

        return response
