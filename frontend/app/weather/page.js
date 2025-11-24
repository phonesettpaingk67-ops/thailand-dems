'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('Bangkok');

  const cities = [
    'Bangkok', 'Chiang Mai', 'Phuket', 'Krabi', 'Surat Thani',
    'Songkhla', 'Nakhon Ratchasima', 'Ubon Ratchathani', 'Khon Kaen',
    'Ayutthaya', 'Kanchanaburi', 'Rayong', 'Chonburi', 'Sukhothai', 'Chiang Rai'
  ];

  useEffect(() => {
    fetchWeatherData();
  }, [selectedCity]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/weather/${selectedCity}`);
      const data = await response.json();
      setWeatherData(data.current);
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Extreme': return 'bg-red-500';
      case 'Severe': return 'bg-orange-500';
      case 'Moderate': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getRiskLevel = (temp, humidity, windSpeed) => {
    if (temp > 38 || windSpeed > 60) return { level: 'High Risk', color: 'text-red-500' };
    if (temp > 35 || humidity > 85 || windSpeed > 40) return { level: 'Moderate Risk', color: 'text-yellow-500' };
    return { level: 'Low Risk', color: 'text-green-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              🌤️ Weather Forecast & Alerts
            </h1>
            <p className="text-slate-400">Real-time weather monitoring for disaster preparedness</p>
          </div>
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition-colors">
            ← Back to Dashboard
          </Link>
        </div>

        {/* City Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none w-64"
          >
            {cities.map(city => (
              <option key={city} value={city} className="text-gray-900">{city}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-400">Loading weather data...</p>
          </div>
        ) : (
          <>
            {/* Weather Alerts */}
            {alerts.length > 0 && (
              <div className="mb-6 space-y-3">
                {alerts.map((alert, idx) => (
                  <div key={idx} className={`${getSeverityColor(alert.severity)} bg-opacity-20 border-l-4 ${getSeverityColor(alert.severity)} p-4 rounded-lg`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">⚠️ {alert.event}</h3>
                        <p className="text-sm mt-1">{alert.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Weather */}
            {weatherData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-6">
                  <div className="text-6xl mb-4">{weatherData.icon}</div>
                  <h2 className="text-3xl font-bold">{weatherData.temperature}°C</h2>
                  <p className="text-slate-300 text-lg">{weatherData.condition}</p>
                  <p className="text-sm text-slate-400 mt-2">Feels like {weatherData.feelsLike}°C</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Conditions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">💧 Humidity</span>
                      <span className="font-semibold">{weatherData.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">🌬️ Wind Speed</span>
                      <span className="font-semibold">{weatherData.windSpeed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">☁️ Cloud Cover</span>
                      <span className="font-semibold">{weatherData.cloudCover}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">👁️ Visibility</span>
                      <span className="font-semibold">{weatherData.visibility} km</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getRiskLevel(weatherData.temperature, weatherData.humidity, weatherData.windSpeed).color}`}>
                      {getRiskLevel(weatherData.temperature, weatherData.humidity, weatherData.windSpeed).level}
                    </div>
                    <p className="text-sm text-slate-400">Based on current conditions</p>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">🌡️ Temp</span>
                      <span className={weatherData.temperature > 35 ? 'text-red-500' : 'text-green-500'}>
                        {weatherData.temperature > 35 ? 'High' : 'Normal'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">💨 Wind</span>
                      <span className={weatherData.windSpeed > 40 ? 'text-red-500' : 'text-green-500'}>
                        {weatherData.windSpeed > 40 ? 'Strong' : 'Normal'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">💧 Humidity</span>
                      <span className={weatherData.humidity > 85 ? 'text-yellow-500' : 'text-green-500'}>
                        {weatherData.humidity > 85 ? 'High' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4">5-Day Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weatherData?.forecast?.map((day, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-2">{day.date}</p>
                    <div className="text-4xl mb-2">{day.icon}</div>
                    <p className="font-semibold">{day.high}° / {day.low}°</p>
                    <p className="text-xs text-slate-400 mt-1">{day.condition}</p>
                    <p className="text-xs text-slate-500 mt-1">💧 {day.rainChance}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* External Link */}
            <div className="mt-6 text-center">
              <a
                href="https://www.tmd.go.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 px-6 py-3 rounded-lg transition-colors"
              >
                📡 Visit Thai Meteorological Department
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
