from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge

from ppg_extraction import *
from lstm_model import predict_glucose_lstm
from calibration import calibrate_user
from database import create_table, add_user, validate_user

app = Flask(__name__)

# 🔥 IMPORTANT: Increase max upload size (200 MB)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024

CORS(app)

# Initialize DB
create_table()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# -------------------------------
# Error Handler (413 Fix)
# -------------------------------
@app.errorhandler(RequestEntityTooLarge)
def handle_large_file(e):
    return jsonify({"error": "File too large. Please upload smaller video (10–30 sec)."}), 413


# -------------------------------
# Home Route
# -------------------------------
@app.route("/")
def home():
    return "🔥 Ultimate Glucose Monitoring API Running"


# -------------------------------
# Signup API
# -------------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email & password required"}), 400

    if add_user(email, password):
        return jsonify({"message": "User created successfully"})
    else:
        return jsonify({"error": "User already exists"}), 400


# -------------------------------
# Login API
# -------------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if validate_user(email, password):
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"error": "Invalid credentials"}), 401


# -------------------------------
# Prediction API
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files["video"]
    user_id = request.form.get("user_id")  # optional

    video_path = os.path.join(UPLOAD_FOLDER, video.filename)
    video.save(video_path)

    try:
        # Step 1: Extract frames
        frames = extract_frames(video_path)

        if len(frames) == 0:
            return jsonify({"error": "Invalid or empty video"}), 400

        # Step 2: Extract PPG signal
        signal = extract_ppg_signal(frames)

        # Step 3: Clean signal
        signal = bandpass_filter(signal)
        signal = smooth_signal(signal)
        signal = normalize_signal(signal)

        # Step 4: Heart Rate
        peaks = detect_peaks(signal)
        heart_rate = calculate_heart_rate(peaks, len(frames))

        # Step 5: Predict Glucose
        glucose = predict_glucose_lstm(signal, user_id)

        # Step 6: Graph
        graph = generate_plot_base64(signal)

        return jsonify({
            "glucose": round(glucose, 2),
            "heart_rate": round(heart_rate, 2),
            "status": "AI Prediction (Experimental)",
            "graph": graph
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Cleanup file
        if os.path.exists(video_path):
            os.remove(video_path)


# -------------------------------
# Calibration API
# -------------------------------
@app.route("/calibrate", methods=["POST"])
def calibrate():
    data = request.json

    user_id = data.get("user_id")
    predicted = data.get("predicted")
    actual = data.get("actual")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    calibrate_user(user_id, predicted, actual)

    return jsonify({"message": "Calibration updated successfully"})


# -------------------------------
# Run Server
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)