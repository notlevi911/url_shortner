# backend/app/routes.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from .models import URLRequest, URLResponse
from .database import urls_collection
import uuid

router = APIRouter()

@router.post("/shorten", response_model=URLResponse)
async def shorten_url(payload: URLRequest):
    slug = uuid.uuid4().hex[:6]
    await urls_collection.insert_one({"slug": slug, "long_url": str(payload.long_url)})
    return {"short_url": f"http://localhost:8000/{slug}"}


@router.get("/{slug}")
async def redirect_url(slug: str):
    url_entry = await urls_collection.find_one({"slug": slug})
    if not url_entry:
        raise HTTPException(status_code=404, detail="URL not found")
    return RedirectResponse(url=url_entry["long_url"])
