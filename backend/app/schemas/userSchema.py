from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignupSchema(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserResponseSchema(BaseModel):
    id: str
    username: str
    email: EmailStr

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
