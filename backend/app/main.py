import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import employees, invoices, bills, inventory, purchase_orders, estimates, journal_entries, projects, budgets, connections, transactions, subscriptions, ai
from .middleware import (
    RequestLoggingMiddleware, 
    ErrorHandlingMiddleware, 
    SecurityHeadersMiddleware, 
    RateLimitingMiddleware,
    HealthMonitor
)

app = FastAPI(
    title="Aura Finance AI Backend", 
    version="0.1.0",
    description="AI-powered financial management platform for Nigerian businesses",
    docs_url="/api/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/api/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# Configure CORS for production
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.onrender.com",
]

# In production, get allowed origins from environment variable
if os.getenv("ENVIRONMENT") == "production":
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        allowed_origins.append(frontend_url)

# Add middleware stack (order matters - last added = first executed)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitingMiddleware, calls_per_minute=120)  # 2 requests per second
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
	from .repository import repository
	repo_health = await repository.health_check()
	system_health = await HealthMonitor.get_system_health()
	
	return {
		"status": "ok",
		"timestamp": repo_health["timestamp"],
		"repository": repo_health,
		"system": system_health,
		"version": "0.1.0",
		"environment": os.getenv("ENVIRONMENT", "development")
	}

@app.get("/api/health/detailed")
async def detailed_health_check():
	"""Detailed health check for monitoring systems"""
	from .repository import repository
	
	repo_health = await repository.health_check()
	system_health = await HealthMonitor.get_system_health()
	
	# Check AI service health
	ai_health = {"status": "unknown"}
	try:
		from .routers.ai import get_ai_client
		client = get_ai_client()
		ai_health = {
			"status": "healthy" if client else "unavailable",
			"api_key_configured": bool(os.getenv("GEMINI_API_KEY"))
		}
	except Exception as e:
		ai_health = {"status": "error", "error": str(e)}
	
	return {
		"overall_status": "healthy" if all([
			repo_health["status"] == "healthy",
			system_health["status"] in ["healthy", "degraded"],
			ai_health["status"] in ["healthy", "unavailable"]
		]) else "unhealthy",
		"timestamp": repo_health["timestamp"],
		"components": {
			"repository": repo_health,
			"system": system_health,
			"ai_service": ai_health
		},
		"version": "0.1.0",
		"environment": os.getenv("ENVIRONMENT", "development"),
		"uptime": system_health.get("process", {}).get("uptime", "unknown")
	}

# Include routers with /api prefix
app.include_router(employees.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(bills.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(purchase_orders.router, prefix="/api")
app.include_router(estimates.router, prefix="/api")
app.include_router(journal_entries.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(budgets.router, prefix="/api")
app.include_router(connections.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")
app.include_router(ai.router, prefix="/api/ai")