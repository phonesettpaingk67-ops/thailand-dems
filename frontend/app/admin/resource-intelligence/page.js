'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ResourceIntelligencePage() {
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/disasters');
      const data = await response.json();
      const disastersArray = Array.isArray(data) ? data : [];
      setDisasters(disastersArray);
      if (disastersArray.length > 0) {
        selectDisaster(disastersArray[0].DisasterID);
      }
    } catch (error) {
      console.error('Error:', error);
      setDisasters([]);
    } finally {
      setLoading(false);
    }
  };

  const selectDisaster = async (disasterId) => {
    setSelectedDisaster(disasterId);
    try {
      const [alertsRes, recsRes, summaryRes] = await Promise.all([
        fetch(`http://localhost:5000/api/resource-intelligence/disasters/${disasterId}/alerts`),
        fetch(`http://localhost:5000/api/resource-intelligence/disasters/${disasterId}/recommendations`),
        fetch(`http://localhost:5000/api/resource-intelligence/disasters/${disasterId}/summary`)
      ]);

      const alertsData = await alertsRes.json();
      const recsData = await recsRes.json();
      const summaryData = await summaryRes.json();

      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setRecommendations(Array.isArray(recsData) ? recsData : []);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const analyzeDisaster = async (disasterId) => {
    try {
      await fetch(`http://localhost:5000/api/resource-intelligence/disasters/${disasterId}/analyze`, {
        method: 'POST'
      });
      selectDisaster(disasterId);
      alert('Analysis complete!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await fetch(`http://localhost:5000/api/resource-intelligence/alerts/${alertId}/resolve`, {
        method: 'PUT'
      });
      selectDisaster(selectedDisaster);
      alert('Alert resolved!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const implementRecommendation = async (recId) => {
    try {
      await fetch(`http://localhost:5000/api/resource-intelligence/recommendations/${recId}/implement`, {
        method: 'PUT'
      });
      selectDisaster(selectedDisaster);
      alert('Recommendation implemented!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'from-red-600 to-pink-600',
      'High': 'from-orange-600 to-red-600',
      'Medium': 'from-yellow-600 to-orange-600',
      'Low': 'from-blue-600 to-cyan-600'
    };
    return colors[severity] || 'from-gray-600 to-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Urgent': 'from-red-500 to-pink-500',
      'High': 'from-orange-500 to-red-500',
      'Medium': 'from-yellow-500 to-orange-500',
      'Low': 'from-green-500 to-emerald-500'
    };
    return colors[priority] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-2xl font-bold">Loading intelligence...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 group">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <span className="text-4xl">🧠</span>
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight">Resource Intelligence</h1>
              <p className="text-gray-300 mt-2 text-lg">Smart capacity analysis and recommendations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 border border-red-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-semibold uppercase tracking-wider">Critical Alerts</p>
                <p className="text-4xl font-black text-white mt-2">
                  {alerts.filter(a => a.Severity === 'Critical' && a.Status === 'Active').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-red-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-semibold uppercase tracking-wider">Total Alerts</p>
                <p className="text-4xl font-black text-white mt-2">
                  {alerts.filter(a => a.Status === 'Active').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Recommendations</p>
                <p className="text-4xl font-black text-white mt-2">
                  {recommendations.filter(r => r.Status === 'Pending').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">💡</span>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-semibold uppercase tracking-wider">Implemented</p>
                <p className="text-4xl font-black text-white mt-2">
                  {recommendations.filter(r => r.Status === 'Implemented').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <label className="text-white text-sm font-semibold uppercase tracking-wider block mb-2">Select Disaster:</label>
              <select
                value={selectedDisaster || ''}
                onChange={(e) => selectDisaster(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all outline-none hover:bg-white/15"
              >
                {disasters.map(d => (
                  <option key={d.DisasterID} value={d.DisasterID} className="text-gray-900">
                    {d.DisasterType} - {d.Location} ({d.Status})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => analyzeDisaster(selectedDisaster)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>🔍</span>
              <span>Analyze Now</span>
            </button>
          </div>
        </div>

        {summary && (
          <div className="mb-8 glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-3xl font-black text-white">Capacity Summary</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-2">Shelter Gap</p>
                <p className="text-4xl font-black text-white">{summary.shelterGap || 0}</p>
                <p className="text-blue-300 text-sm mt-2">Need: {summary.shelterNeed || 0} | Have: {summary.shelterAvailable || 0}</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-6">
                <p className="text-purple-200 text-sm font-semibold uppercase tracking-wider mb-2">Volunteer Gap</p>
                <p className="text-4xl font-black text-white">{summary.volunteerGap || 0}</p>
                <p className="text-purple-300 text-sm mt-2">Need: {summary.volunteerNeed || 0} | Have: {summary.volunteerAvailable || 0}</p>
              </div>

              <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-6">
                <p className="text-orange-200 text-sm font-semibold uppercase tracking-wider mb-2">Supply Gap</p>
                <p className="text-4xl font-black text-white">{summary.supplyGap || 0}</p>
                <p className="text-orange-300 text-sm mt-2">Need: {summary.supplyNeed || 0} | Have: {summary.supplyAvailable || 0}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🚨</span>
              </div>
              <h2 className="text-2xl font-black text-white">Capacity Alerts</h2>
            </div>

            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 text-center">
                  <span className="text-4xl mb-2 block">✅</span>
                  <p className="text-white font-bold">No active alerts</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.AlertID}
                    className={`glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-xl`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getSeverityColor(alert.Severity)} rounded-xl flex items-center justify-center`}>
                          <span className="text-xl">⚠️</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{alert.ResourceType} Shortage</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getSeverityColor(alert.Severity)}`}>
                            {alert.Severity}
                          </span>
                        </div>
                      </div>
                      {alert.Status === 'Active' && (
                        <button
                          onClick={() => resolveAlert(alert.AlertID)}
                          className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold text-sm transition-all hover:scale-105"
                        >
                          ✓ Resolve
                        </button>
                      )}
                    </div>

                    <p className="text-white mb-2">{alert.Message}</p>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Required:</span>
                        <p className="text-white font-semibold">{alert.RequiredAmount}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Available:</span>
                        <p className="text-white font-semibold">{alert.AvailableAmount}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Gap:</span>
                        <p className="text-red-400 font-semibold">{alert.GapAmount}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <h2 className="text-2xl font-black text-white">Smart Recommendations</h2>
            </div>

            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 text-center">
                  <span className="text-4xl mb-2 block">💡</span>
                  <p className="text-white font-bold">No recommendations</p>
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.RecommendationID}
                    className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getPriorityColor(rec.Priority)} rounded-xl flex items-center justify-center`}>
                          <span className="text-xl">💡</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{rec.RecommendationType}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getPriorityColor(rec.Priority)}`}>
                            {rec.Priority}
                          </span>
                        </div>
                      </div>
                      {rec.Status === 'Pending' && (
                        <button
                          onClick={() => implementRecommendation(rec.RecommendationID)}
                          className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold text-sm transition-all hover:scale-105"
                        >
                          ✓ Implement
                        </button>
                      )}
                    </div>

                    <p className="text-white mb-3">{rec.RecommendationText}</p>

                    {rec.EstimatedImpact && (
                      <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3">
                        <p className="text-green-200 text-sm font-semibold">📈 Estimated Impact:</p>
                        <p className="text-white text-sm">{rec.EstimatedImpact}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
