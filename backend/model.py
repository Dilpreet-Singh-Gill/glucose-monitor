import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Dummy training data (for prototype)
# [mean, std, max, min, peak_count, interval]
X = [
    [145, 2, 150, 140, 20, 15],
    [148, 3, 152, 142, 22, 14],
    [142, 2.5, 147, 138, 18, 16],
    [150, 4, 155, 145, 25, 13],
    [138, 2, 142, 135, 17, 17]
]

# Corresponding glucose values
y = [110, 120, 95, 130, 90]

# Train model
model = RandomForestRegressor()
model.fit(X, y)


def predict_glucose(features):
    features = np.array(features).reshape(1, -1)
    prediction = model.predict(features)
    return prediction[0]