import logging
import time
import uuid
from typing import Callable
from fastapi import Request, Response, HTTPException
from fastapi.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import traceback
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] - %(message)s',
    handlers=[
        logging.StreamHandler(),
        # In production, add file handler
        # logging.FileHandler('/var/log/aura-finance/app.log')
    ]
)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging and timing"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate unique request ID
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        
        # Add request ID to logging context
        logger = logging.getLogger("request")
        
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request started - {request.method} {request.url.path} - "
            f"Client: {request.client.host if request.client else 'unknown'} - "
            f"User-Agent: {request.headers.get('user-agent', 'unknown')}",
            extra={'request_id': request_id}
        )
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log successful response
            logger.info(
                f"Request completed - {response.status_code} - "
                f"Duration: {process_time:.3f}s",
                extra={'request_id': request_id}
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.3f}"
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log error
            logger.error(
                f"Request failed - {type(e).__name__}: {str(e)} - "
                f"Duration: {process_time:.3f}s",
                extra={'request_id': request_id},
                exc_info=True
            )
            
            # Return structured error response
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "request_id": request_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "type": type(e).__name__
                },
                headers={
                    "X-Request-ID": request_id,
                    "X-Process-Time": f"{process_time:.3f}"
                }
            )

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for centralized error handling"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except HTTPException:
            # Let FastAPI handle HTTP exceptions
            raise
        except ValueError as e:
            # Handle validation errors
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Validation error",
                    "detail": str(e),
                    "request_id": getattr(request.state, 'request_id', 'unknown'),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except PermissionError as e:
            # Handle permission errors
            return JSONResponse(
                status_code=403,
                content={
                    "error": "Permission denied",
                    "detail": str(e),
                    "request_id": getattr(request.state, 'request_id', 'unknown'),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            # Handle unexpected errors
            logger = logging.getLogger("error")
            logger.error(
                f"Unhandled exception: {type(e).__name__}: {str(e)}",
                extra={'request_id': getattr(request.state, 'request_id', 'unknown')},
                exc_info=True
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "detail": "An unexpected error occurred",
                    "request_id": getattr(request.state, 'request_id', 'unknown'),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for adding security headers"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Add HSTS header for HTTPS
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

class RateLimitingMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def __init__(self, app, calls_per_minute: int = 60):
        super().__init__(app)
        self.calls_per_minute = calls_per_minute
        self.clients = {}  # In production, use Redis or similar
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks
        if request.url.path == "/health":
            return await call_next(request)
        
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        if client_ip in self.clients:
            self.clients[client_ip] = [
                timestamp for timestamp in self.clients[client_ip]
                if current_time - timestamp < 60  # Keep last minute
            ]
        else:
            self.clients[client_ip] = []
        
        # Check rate limit
        if len(self.clients[client_ip]) >= self.calls_per_minute:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "detail": f"Maximum {self.calls_per_minute} requests per minute",
                    "retry_after": 60,
                    "timestamp": datetime.utcnow().isoformat()
                },
                headers={"Retry-After": "60"}
            )
        
        # Add current request
        self.clients[client_ip].append(current_time)
        
        return await call_next(request)

# Monitoring utilities
class HealthMonitor:
    """Health monitoring utilities"""
    
    @staticmethod
    async def get_system_health():
        """Get system health metrics"""
        import psutil
        import os
        
        try:
            # System metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Process metrics
            process = psutil.Process(os.getpid())
            process_memory = process.memory_info()
            
            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "system": {
                    "cpu_percent": cpu_percent,
                    "memory": {
                        "total": memory.total,
                        "available": memory.available,
                        "percent": memory.percent
                    },
                    "disk": {
                        "total": disk.total,
                        "free": disk.free,
                        "percent": (disk.used / disk.total) * 100
                    }
                },
                "process": {
                    "memory": {
                        "rss": process_memory.rss,
                        "vms": process_memory.vms
                    },
                    "cpu_percent": process.cpu_percent(),
                    "num_threads": process.num_threads()
                }
            }
        except Exception as e:
            return {
                "status": "degraded",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

# Custom logging formatter with request ID
class RequestIDFormatter(logging.Formatter):
    """Custom formatter that includes request ID"""
    
    def format(self, record):
        if not hasattr(record, 'request_id'):
            record.request_id = 'no-request'
        return super().format(record)