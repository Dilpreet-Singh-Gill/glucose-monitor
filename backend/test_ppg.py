from ppg_extraction import (
    extract_frames,
    extract_ppg_signal,
    bandpass_filter,
    detect_peaks,
    calculate_heart_rate,
    extract_features
)

from model import predict_glucose

video_path = "C:/Users/dilpr/Pictures/sample.mp4"

# Step 1
frames = extract_frames(video_path)

# Step 2
signal = extract_ppg_signal(frames)

# Step 3
filtered_signal = bandpass_filter(signal)

# Step 4
peaks = detect_peaks(filtered_signal)

# Step 5
heart_rate = calculate_heart_rate(peaks, len(frames))

# Step 6: extract features
features = extract_features(filtered_signal, peaks)

# Step 7: predict glucose
glucose = predict_glucose(features)

print(f"Heart Rate: {heart_rate:.2f} BPM")
print(f"Predicted Glucose: {glucose:.2f} mg/dL")