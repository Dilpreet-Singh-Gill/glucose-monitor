import cv2
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import butter, filtfilt, find_peaks
import io, base64

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


def extract_ppg_signal(frames):
    signal = []
    for frame in frames:
        green = frame[:, :, 1]

        blur = cv2.GaussianBlur(green, (15, 15), 0)
        _, _, _, max_loc = cv2.minMaxLoc(blur)

        x, y = max_loc
        h, w = green.shape

        size = 40
        roi = green[max(0,y-size):min(h,y+size),
                    max(0,x-size):min(w,x+size)]

        signal.append(np.mean(roi))

    return signal


def bandpass_filter(signal):
    signal = np.array(signal)
    if len(signal) < 10:
        return signal

    fs = 30
    low, high = 0.7, 2.5
    b, a = butter(4, [low/(fs/2), high/(fs/2)], btype='band')
    return filtfilt(b, a, signal)


def smooth_signal(signal):
    return np.convolve(signal, np.ones(5)/5, mode='same')


def normalize_signal(signal):
    signal = np.array(signal)
    return (signal - np.mean(signal)) / (np.std(signal) + 1e-8)


def detect_peaks(signal):
    peaks, _ = find_peaks(signal, distance=10)
    return peaks


def calculate_heart_rate(peaks, total_frames, fps=30):
    if total_frames == 0:
        return 0
    duration = total_frames / fps
    return (len(peaks) / duration) * 60 if duration > 0 else 0


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
    rng = max_val - min_val
    density = len(peaks)/len(signal)

    return [mean_val, std_val, max_val, min_val,
            hrv, avg_interval, energy, rng, density]


def extract_frequency_features(signal):
    fft = np.fft.fft(signal)
    freqs = np.fft.fftfreq(len(signal))
    mag = np.abs(fft)

    mask = freqs > 0
    freqs, mag = freqs[mask], mag[mask]

    dom = freqs[np.argmax(mag)] if len(freqs) > 0 else 0
    energy = np.sum(mag**2)

    return [dom, energy]


def generate_plot_base64(signal):
    plt.figure(figsize=(6,3))
    plt.plot(signal)

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)

    img = base64.b64encode(buffer.getvalue()).decode()
    plt.close()

    return img