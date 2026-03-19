from flask import Flask, request, jsonify
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from ppg_extraction import (
    extract_frames,
    extract_ppg_signal,
    bandpass_filter,
    detect_peaks,
    calculate_heart_rate,
    extract_features
)

from model import predict_glucose

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/")
def home():
    return "Glucose Monitoring API Running 🚀"


@app.route("/predict", methods=["POST"])
def predict():
    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files["video"]
    video_path = os.path.join(UPLOAD_FOLDER, video.filename)
    video.save(video_path)

    # Processing pipeline
    frames = extract_frames(video_path)
    signal = extract_ppg_signal(frames)
    filtered_signal = bandpass_filter(signal)

    peaks = detect_peaks(filtered_signal)
    heart_rate = calculate_heart_rate(peaks, len(frames))

    features = extract_features(filtered_signal, peaks)
    glucose = predict_glucose(features)

    return jsonify({
        "heart_rate": round(heart_rate, 2),
        "glucose": round(glucose, 2),
        "status": "Normal (Experimental)"
    })


if __name__ == "__main__":
    app.run(debug=True)