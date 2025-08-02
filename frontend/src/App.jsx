import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post("http://localhost:8000/shorten", {
        long_url: url,
      });
      setShortUrl(res.data.short_url);
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
      alert("URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const generateQR = () => {
    setShowQR(true);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">
            <span className="title-icon">🔗</span>
            URL Shortener
          </h1>
          <p className="subtitle">Shorten your long URLs into compact, shareable links</p>
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
            />
            <button 
              type="submit" 
              className="shorten-btn"
              disabled={loading}
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
                <div className="qr-placeholder">
                  <div className="qr-icon">📱</div>
                  <p>QR Code will be generated here</p>
                  <p className="qr-url">{shortUrl}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
