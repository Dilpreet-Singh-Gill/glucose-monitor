# 🔥 IMPORTANT FIX (No GUI thread error)
import matplotlib
matplotlib.use('Agg')

import cv2
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import butter, filtfilt, find_peaks
import io
import base64

# -------------------------------
# 🎥 Extract Frames from Video
# -------------------------------
def extract_frames(video_path):
    cap = cv2.VideoCapture(video_path)
    frames = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)

    cap.release()
    return frames


# -------------------------------
# 💚 Extract PPG Signal (Green Channel)
# -------------------------------
def extract_ppg_signal(frames):
    signal = []

    for frame in frames:
        green = frame[:, :, 1]

        h, w = green.shape

        # Center ROI (reduce noise)
        roi = green[h//4:3*h//4, w//4:3*w//4]

        avg_intensity = np.mean(roi)
        signal.append(avg_intensity)

    return signal


# -------------------------------
# 🔊 Bandpass Filter
# -------------------------------
def bandpass_filter(signal):
    signal = np.array(signal)

    if len(signal) < 10:
        return signal

    fs = 30  # FPS
    low = 0.7
    high = 2.5

    b, a = butter(3, [low/(fs/2), high/(fs/2)], btype='band')
    filtered = filtfilt(b, a, signal)

    return filtered


# -------------------------------
# 🧼 Smooth Signal
# -------------------------------
def smooth_signal(signal):
    return np.convolve(signal, np.ones(5)/5, mode='same')


# -------------------------------
# 📏 Normalize Signal
# -------------------------------
def normalize_signal(signal):
    signal = np.array(signal)
    return (signal - np.mean(signal)) / (np.std(signal) + 1e-8)


# -------------------------------
# 📈 Detect Peaks (Heartbeat)
# -------------------------------
def detect_peaks(signal):
    peaks, _ = find_peaks(signal, distance=10)
    return peaks


# -------------------------------
# ❤️ Heart Rate Calculation
# -------------------------------
def calculate_heart_rate(peaks, total_frames, fps=30):
    if total_frames == 0 or fps == 0:
        return 0

    duration = total_frames / fps

    if duration == 0:
        return 0

    return (len(peaks) / duration) * 60


# -------------------------------
# 📊 Advanced Features
# -------------------------------
def extract_advanced_features(signal, peaks):
    signal = np.array(signal)

    if len(signal) == 0:
        return [0]*9

    mean_val = np.mean(signal)
    std_val = np.std(signal)
    max_val = np.max(signal)
    min_val = np.min(signal)

    if len(peaks) > 1:
        intervals = np.diff(peaks)
        hrv = np.std(intervals)
        avg_interval = np.mean(intervals)
    else:
        hrv, avg_interval = 0, 0

    energy = np.sum(signal**2)
    signal_range = max_val - min_val
    peak_density = len(peaks) / len(signal)

    return [
        mean_val,
        std_val,
        max_val,
        min_val,
        hrv,
        avg_interval,
        energy,
        signal_range,
        peak_density
    ]


# -------------------------------
# ❤️ HRV Features
# -------------------------------
def calculate_hrv_features(peaks):
    if len(peaks) < 2:
        return [0, 0]

    intervals = np.diff(peaks)

    return [
        np.std(intervals),
        np.sqrt(np.mean(intervals**2))
    ]


# -------------------------------
# 📊 Graph (Base64 for Frontend)
# -------------------------------
def generate_plot_base64(signal):
    plt.figure(figsize=(6, 3))
    plt.plot(signal)
    plt.title("PPG Signal")
    plt.xlabel("Frame")
    plt.ylabel("Intensity")

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)

    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    plt.close('all')  # 🔥 IMPORTANT FIX

    return image_base64