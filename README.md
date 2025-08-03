# URL Shortener

A full-stack URL shortening application built with FastAPI backend and React frontend. This project implements custom URL shortening logic without relying on external APIs.

## Features

- Custom URL shortening algorithm
- User authentication with JWT tokens
- Google OAuth integration
- User dashboard to manage shortened URLs
- QR code generation for shortened URLs
- Responsive design for desktop and mobile

## Tech Stack

### Backend
- **FastAPI** - Web framework
- **MongoDB** - Database with Motor async driver
- **JWT** - Authentication tokens
- **Google OAuth** - Social login
- **Python** - Core language

### Frontend
- **React** - Frontend framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **QRCode** - QR code generation
- **CSS** - Styling

## Architecture

### URL Shortening Logic

The application uses a custom shortening algorithm:

1. **Slug Generation**: Creates a 6-character hexadecimal slug using UUID
2. **Database Storage**: Stores original URL, slug, user ID, and timestamp
3. **Redirect Logic**: Matches slug to original URL and performs redirect
4. **User Management**: Links shortened URLs to authenticated users

### Authentication Flow

1. **Registration**: Users create accounts with email/password
2. **Login**: JWT token-based authentication
3. **Google OAuth**: Alternative login method
4. **Token Validation**: Secure API access with Bearer tokens

### API Endpoints

#### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/google/token` - Google OAuth

#### URL Management
- `POST /api/v1/shorten` - Create shortened URL
- `GET /api/v1/my-urls` - Get user's URLs
- `DELETE /api/v1/delete/{url_id}` - Delete URL
- `GET /{slug}` - Redirect to original URL

#### Health Check
- `GET /api/v1/test` - Service health check (supports HEAD requests)

## Development Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Input validation with Pydantic
- MongoDB injection protection

## Custom Implementation Details

- **URL Shortening**: Custom algorithm using UUID-based slugs
- **Database**: Direct MongoDB integration without ORM
- **Authentication**: Custom JWT implementation
- **Frontend State**: React Context for user management
- **Error Handling**: Comprehensive error responses
- **Health Monitoring**: Custom health check endpoints

## License

Personal project - not for commercial use.
