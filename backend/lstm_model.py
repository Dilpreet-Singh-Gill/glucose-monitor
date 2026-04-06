import numpy as np
import joblib
from tensorflow.keras.models import load_model

from ppg_extraction import *

model = load_model("final_model.keras")
y_scaler = joblib.load("y_scaler.save")
feature_scaler = joblib.load("feature_scaler.save")

def predict_glucose(signal):

    signal = normalize_signal(signal)

    if len(signal) < 120:
        signal = np.pad(signal, (0,120-len(signal)))
    else:
        signal = signal[:120]

    signal_input = signal.reshape(1,120,1)

    peaks = detect_peaks(signal)

    adv = extract_advanced_features(signal, peaks)
    hrv = calculate_hrv_features(peaks)

    features = adv + hrv
    features = feature_scaler.transform([features])

    pred = model.predict([signal_input, features], verbose=0)
    glucose = y_scaler.inverse_transform(pred)[0][0]

    # 🔥 CLIP RANGE (IMPORTANT)
    glucose = np.clip(glucose, 70, 200)

    return float(glucose)