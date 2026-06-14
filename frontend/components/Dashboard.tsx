'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [battery, setBattery] = useState({ 
    temperature: 0, voltage: 0, current: 0, soc: 0, 
    is_charging: false, data_source: '', stress_score: 0 
  });
  const [prediction, setPrediction] = useState({ 
    battery_health: 0, remaining_life_score: 0, stress_score: 0 
  });
  const [recommendation, setRecommendation] = useState('');
  const [events, setEvents] = useState([]);
  const [stressHistory, setStressHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const batteryRes = await axios.get(`${API_URL}/battery`);
      const batteryData = batteryRes.data;
      setBattery(batteryData);

      const predRes = await axios.post(`${API_URL}/predict`, batteryData);
      const predData = predRes.data;
      setPrediction(predData);

      const recRes = await axios.post(`${API_URL}/recommendation`, {
        ...batteryData,
        battery_health: predData.battery_health,
        stress_score: predData.stress_score
      });
      setRecommendation(recRes.data.recommendation);

      const eventsRes = await axios.get(`${API_URL}/events`);
      setEvents(eventsRes.data.events || []);

      const stressRes = await axios.get(`${API_URL}/stress`);
      setStressHistory(stressRes.data.stress_history || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStressColor = (stress) => {
    if (stress > 70) return 'text-red-400';
    if (stress > 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'HIGH') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (severity === 'MEDIUM') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'THERMAL_SPIKE': return '🔥';
      case 'FAST_CHARGE': return '⚡';
      case 'HIGH_SOC': return '🔋';
      case 'VOLTAGE_ANOMALY': return '⚠️';
      default: return '📡';
    }
  };

  const team = [
    { name: 'Hanish Singla', role: 'Team Lead', course: 'B.Tech CSE', year: '2025-2029 · 2nd Year', college: 'VIT Bhopal University', image: '/images/hanish.png', email: 'hanish.singla@vitonomous.com' },
    { name: 'Shraddha Gupta', role: 'ML Engineer', course: 'B.Tech CSE (AI and ML)', year: '2025-2029 · 2nd Year', college: 'VIT Bhopal University', image: '/images/shraddha.png', email: 'shraddha.gupta@vitonomous.com' },
    { name: 'Vaishnavi Sen', role: 'Cloud Architect', course: 'B.Tech CSE (Cloud and Automation)', year: '2025-2029 · 2nd Year', college: 'VIT Bhopal University', image: '/images/vaishnavi.png', email: 'vaishnavi.sen@vitonomous.com' },
    { name: 'Parth Singh', role: 'Backend Dev', course: 'B.Tech CSE', year: '2025-2029 · 2nd Year', college: 'VIT Bhopal University', image: '/images/parth.png', email: '' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🧠</div>
          <div className="text-white text-xl font-light tracking-wide">Initializing NeuroCharge AI</div>
          <div className="text-gray-500 text-sm mt-2">Event-Driven Battery Intelligence</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Hero Section - Apple Style */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium tracking-wide text-gray-300">LIVE TELEMETRY</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 tracking-tight">
              NeuroCharge AI
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
              Neuromorphic Event Intelligence for Battery Health
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid - Apple Glass Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <GlassMetric label="Temperature" value={`${battery.temperature}°C`} icon="🌡️" trend="normal" />
          <GlassMetric label="Voltage" value={`${battery.voltage}V`} icon="⚡" trend="normal" />
          <GlassMetric label="Current" value={`${battery.current}A`} icon="🔌" trend="normal" />
          <GlassMetric label="State of Charge" value={`${battery.soc}%`} icon="🔋" trend={battery.soc < 20 ? "low" : battery.soc > 90 ? "high" : "normal"} />
          <GlassMetric label="Stress Score" value={`${prediction.stress_score || battery.stress_score || 0}`} icon="⚠️" trend={(prediction.stress_score || 0) > 70 ? "high" : (prediction.stress_score || 0) > 40 ? "medium" : "normal"} />
        </div>

        {/* Predictions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <GlassCard title="State of Health" icon="💚" value={`${prediction.battery_health}%`} subtitle="Estimated remaining capacity" />
          <GlassCard title="Remaining Life" icon="⏱️" value={`${prediction.remaining_life_score}%`} subtitle="Predicted lifecycle remaining" />
          <GlassCard title="Battery Stress" icon="🧠" value={`${prediction.stress_score || battery.stress_score || 0}`} subtitle="Electrochemical stress level" />
        </div>

        {/* Neuromorphic Event Intelligence */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Neuromorphic Event Intelligence</h2>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">Event-Driven</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Events Timeline */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">📡 Event Timeline</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {events.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-sm">No events detected. Battery nominal.</div>
                ) : (
                  events.slice().reverse().slice(0, 10).map((event, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border ${getSeverityColor(event.severity)} backdrop-blur-sm transition-all hover:scale-[1.02]`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getEventIcon(event.type)}</span>
                          <div>
                            <p className="font-medium text-sm">{event.type.replace('_', ' ')}</p>
                            <p className="text-xs opacity-75">{event.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(event.severity)}`}>{event.severity}</span>
                          <p className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Monitors & Stress Chart */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">🎯 Active Monitors</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <MonitorCard title="Thermal Spike" threshold="> 40°C" icon="🔥" />
                <MonitorCard title="Fast Charge" threshold="> 2.2A" icon="⚡" />
                <MonitorCard title="High SOC" threshold="> 90%" icon="🔋" />
                <MonitorCard title="Voltage Anomaly" threshold="> 4.2V" icon="⚠️" />
              </div>
              
              {/* Stress History */}
              <h3 className="text-sm font-medium text-gray-400 mb-3">Stress Trend</h3>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-end gap-1 h-20">
                  {stressHistory.slice(-30).map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group">
                      <div className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80" 
                           style={{ height: `${Math.min((item.stress || 0) * 0.8, 80)}px`, 
                                    backgroundColor: (item.stress || 0) > 70 ? '#ef4444' : (item.stress || 0) > 40 ? '#eab308' : '#22c55e' }}>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Now</span>
                  <span>30 samples ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight">AI Recommendation</h2>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">Real-time</span>
          </div>
          <div className={`text-xl font-medium px-4 py-3 rounded-xl ${recommendation.includes('⚠️') ? 'text-yellow-300' : recommendation.includes('🔴') ? 'text-red-400' : 'text-green-400'}`}>
            {recommendation || "Analyzing battery telemetry..."}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span>📡 {battery.data_source || "Live Battery Telemetry Engine"}</span>
            <span>{battery.is_charging ? "🔌 Charging" : "🔋 Discharging"}</span>
            <span>📊 Events detected: {events.length}</span>
          </div>
        </div>
      </div>

      {/* Team Section - Apple Style */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Meet the Team</h2>
          <p className="text-gray-500 text-sm mt-2">The minds behind NeuroCharge AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((member, idx) => (
            <div key={idx} className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-white/10">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover border-2 border-white/20 group-hover:border-green-400/50 transition-all" 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + member.name.replace(' ', '+') + '&background=0D9488&color=fff&size=128'; }} />
              </div>
              <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
              <p className="text-green-400 text-xs mb-2">{member.role}</p>
              <p className="text-gray-400 text-xs mb-1">{member.course}</p>
              <p className="text-gray-500 text-xs mb-3">{member.year}</p>
              {member.email && (
                <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-green-500/20 rounded-lg transition-all text-xs group">
                  <span>📧</span>
                  <span>Email</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Clean Apple Style */}
      <footer className="border-t border-white/10 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500">
                Made with <span className="text-red-400">❤️</span> by <span className="text-green-400 font-medium">VITonomous</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">© 2026 VITonomous. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <a href="mailto:contact@vitonomous.com" className="text-gray-500 hover:text-green-400 transition text-sm">
                contact@vitonomous.com
              </a>
              <a href="https://github.com/Belugabilli/neurocharge-ai" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-400 transition text-sm">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function GlassMetric({ label, value, icon, trend }) {
  const trendColor = trend === 'high' ? 'text-orange-400' : trend === 'low' ? 'text-red-400' : 'text-white';
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-center transition-all hover:scale-105 hover:bg-white/10">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-semibold ${trendColor}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function GlassCard({ title, icon, value, subtitle }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 transition-all hover:scale-105">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{value}</div>
      <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
}

function MonitorCard({ title, threshold, icon }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
      <span className="text-xl">{icon}</span>
      <p className="text-xs font-medium mt-1">{title}</p>
      <p className="text-xs text-gray-500">{threshold}</p>
    </div>
  );
}
