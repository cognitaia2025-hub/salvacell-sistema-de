import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware to track request performance metrics"""
    
    def __init__(self, app):
        super().__init__(app)
        self.request_count = 0
        self.total_response_time = 0.0
        self.error_count = 0
    
    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Track response time
            response_time = (time.time() - start_time) * 1000  # Convert to ms
            self.request_count += 1
            self.total_response_time += response_time
            
            # Track errors (4xx and 5xx status codes)
            if response.status_code >= 400:
                self.error_count += 1
            
            # Add performance headers
            response.headers["X-Response-Time"] = f"{response_time:.2f}ms"
            
            return response
            
        except Exception as e:
            # Track exception as error
            self.error_count += 1
            raise e
    
    def get_metrics(self):
        """Get current performance metrics"""
        avg_response_time = (
            self.total_response_time / self.request_count 
            if self.request_count > 0 
            else 0.0
        )
        error_rate = (
            (self.error_count / self.request_count * 100) 
            if self.request_count > 0 
            else 0.0
        )
        
        return {
            "request_count": self.request_count,
            "avg_response_time_ms": round(avg_response_time, 2),
            "error_count": self.error_count,
            "error_rate_percent": round(error_rate, 2),
        }
