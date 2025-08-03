from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from fastapi import HTTPException
import httpx
from app.database import user_collection
from app.utils.auth import create_access_token
from bson import ObjectId

# Google OAuth configuration hahah lmao 
config = Config('.env')
oauth = OAuth(config)

CONF_URL = 'https://accounts.google.com/.well-known/openid_configuration'
oauth.register(
    name='google',
    server_metadata_url=CONF_URL,
    client_kwargs={
        'scope': 'openid email profile'
    }
)

async def get_google_user_info(token):
    """Get user info from Google using access token"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")

async def create_or_get_google_user(google_user_info):
    """Create or get user from Google OAuth info"""
    email = google_user_info.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")
    
    # Check if user already exists
    existing_user = await user_collection.find_one({"email": email})
    
    if existing_user:
        # User exists, return existing user
        return existing_user
    
    # Create new user
    user_data = {
        "username": google_user_info.get('name', email.split('@')[0]),
        "email": email,
        "google_id": google_user_info.get('id'),
        "profile_picture": google_user_info.get('picture'),
        "auth_provider": "google"
    }
    
    result = await user_collection.insert_one(user_data)
    user_data['_id'] = result.inserted_id
    return user_data

async def generate_google_token(user_data):
    """Generate JWT token for Google user"""
    token_data = {"user_id": str(user_data["_id"])}
    return create_access_token(token_data) 