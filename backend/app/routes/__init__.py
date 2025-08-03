# Routes package
from .urlRoutes import url_router
from .authRoutes import auth_router
from .googleAuthRoutes import google_auth_router

__all__ = ["url_router", "auth_router", "google_auth_router"] 