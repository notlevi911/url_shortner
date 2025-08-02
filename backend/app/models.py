from pydantic import BaseModel

class URLRequest(BaseModel):
    original_url: str

class URLResponse(BaseModel):
    short_url: str
