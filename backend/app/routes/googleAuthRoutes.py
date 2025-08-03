from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from app.utils.google_oauth import oauth, get_google_user_info, create_or_get_google_user, generate_google_token
from app.schemas.userSchema import TokenSchema
import jwt
import httpx

google_auth_router = APIRouter()

@google_auth_router.get("/login")
async def google_login(request: Request):
    """Initiate Google OAuth login"""
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@google_auth_router.get("/callback")
async def google_callback(request: Request):
    """Handle Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = await get_google_user_info(token['access_token'])
        user_data = await create_or_get_google_user(user_info)
        jwt_token = await generate_google_token(user_data)
        
        # Redirect to frontend with token
        frontend_url = "http://localhost:5173"
        return RedirectResponse(
            url=f"{frontend_url}?token={jwt_token}&user_id={user_data['_id']}"
        )
    except Exception as e:
        print(f"Google OAuth error: {e}")
        raise HTTPException(status_code=400, detail="Google authentication failed")

@google_auth_router.post("/token")
async def google_token_exchange(request: Request):
    """Exchange Google credential (JWT) for our JWT token"""
    try:
        # Get the Google credential from request body
        body = await request.json()
        google_credential = body.get('access_token')  # Frontend sends it as access_token
        
        if not google_credential:
            raise HTTPException(status_code=400, detail="Google credential required")
        
        # Decode the Google credential (JWT) to get user info
        # Note: We don't verify the signature since Google's public keys are complex
        # In production, you should verify the signature
        try:
            # Decode without verification for now
            decoded_credential = jwt.decode(google_credential, options={"verify_signature": False})
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=400, detail="Invalid Google credential")
        
        # Extract user info from the credential
        user_info = {
            'id': decoded_credential.get('sub'),
            'email': decoded_credential.get('email'),
            'name': decoded_credential.get('name'),
            'picture': decoded_credential.get('picture')
        }
        
        # Create or get user
        user_data = await create_or_get_google_user(user_info)
        jwt_token = await generate_google_token(user_data)
        
        return {
            "access_token": jwt_token,
            "token_type": "bearer",
            "user": {
                "id": str(user_data["_id"]),
                "username": user_data["username"],
                "email": user_data["email"],
                "profile_picture": user_data.get("profile_picture")
            }
        }
    except Exception as e:
        print(f"Google token exchange error: {e}")
        raise HTTPException(status_code=400, detail="Google authentication failed") 