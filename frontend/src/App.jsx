import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async () => {
    const res = await axios.post("http://localhost:8000/shorten", {
      long_url: url,
    });
    setShortUrl(res.data.short_url);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>URL Shortener</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter your long URL"
      />
      <button onClick={handleSubmit}>Shorten</button>
      {shortUrl && (
        <p>
          Short URL: <a href={shortUrl}>{shortUrl}</a>
        </p>
      )}
    </div>
  );
}

export default App;
