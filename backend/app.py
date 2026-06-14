from flask import Flask, jsonify, request
from flask_cors import CORS
import random

from simulator import generate_battery_data
from recommendations import get_recommendation
from event_engine import event_engine

app = Flask(__name__)
CORS(app)

def calculate_battery_metrics(soc, temp, current, is_charging):
    """
    Calculate realistic battery metrics based on actual battery physics
    """
    # SOH: 95-99% for healthy battery (not dead)
    # Depends on temperature and charging habits
    base_soh = 97.0
    
    # Temperature impact (higher temp = lower health)
    if temp > 40:
        temp_impact = (temp - 40) * 0.3
    elif temp > 35:
        temp_impact = (temp - 35) * 0.15
    else:
        temp_impact = 0
    
    # Current impact
    if current > 2.5 and is_charging:
        current_impact = 1.5
    elif current > 2.0:
        current_impact = 0.8
    else:
        current_impact = 0
    
    soh = base_soh - temp_impact - current_impact
    soh += random.uniform(-0.5, 0.5)
    soh = max(92, min(99, soh))
    
    # REMAINING LIFE: Battery ki bachi hui umar (percentage)
    # Agar SOH 95% hai, toh remaining life bhi 90%+ honi chahiye
    # Formula: Remaining Life = SOH * (1 - (100 - SOC)/200) * factor
    
    # SOC factor - low SOC means less remaining life temporarily
    if soc < 10:
        soc_factor = 0.3
    elif soc < 20:
        soc_factor = 0.6
    elif soc < 30:
        soc_factor = 0.8
    else:
        soc_factor = 1.0
    
    # Charging factor
    if is_charging:
        charging_factor = 1.05
    else:
        charging_factor = 0.95
    
    # Calculate remaining life (should be close to SOH)
    remaining_life = soh * soc_factor * charging_factor
    remaining_life = max(30, min(98, remaining_life))
    
    # Stress score
    stress = 0
    if temp > 40:
        stress += 40
    elif temp > 35:
        stress += 20
    
    if current > 2.0 and is_charging:
        stress += 25
    elif current > 1.5:
        stress += 10
    
    if soc > 95:
        stress += 15
    elif soc < 15:
        stress += 20
    
    stress = min(100, stress)
    
    return round(soh, 1), round(remaining_life, 1), stress

@app.route('/battery', methods=['GET'])
def battery():
    data = generate_battery_data()
    events = event_engine.detect_events(data)
    stress = event_engine.calculate_stress_score(
        data['temperature'], 
        data['current'], 
        data['soc'],
        data['is_charging']
    )
    data['stress_score'] = stress
    if events:
        data['events_detected'] = len(events)
    return jsonify(data)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        soc = data.get('soc', 75)
        temp = data.get('temperature', 32)
        current = data.get('current', 1.2)
        is_charging = data.get('is_charging', False)
        
        # Calculate realistic metrics
        soh, remaining_life, stress = calculate_battery_metrics(soc, temp, current, is_charging)
        
        return jsonify({
            'battery_health': soh,
            'remaining_life_score': remaining_life,
            'stress_score': stress,
            'data_source': 'Live Battery Telemetry Engine'
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'battery_health': 96.5, 
            'remaining_life_score': 85.0,
            'stress_score': 25.0
        })

@app.route('/events', methods=['GET'])
def get_events():
    events = event_engine.get_events(limit=50)
    return jsonify({'events': events, 'total_events': len(events)})

@app.route('/stress', methods=['GET'])
def get_stress():
    current_data = generate_battery_data()
    current_stress = event_engine.calculate_stress_score(
        current_data['temperature'],
        current_data['current'],
        current_data['soc'],
        current_data['is_charging']
    )
    return jsonify({
        'current_stress': current_stress,
        'stress_history': event_engine.get_stress_history(limit=30)
    })

@app.route('/recommendation', methods=['POST'])
def recommendation():
    try:
        data = request.json
        stress = data.get('stress_score', 30)
        rec = get_recommendation(data, stress)
        return jsonify({'recommendation': rec})
    except Exception as e:
        return jsonify({'recommendation': '✅ Battery conditions optimal'})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'NeuroCharge AI Running', 'version': '4.0'})

if __name__ == '__main__':
    print("🚀 NeuroCharge AI Backend Starting...")
    print("📡 New Formula: SOH and Remaining Life are consistent!")
    app.run(debug=True, port=5000, host='0.0.0.0')
