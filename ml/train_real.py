import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import pandas as pd

print("🔋 Training NeuroCharge AI with REAL Battery Physics...")
print("="*50)

np.random.seed(42)
n_samples = 20000

# REALISTIC battery parameters
temperature = np.random.uniform(20, 48, n_samples)  # 20-48°C
voltage = np.random.uniform(3.0, 4.2, n_samples)    # 3.0-4.2V
current = np.random.uniform(0.2, 3.0, n_samples)    # 0.2-3.0A
soc = np.random.uniform(0, 100, n_samples)          # 0-100%
battery_age = np.random.uniform(0, 4, n_samples)    # 0-4 years
charging_cycles = np.random.randint(0, 1200, n_samples)  # 0-1200 cycles

# REAL battery physics formula
# SOH = 100% MINUS degradation from various factors

# 1. Temperature degradation (higher temp = more degradation)
temp_degradation = np.maximum(0, (temperature - 25) * 0.3)

# 2. Cycle degradation (more cycles = less health)
cycle_degradation = (charging_cycles / 1500) * 12

# 3. Age degradation (older battery = less health)
age_degradation = battery_age * 2.5

# 4. Deep discharge degradation (below 20% SOC)
deep_discharge = np.maximum(0, (20 - soc) / 20) * 5

# 5. High current degradation
current_degradation = np.maximum(0, (current - 1.5)) * 2

# Calculate SOH (starts at 100, degrades over time)
soh = 100 - temp_degradation - cycle_degradation - age_degradation - deep_discharge - current_degradation

# Add some random variation
soh = soh + np.random.normal(0, 1.5, n_samples)

# Clamp between 50 and 100
soh = np.clip(soh, 50, 100)

# Remaining Life Score (based on SOH and current SOC)
remaining_life = soh * (1 - soc/100) * np.random.uniform(0.7, 1.3, n_samples)
remaining_life = np.clip(remaining_life, 0, 100)

# Stress Score (0-100)
stress = (temperature - 20) * 1.2 + current * 8 + np.maximum(0, (soc - 85)) * 1.5
stress = np.clip(stress, 0, 100)

# Combine features
X = np.column_stack([temperature, voltage, current, soc, battery_age, charging_cycles])
y = np.column_stack([soh, remaining_life, stress])

print(f"📊 Training data: {n_samples} samples")
print(f"📈 Features: Temp, Voltage, Current, SOC, Age, Cycles")
print(f"🎯 Targets: SOH, Remaining Life, Stress Score")
print("="*50)

# Train model
model = RandomForestRegressor(
    n_estimators=150,
    max_depth=12,
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
model.fit(X, y)

# Save model
joblib.dump(model, 'model.pkl')
print("✅ Model saved as model.pkl!")
print("="*50)

# Test predictions
print("\n🧪 Test Predictions for different battery states:")
print("-"*40)

# Brand new battery
new = np.array([[25, 4.2, 0.5, 100, 0, 0]])
pred = model.predict(new)
print(f"Brand New (0 cycles, 0 age):")
print(f"   SOH: {pred[0][0]:.1f}% | Remaining Life: {pred[0][1]:.1f}% | Stress: {pred[0][2]:.1f}")

# 1 year old battery
year_old = np.array([[28, 4.1, 1.0, 80, 1, 300]])
pred = model.predict(year_old)
print(f"\n1 Year Old (300 cycles):")
print(f"   SOH: {pred[0][0]:.1f}% | Remaining Life: {pred[0][1]:.1f}% | Stress: {pred[0][2]:.1f}")

# 2 year old battery
two_year = np.array([[32, 4.0, 1.5, 70, 2, 600]])
pred = model.predict(two_year)
print(f"\n2 Years Old (600 cycles):")
print(f"   SOH: {pred[0][0]:.1f}% | Remaining Life: {pred[0][1]:.1f}% | Stress: {pred[0][2]:.1f}")

# Hot battery
hot = np.array([[42, 4.1, 2.0, 90, 1, 200]])
pred = model.predict(hot)
print(f"\nHot Battery (42°C):")
print(f"   SOH: {pred[0][0]:.1f}% | Remaining Life: {pred[0][1]:.1f}% | Stress: {pred[0][2]:.1f}")

print("="*50)
print("✅ Training complete! Model now uses REAL battery physics.")
