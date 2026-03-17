from ppg_extraction import (
    extract_frames,
    extract_ppg_signal,
    bandpass_filter,
    plot_signal,
    detect_peaks,
    calculate_heart_rate
)

video_path = "C:/Users/dilpr/Pictures/sample.mp4"

# Step 1
frames = extract_frames(video_path)

# Step 2
signal = extract_ppg_signal(frames)

# Step 3
filtered_signal = bandpass_filter(signal)

# Step 4: detect peaks
peaks = detect_peaks(filtered_signal)

# Step 5: plot with peaks
plot_signal(filtered_signal, peaks, "Filtered Signal with Peaks")

# Step 6: heart rate
heart_rate = calculate_heart_rate(peaks, len(frames))

print(f"Heart Rate: {heart_rate:.2f} BPM")