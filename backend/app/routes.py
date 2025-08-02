from fastapi import APIRouter
from app.models import URLRequest, URLResponse

router = APIRouter()

@router.post("/shorten", response_model=URLResponse)
async def shorten_url(payload: URLRequest):
    # TODO: store in DB and return short URL
    return {"short_url": "https://sho.rt/abc123"}

@router.get("/expand/{short_code}")
async def expand_url(short_code: str):
    # TODO: fetch original URL from DB
    return {"original_url": "https://example.com"}
