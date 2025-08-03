from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import RedirectResponse
from app.models import URLRequest, URLResponse
from app.database import urls_collection
from app.utils.auth import get_current_user
import uuid
import os
from dotenv import load_dotenv
from typing import Optional
from datetime import datetime

load_dotenv()

url_router = APIRouter()
redirect_router = APIRouter()

# Get base URL from environment variable, default to localhost for development
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# Test route to verify router is working
@url_router.get("/test")
async def test_route():
    return {"message": "URL router is working"}

async def get_user_from_token(authorization: Optional[str] = Header(None)):
    print(f"Received authorization header: {authorization}")
    if not authorization or not authorization.startswith("Bearer "):
        print("Invalid authorization header format")
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = authorization.replace("Bearer ", "")
    print(f"Extracted token: {token[:20]}...")
    user_id = get_current_user(token)
    if not user_id:
        print("Token verification failed in URL routes")
        raise HTTPException(status_code=401, detail="Invalid token")
    print(f"Token verified successfully for user_id: {user_id}")
    return user_id

@url_router.post("/shorten", response_model=URLResponse)
async def shorten_url(payload: URLRequest, user_id: str = Depends(get_user_from_token)):
    print(f"Shortening URL for user_id: {user_id}")
    slug = uuid.uuid4().hex[:6]
    url_data = {
        "slug": slug, 
        "long_url": str(payload.long_url),
        "user_id": user_id,
        "created_at": datetime.utcnow()
    }
    await urls_collection.insert_one(url_data)
    print(f"URL shortened successfully: {slug}")
    return {"slug": slug}

@url_router.get("/my-urls")
async def get_user_urls(user_id: str = Depends(get_user_from_token)):
    print(f"Fetching URLs for user_id: {user_id}")
    urls = await urls_collection.find({"user_id": user_id}).to_list(length=100)
    print(f"Found {len(urls)} URLs for user")
    return [
        {
            "id": str(url["_id"]),
            "original_url": url["long_url"],
            "slug": url["slug"],
            "created_at": url["created_at"]
        }
        for url in urls
    ]

@url_router.delete("/delete/{url_id}")
async def delete_url(url_id: str, user_id: str = Depends(get_user_from_token)):
    from bson import ObjectId
    result = await urls_collection.delete_one({
        "_id": ObjectId(url_id),
        "user_id": user_id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="URL not found")
    return {"message": "URL deleted successfully"}

# Public redirect route - mounted at root level
@redirect_router.get("/{slug}")
async def redirect_url(slug: str):
    print(f"Attempting to redirect slug: {slug}")
    try:
        url_entry = await urls_collection.find_one({"slug": slug})
        print(f"Database query result: {url_entry}")
        if not url_entry:
            print(f"Slug not found: {slug}")
            raise HTTPException(status_code=404, detail="URL not found")
        print(f"Redirecting to: {url_entry['long_url']}")
        return RedirectResponse(url=url_entry["long_url"])
    except Exception as e:
        print(f"Error in redirect: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") 