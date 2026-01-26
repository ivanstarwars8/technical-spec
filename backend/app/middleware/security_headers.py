from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, RedirectResponse
from ..config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses.
    Includes HTTPS enforcement and HSTS.
    """

    async def dispatch(self, request: Request, call_next):
        # HTTPS enforcement: redirect HTTP to HTTPS in production
        # Check if we're behind a proxy (X-Forwarded-Proto header)
        forwarded_proto = request.headers.get("X-Forwarded-Proto", "")
        is_https = request.url.scheme == "https" or forwarded_proto == "https"
        
        # Only enforce HTTPS in production (when FRONTEND_URL uses https)
        enforce_https = settings.FRONTEND_URL.startswith("https://")
        
        if enforce_https and not is_https:
            # Redirect to HTTPS
            https_url = str(request.url).replace("http://", "https://", 1)
            return RedirectResponse(url=https_url, status_code=301)

        response: Response = await call_next(request)

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Content Security Policy (basic policy)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'"
        )

        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy (formerly Feature-Policy)
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        # HSTS (HTTP Strict Transport Security) - only for HTTPS
        if is_https or enforce_https:
            # HSTS: max-age=31536000 (1 year), includeSubDomains, preload
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        return response
