import { useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import AuthForm from "./components/AuthForm";
import UserDashboard from "./components/UserDashboard";
import QRCode from "qrcode";
import "./App.css";

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!isAuthenticated) {
      setError("Please login to shorten URLs");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post("http://localhost:8000/api/v1/shorten", {
        long_url: url,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShortUrl(res.data.short_url);
      setUrl(""); // Clear input after successful shortening
    } catch (err) {
      setError("Failed to shorten URL. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      // Show a temporary success message instead of alert
      const copyBtn = document.querySelector('.copy-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      copyBtn.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '';
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const generateQR = async () => {
    try {
      const qrDataURL = await QRCode.toDataURL(shortUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeData(qrDataURL);
      setShowQR(true);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  return (
    <div className="app">
      {/* Header with user info */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">
            <span className="title-icon">🔗</span>
            URL Shortener
          </h1>
        </div>
        <div className="header-right">
          {isAuthenticated ? (
            <div className="user-section">
              <span className="user-name">Welcome, {user?.username || user?.email}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-prompt">
              <span>Please login to shorten URLs</span>
            </div>
          )}
        </div>
      </header>

      <div className="main-container">
        {/* Left Side - URL Shortener */}
        <div className="shortener-section">
          <div className="container">
            <header className="header">
              <h2 className="section-title">Shorten Your URLs</h2>
              <p className="subtitle">Create compact, shareable links instantly</p>
            </header>

            <form onSubmit={handleSubmit} className="url-form">
              <div className="input-group">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your long URL (e.g., https://example.com)"
                  className="url-input"
                  required
                  disabled={!isAuthenticated}
                />
                <button 
                  type="submit" 
                  className="shorten-btn"
                  disabled={loading || !isAuthenticated}
                >
                  {loading ? "Shortening..." : "Shorten URL"}
                </button>
              </div>
              
              {error && <div className="error-message">{error}</div>}
            </form>

            {shortUrl && (
              <div className="result-section">
                <h3 className="result-title">Your Shortened URL</h3>
                <div className="short-url-container">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="short-url-input"
                  />
                  <div className="action-buttons">
                    <button 
                      onClick={copyToClipboard}
                      className="copy-btn"
                    >
                      📋 Copy
                    </button>
                    <button 
                      onClick={generateQR}
                      className="qr-btn"
                    >
                      📱 QR Code
                    </button>
                  </div>
                </div>
                <div className="url-info">
                  <p>✅ URL successfully shortened!</p>
                  <p>Click the short URL to test the redirect</p>
                </div>
              </div>
            )}

            {/* QR Code Modal */}
            {showQR && (
              <div className="modal-overlay" onClick={() => setShowQR(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>QR Code</h3>
                    <button 
                      className="close-btn"
                      onClick={() => setShowQR(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="qr-container">
                    {qrCodeData ? (
                      <div className="qr-code-display">
                        <img src={qrCodeData} alt="QR Code" className="qr-image" />
                        <p className="qr-url">{shortUrl}</p>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = 'qr-code.png';
                            link.href = qrCodeData;
                            link.click();
                          }}
                          className="download-qr-btn"
                        >
                          📥 Download QR Code
                        </button>
                      </div>
                    ) : (
                      <div className="qr-placeholder">
                        <div className="qr-icon">📱</div>
                        <p>Generating QR Code...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Auth or Dashboard */}
        <div className="right-section">
          {isAuthenticated ? (
            <div className="dashboard-section">
              <div className="dashboard-header">
                <h3>Your Dashboard</h3>
                <button 
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="toggle-dashboard-btn"
                >
                  {showDashboard ? 'Hide' : 'Show'} My URLs
                </button>
              </div>
              {showDashboard && <UserDashboard />}
            </div>
          ) : (
            <AuthForm />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
