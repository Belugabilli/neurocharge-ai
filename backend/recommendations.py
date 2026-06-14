def get_recommendation(data, stress_score=None):
    temp = data.get('temperature', 25)
    soc = data.get('soc', 50)
    current = data.get('current', 1.0)
    voltage = data.get('voltage', 3.7)
    is_charging = data.get('is_charging', False)
    
    # CHARGING recommendations
    if is_charging:
        if temp > 45:
            return "🔥 CRITICAL: Battery overheating! Unplug immediately and cool down."
        elif temp > 42:
            return "🌡️ Battery hot. Pause charging or move to cooler environment."
        elif voltage > 4.25:
            return "⚠️ Voltage anomaly detected. Disconnect charger."
        elif current > 2.5:
            return "⚡ Ultra-fast charging. Monitor temperature."
        elif current > 2.0:
            return "🔋 Fast charging active. Battery health normal."
        elif soc > 98:
            return "✅ Battery full! Unplug to maximize lifespan."
        elif soc > 90:
            return "⚠️ Charging above 90% accelerates degradation."
        else:
            return "✅ Charging normally. Battery conditions optimal."
    
    # DISCHARGING recommendations
    else:
        if temp > 45:
            return "🔥 Device very hot! Reduce usage immediately."
        elif temp > 42:
            return "🌡️ Device warming up. Close heavy applications."
        elif soc < 5:
            return "🔴 CRITICAL: Battery critically low! Plug in now."
        elif soc < 15:
            return "🟡 Battery low. Connect charger soon."
        elif soc < 25:
            return "⚡ Battery moderate. Consider charging for optimal health."
        elif stress_score and stress_score > 80:
            return "⚠️ High battery stress. Reduce load or take a break."
        elif stress_score and stress_score > 60:
            return "⚠️ Moderate stress. Close unused apps."
        else:
            return "✅ Battery conditions optimal. No action needed."

def get_stress_level(stress_score):
    if stress_score >= 70:
        return "HIGH", "text-red-400", "bg-red-500/20"
    elif stress_score >= 40:
        return "MEDIUM", "text-yellow-400", "bg-yellow-500/20"
    else:
        return "LOW", "text-green-400", "bg-green-500/20"
