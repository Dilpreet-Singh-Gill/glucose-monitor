import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import "./App.css";

function App() {
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const onDrop = (acceptedFiles) => {
    setVideo(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "video/*": [] },
    onDrop,
  });

  const handleUpload = async () => {
    if (!video) return alert("Upload a video");

    const formData = new FormData();
    formData.append("video", video);
    formData.append("user_id", "user1");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData
      );

      setResult(res.data);

      // Save history
      setHistory((prev) => [
        {
          glucose: res.data.glucose,
          heart_rate: res.data.heart_rate,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (err) {
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* Header */}
      <header>
        <h1>🩸 GlucoAI Monitor</h1>
        <p>Non-Invasive Glucose Prediction using AI</p>
      </header>

      {/* Upload Section */}
      <div className="card upload-card">
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p>📂 Drag & drop video OR click</p>
          {video && <span>Selected: {video.name}</span>}
        </div>

        <button onClick={handleUpload}>
          {loading ? "Analyzing..." : "🚀 Predict Glucose"}
        </button>
      </div>

      {/* Loader */}
      {loading && <div className="loader"></div>}

      {/* Result Section */}
      {result && (
        <div className="card result-card">
          <h2>📊 Results</h2>

          <div className="metrics">
            <div className="metric">
              <h3>Glucose</h3>
              <p>{result.glucose} mg/dL</p>
            </div>

            <div className="metric">
              <h3>Heart Rate</h3>
              <p>{result.heart_rate} bpm</p>
            </div>
          </div>

          <img
            src={`data:image/png;base64,${result.graph}`}
            alt="Graph"
          />
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="card history-card">
          <h2>📜 History</h2>
          {history.map((item, index) => (
            <div key={index} className="history-item">
              <span>{item.time}</span>
              <span>Glucose: {item.glucose}</span>
              <span>HR: {item.heart_rate}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default App;