import pandas as pd
import numpy as np
import joblib

from tensorflow.keras.models import Model
from tensorflow.keras.layers import *
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

from ppg_extraction import *

data = pd.read_csv("dataset/video_data.csv")

X_signal, X_features, y = [], [], []

for _, row in data.iterrows():
    print("Processing:", row["video_path"])

    frames = extract_frames(row["video_path"])

    signal = extract_ppg_signal(frames)
    signal = bandpass_filter(signal)
    signal = smooth_signal(signal)
    signal = normalize_signal(signal)

    if len(signal) < 120:
        signal = np.pad(signal, (0,120-len(signal)))
    else:
        signal = signal[:120]

    peaks = detect_peaks(signal)

    adv = extract_advanced_features(signal, peaks)
    hrv = calculate_hrv_features(peaks)

    features = adv + hrv

    X_signal.append(signal)
    X_features.append(features)
    y.append(row["glucose"])

X_signal = np.array(X_signal).reshape(len(X_signal),120,1)
X_features = np.array(X_features)
y = np.array(y).reshape(-1,1)

# Scale outputs
y_scaler = MinMaxScaler()
y_scaled = y_scaler.fit_transform(y)

# Scale features
feature_scaler = StandardScaler()
X_features = feature_scaler.fit_transform(X_features)

joblib.dump(y_scaler, "y_scaler.save")
joblib.dump(feature_scaler, "feature_scaler.save")

# Split
X_sig_train, X_sig_val, X_feat_train, X_feat_val, y_train, y_val = train_test_split(
    X_signal, X_features, y_scaled, test_size=0.2, random_state=42
)

# MODEL (Simplified)
input_signal = Input(shape=(120,1))

x = Conv1D(32,3,activation='relu')(input_signal)
x = MaxPooling1D(2)(x)
x = LSTM(32)(x)

input_feat = Input(shape=(X_features.shape[1],))
feat = Dense(32, activation='relu')(input_feat)

combined = Concatenate()([x, feat])

x = Dense(64, activation='relu')(combined)
x = Dropout(0.2)(x)
output = Dense(1)(x)

model = Model(inputs=[input_signal, input_feat], outputs=output)

# 🔥 KEY FIX
model.compile(optimizer='adam', loss='mae')

model.fit(
    [X_sig_train, X_feat_train], y_train,
    validation_data=([X_sig_val, X_feat_val], y_val),
    epochs=50,
    batch_size=4,
    callbacks=[EarlyStopping(patience=8, restore_best_weights=True)]
)

# Evaluate
preds = model.predict([X_sig_val, X_feat_val])
preds = y_scaler.inverse_transform(preds)
y_true = y_scaler.inverse_transform(y_val)

mae = mean_absolute_error(y_true, preds)
print("🔥 MAE:", mae)

model.save("final_model.keras")