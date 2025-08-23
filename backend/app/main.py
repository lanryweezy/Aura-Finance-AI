import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import employees, invoices, bills, inventory, purchase_orders, estimates, journal_entries, projects, budgets, connections, transactions, subscriptions, ai

app = FastAPI(title="Aura Finance AI Backend", version="0.1.0")

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
	return {"status": "ok"}

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