// Frontend configuration
const config = {
  // API Base URL - defaults to localhost for development
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // Frontend URL - defaults to localhost for development
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  
  // API endpoints
  API_ENDPOINTS: {
    SIGNUP: '/api/v1/auth/signup',
    LOGIN: '/api/v1/auth/login',
    ME: '/api/v1/auth/me',
    GOOGLE_TOKEN: '/api/v1/auth/google/token',
    SHORTEN: '/api/v1/shorten',
    MY_URLS: '/api/v1/my-urls',
    DELETE_URL: '/api/v1/delete'
  }
};

export default config; 