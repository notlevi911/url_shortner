from pydantic import BaseModel, EmailStr
from bson import ObjectId

class User(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserInDB(User):
    id: ObjectId
