import pandas as pd
import numpy as np
import joblib

from tensorflow.keras.models import Model
from tensorflow.keras.layers import *
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler

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
    freq = extract_frequency_features(signal)

    X_signal.append(signal)
    X_features.append(adv + freq)
    y.append(row["glucose"])

X_signal = np.array(X_signal).reshape(len(X_signal),120,1)
X_features = np.array(X_features)
y = np.array(y).reshape(-1,1)

scaler = MinMaxScaler()
y_scaled = scaler.fit_transform(y)

# Model
input_signal = Input(shape=(120,1))

cnn = Conv1D(32,3,activation='relu')(input_signal)
cnn = MaxPooling1D(2)(cnn)
cnn = Conv1D(64,3,activation='relu')(cnn)
cnn = MaxPooling1D(2)(cnn)
cnn = Flatten()(cnn)

lstm = LSTM(64, return_sequences=True)(input_signal)
lstm = Dropout(0.2)(lstm)
lstm = LSTM(32)(lstm)

input_feat = Input(shape=(X_features.shape[1],))
feat = Dense(32, activation='relu')(input_feat)

combined = Concatenate()([cnn, lstm, feat])

x = Dense(64, activation='relu')(combined)
x = Dropout(0.3)(x)
x = Dense(32, activation='relu')(x)
out = Dense(1)(x)

model = Model(inputs=[input_signal, input_feat], outputs=out)
model.compile(optimizer='adam', loss='mse')

early_stop = EarlyStopping(monitor='loss', patience=10, restore_best_weights=True)

model.fit([X_signal, X_features], y_scaled,
          epochs=80, batch_size=4,
          callbacks=[early_stop])

model.save("ultimate_model.keras")
joblib.dump(scaler, "scaler.save")

print("🔥 Training Done")