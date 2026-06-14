import time
from datetime import datetime
from collections import deque
import random

class EventDetectionEngine:
    def __init__(self, max_events=100):
        self.events = deque(maxlen=max_events)
        self.stress_history = deque(maxlen=60)
        self.last_temp = 25
        self.last_current = 1.0
        
    def detect_events(self, battery_data):
        """Detect REAL events from battery telemetry"""
        events = []
        temp = battery_data.get('temperature', 25)
        current = battery_data.get('current', 1.0)
        soc = battery_data.get('soc', 50)
        voltage = battery_data.get('voltage', 3.7)
        is_charging = battery_data.get('is_charging', False)
        
        # TRACK RATE OF CHANGE - more accurate
        temp_rate = temp - self.last_temp
        current_rate = current - self.last_current
        
        # 1. Thermal Spike Event - ONLY when fast rising OR very high
        if temp > 45:
            events.append({
                'type': 'THERMAL_SPIKE',
                'severity': 'HIGH',
                'value': temp,
                'threshold': 45,
                'message': f'Critical temperature: {temp}°C',
                'timestamp': datetime.now().isoformat()
            })
        elif temp > 40 and temp_rate > 2:
            events.append({
                'type': 'THERMAL_SPIKE',
                'severity': 'MEDIUM',
                'value': temp,
                'threshold': 40,
                'message': f'Rapid heating detected: {temp}°C',
                'timestamp': datetime.now().isoformat()
            })
        
        # 2. Fast Charge Event - ONLY when ACTUALLY charging
        if is_charging and current > 2.5:
            events.append({
                'type': 'FAST_CHARGE',
                'severity': 'HIGH',
                'value': current,
                'threshold': 2.5,
                'message': f'Ultra-fast charging: {current}A',
                'timestamp': datetime.now().isoformat()
            })
        elif is_charging and current > 2.0:
            events.append({
                'type': 'FAST_CHARGE',
                'severity': 'LOW',
                'value': current,
                'threshold': 2.0,
                'message': f'Fast charging: {current}A',
                'timestamp': datetime.now().isoformat()
            })
        
        # 3. High SOC Event - ONLY when charging near full
        if is_charging and soc > 95:
            events.append({
                'type': 'HIGH_SOC',
                'severity': 'HIGH',
                'value': soc,
                'threshold': 95,
                'message': f'Battery nearly full: {soc}%',
                'timestamp': datetime.now().isoformat()
            })
        elif soc > 90:
            events.append({
                'type': 'HIGH_SOC',
                'severity': 'LOW',
                'value': soc,
                'threshold': 90,
                'message': f'High charge level: {soc}%',
                'timestamp': datetime.now().isoformat()
            })
        
        # 4. Voltage Anomaly - ONLY when actually over-voltage
        if voltage > 4.25:
            events.append({
                'type': 'VOLTAGE_ANOMALY',
                'severity': 'HIGH',
                'value': voltage,
                'threshold': 4.25,
                'message': f'Over-voltage: {voltage}V',
                'timestamp': datetime.now().isoformat()
            })
        elif voltage > 4.2 and is_charging:
            events.append({
                'type': 'VOLTAGE_ANOMALY',
                'severity': 'MEDIUM',
                'value': voltage,
                'threshold': 4.2,
                'message': f'High voltage while charging: {voltage}V',
                'timestamp': datetime.now().isoformat()
            })
        
        # Update tracking
        self.last_temp = temp
        self.last_current = current
        
        # Store events
        for event in events:
            self.events.append(event)
        
        return events
    
    def calculate_stress_score(self, temp, current, soc, is_charging=False):
        """Calculate battery stress score (0-100) - MORE ACCURATE"""
        # Temperature stress (0-40)
        if temp > 45:
            temp_stress = 40
        elif temp > 40:
            temp_stress = 30 + (temp - 40) * 2
        elif temp > 35:
            temp_stress = 15 + (temp - 35) * 3
        elif temp > 30:
            temp_stress = 5 + (temp - 30) * 2
        else:
            temp_stress = max(0, (temp - 20) * 0.5)
        
        # Current stress (0-30)
        if is_charging:
            if current > 2.5:
                current_stress = 30
            elif current > 2.0:
                current_stress = 20 + (current - 2.0) * 20
            elif current > 1.5:
                current_stress = 10 + (current - 1.5) * 20
            else:
                current_stress = current * 6
        else:
            # Discharging stress lower
            current_stress = min(15, current * 5)
        
        # SOC stress (0-30)
        if soc > 95:
            soc_stress = 30
        elif soc > 90:
            soc_stress = 20 + (soc - 90) * 2
        elif soc > 85:
            soc_stress = 10 + (soc - 85) * 2
        elif soc < 10:
            soc_stress = 25
        elif soc < 20:
            soc_stress = 15 + (20 - soc) * 1
        else:
            soc_stress = 0
        
        stress = temp_stress + current_stress + soc_stress
        
        # Store for trending
        self.stress_history.append({
            'stress': round(min(100, stress), 1),
            'timestamp': datetime.now().isoformat()
        })
        
        return round(min(100, stress), 1)
    
    def get_events(self, limit=20):
        """Get recent events"""
        return list(self.events)[-limit:]
    
    def get_stress_history(self, limit=60):
        """Get stress score history"""
        return list(self.stress_history)[-limit:]

# Global instance
event_engine = EventDetectionEngine()
