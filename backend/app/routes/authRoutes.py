from fastapi import APIRouter, HTTPException, Depends, Header
from bson import ObjectId
from typing import Optional

from app.schemas.userSchema import UserSignupSchema, UserLoginSchema, UserResponseSchema, TokenSchema
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user
from app.database import user_collection

auth_router = APIRouter()

async def get_user_from_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = authorization.replace("Bearer ", "")
    user_id = get_current_user(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

@auth_router.post("/signup", response_model=TokenSchema)
async def signup(user: UserSignupSchema):
    print(f"Signup attempt for email: {user.email}")
    existing = await user_collection.find_one({"email": user.email})
    if existing:
        print(f"Email already registered: {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    print(f"Password hashed successfully for: {user.email}")
    result = await user_collection.insert_one({
        "username": user.username,
        "email": user.email,
        "password": hashed
    })
    print(f"User created with ID: {result.inserted_id}")

    token = create_access_token({"user_id": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer"}

@auth_router.post("/login", response_model=TokenSchema)
async def login(user: UserLoginSchema):
    print(f"Login attempt for email: {user.email}")
    db_user = await user_collection.find_one({"email": user.email})
    if not db_user:
        print(f"User not found for email: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    print(f"User found: {db_user['username']}")
    password_valid = verify_password(user.password, db_user["password"])
    print(f"Password verification result: {password_valid}")
    
    if not password_valid:
        print(f"Invalid password for user: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"user_id": str(db_user["_id"])})
    print(f"Login successful for user: {db_user['username']}")
    return {"access_token": token, "token_type": "bearer"}

@auth_router.get("/me", response_model=UserResponseSchema)
async def get_current_user_info(user_id: str = Depends(get_user_from_token)):
    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"]
    }
