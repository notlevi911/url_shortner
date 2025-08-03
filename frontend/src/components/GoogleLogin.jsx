import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const GoogleLogin = () => {
  const { loginWithGoogle } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Don't initialize if no client ID is provided
    if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.warn('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
      return;
    }

    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-login-button'),
          { 
            theme: 'outline', 
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: '100%'
          }
        );
      }
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [googleClientId]);

  const handleCredentialResponse = async (response) => {
    try {
      const result = await loginWithGoogle(response.credential);
      if (!result.success) {
        console.error('Google login failed:', result.error);
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Don't render if no client ID is configured
  if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    return null;
  }

  return (
    <div className="google-login-container">
      <div id="google-login-button"></div>
    </div>
  );
};

export default GoogleLogin; 