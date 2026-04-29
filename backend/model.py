import pandas as pd
from sklearn.linear_model import LinearRegression

# Train model only once
data = pd.DataFrame({
    'day': [1,2,3,4,5],
    'sales': [200, 220, 250, 270, 300]
})

X = data[['day']]
y = data['sales']

model = LinearRegression()
model.fit(X, y)

def predict_sales(day):
    prediction = model.predict([[day]])
    return round(prediction[0], 2)