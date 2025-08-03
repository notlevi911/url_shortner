# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import url_router, auth_router, google_auth_router
from app.routes.urlRoutes import redirect_router
from app.database import test_connection
import asyncio
from datetime import datetime

app = FastAPI(title="URL Shortener API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(redirect_router)  # Mount at root for clean URLs
app.include_router(url_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(google_auth_router, prefix="/api/v1/auth/google", tags=["google-auth"])

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        connection_ok = await test_connection()
        if connection_ok:
            return {
                "status": "healthy",
                "message": "URL Shortener API is running",
                "database": "connected",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "status": "unhealthy",
                "message": "Database connection failed",
                "database": "disconnected",
                "timestamp": datetime.utcnow().isoformat()
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": f"Health check failed: {str(e)}",
            "database": "error",
            "timestamp": datetime.utcnow().isoformat()
        }

@app.on_event("startup")
async def startup_event():
    print("Starting up URL Shortener API...")
    # Test MongoDB connection
    connection_ok = await test_connection()
    if connection_ok:
        print("✅ MongoDB connection successful")
    else:
        print("❌ MongoDB connection failed")