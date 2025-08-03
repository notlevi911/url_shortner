# backend/app/models.py
from pydantic import BaseModel, HttpUrl

class URLRequest(BaseModel):
    long_url: HttpUrl

class URLResponse(BaseModel):
    slug: str
