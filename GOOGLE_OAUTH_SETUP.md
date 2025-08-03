# Google OAuth Setup Guide

## Backend Configuration

1. **Update backend/.env file:**
```bash
echo "GOOGLE_CLIENT_ID=your-actual-google-client-id" >> backend/.env
echo "GOOGLE_CLIENT_SECRET=your-actual-google-client-secret" >> backend/.env
```

## Frontend Configuration

1. **Update frontend/.env file:**
```bash
echo "VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id" > frontend/.env
```

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: "Web application"
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:8000/api/v1/auth/google/callback`
5. Copy the Client ID and Client Secret

## Testing

After setting up the credentials:
```bash
docker compose down && docker compose up --build
```

Visit http://localhost:5173 and you should see:
- Regular email/password login form
- Clean separator line
- Google Sign-In button (only if credentials are configured)

## Troubleshooting

- If Google button doesn't appear: Check browser console for "Google Client ID not configured" warning
- If login fails: Check backend logs for authentication errors
- Make sure redirect URIs match exactly in Google Console 