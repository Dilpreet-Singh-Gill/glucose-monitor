import numpy as np
import joblib
from tensorflow.keras.models import load_model

from ppg_extraction import *
from calibration import apply_calibration

model = load_model("ultimate_model.keras")
scaler = joblib.load("scaler.save")

def predict_glucose_lstm(signal, user_id=None):
    signal = normalize_signal(signal)

    if len(signal) < 120:
        signal = np.pad(signal, (0,120-len(signal)))
    else:
        signal = signal[:120]

    signal_input = signal.reshape(1,120,1)

    peaks = detect_peaks(signal)
    adv = extract_advanced_features(signal, peaks)
    freq = extract_frequency_features(signal)

    feat_input = np.array(adv + freq).reshape(1,-1)

    pred = model.predict([signal_input, feat_input], verbose=0)
    glucose = scaler.inverse_transform(pred)[0][0]

    if user_id:
        glucose = apply_calibration(user_id, glucose)

    return float(glucose)