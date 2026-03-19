import React, { useState } from "react";

function App() {
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!video) {
      alert("Please upload a video");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Non-Invasive Glucose Monitor 🩸</h1>

      <input type="file" accept="video/*" onChange={handleUpload} />
      <br /><br />

      <button onClick={handleSubmit}>Predict</button>

      <br /><br />

      {loading && <p>Processing...</p>}

      {result && (
        <div>
          <h2>Results</h2>
          <p><b>Heart Rate:</b> {result.heart_rate} BPM</p>
          <p><b>Glucose:</b> {result.glucose} mg/dL</p>
          <p><b>Status:</b> {result.status}</p>
        </div>
      )}
    </div>
  );
}

export default App;