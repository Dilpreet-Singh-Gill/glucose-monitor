import cv2
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import butter, filtfilt, find_peaks

# Step 1: Extract frames
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


# Step 2: Generate PPG signal
def extract_ppg_signal(frames):
    signal = []

    for frame in frames:
        red_channel = frame[:, :, 2]
        avg_intensity = np.mean(red_channel)
        signal.append(avg_intensity)

    return signal


# Step 3: Filter signal
def bandpass_filter(signal):
    signal = np.array(signal)
    fs = 30  # frames per second

    low = 0.5
    high = 3

    b, a = butter(3, [low/(fs/2), high/(fs/2)], btype='band')
    filtered = filtfilt(b, a, signal)

    return filtered


# Step 4: Plot signal
def plot_signal(signal, peaks=None, title="PPG Signal"):
    plt.figure(figsize=(10, 4))
    plt.plot(signal)

    if peaks is not None:
        plt.plot(peaks, np.array(signal)[peaks], "ro")  # mark peaks

    plt.title(title)
    plt.xlabel("Frame")
    plt.ylabel("Intensity")
    plt.grid()
    plt.show()


# Step 5: Detect peaks (heartbeats)
def detect_peaks(signal):
    peaks, _ = find_peaks(signal, distance=15)
    return peaks


# Step 6: Calculate heart rate
def calculate_heart_rate(peaks, total_frames, fps=30):
    duration_seconds = total_frames / fps
    heart_rate = (len(peaks) / duration_seconds) * 60
    return heart_rate

def extract_features(signal, peaks):
    signal = np.array(signal)

    # Basic features
    mean_val = np.mean(signal)
    std_val = np.std(signal)
    max_val = np.max(signal)
    min_val = np.min(signal)

    # Heartbeat features
    peak_count = len(peaks)

    # Peak intervals
    if len(peaks) > 1:
        intervals = np.diff(peaks)
        avg_interval = np.mean(intervals)
    else:
        avg_interval = 0

    return [
        mean_val,
        std_val,
        max_val,
        min_val,
        peak_count,
        avg_interval
    ]