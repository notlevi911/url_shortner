import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import QRCode from 'qrcode';
import config from '../config';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("");

  useEffect(() => {
    if (user && token) {
      console.log('Fetching URLs for user:', user.username, 'with token:', token ? 'present' : 'missing');
      fetchUserUrls();
    } else {
      console.log('No user or token available:', { user: !!user, token: !!token });
      setLoading(false);
    }
  }, [user, token]);

  const fetchUserUrls = async () => {
    try {
      console.log('Making request to fetch URLs with token:', token ? 'present' : 'missing');
      const response = await axios.get(`${config.API_BASE_URL}${config.API_ENDPOINTS.MY_URLS}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('URLs fetched successfully:', response.data);
      setUrls(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      setError('Failed to load URLs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (url, event) => {
    try {
      await navigator.clipboard.writeText(url);
      // Show a temporary success message instead of alert
      const copyBtn = event.target;
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      copyBtn.style.backgroundColor = '#4CAF50';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateQR = async (url) => {
    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeData(qrDataURL);
      setSelectedUrl(url);
      setShowQR(true);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  const deleteUrl = async (urlId) => {
    try {
      await axios.delete(`${config.API_BASE_URL}${config.API_ENDPOINTS.DELETE_URL}/${urlId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUrls(urls.filter(url => url.id !== urlId));
    } catch (error) {
      console.error('Failed to delete URL:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Loading your URLs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <p>Error: {error}</p>
          <button onClick={fetchUserUrls} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h3 className="dashboard-title">Your Shortened URLs</h3>
      
      {urls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <p>No URLs shortened yet</p>
          <p>Start shortening URLs to see them here!</p>
        </div>
      ) : (
        <div className="urls-list">
          {urls.map((url) => (
            <div key={url.id} className="url-item">
              <div className="url-info">
                <div className="url-original">
                  <strong>Original:</strong> {url.original_url}
                </div>
                <div className="url-short">
                  <strong>Short:</strong> {`${config.API_BASE_URL}/${url.slug}`}
                </div>
                <div className="url-date">
                  Created: {new Date(url.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="url-actions">
                <button 
                  onClick={(event) => copyToClipboard(`${config.API_BASE_URL}/${url.slug}`, event)}
                  className="copy-btn-small"
                >
                  📋 Copy
                </button>
                <button 
                  onClick={() => generateQR(`${config.API_BASE_URL}/${url.slug}`)}
                  className="qr-btn-small"
                >
                  📱 QR
                </button>
                <button 
                  onClick={() => deleteUrl(url.id)}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
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
                  <p className="qr-url">{selectedUrl}</p>
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
  );
};

export default UserDashboard; 