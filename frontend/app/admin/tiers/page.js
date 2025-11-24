'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TiersPage() {
  const [disasters, setDisasters] = useState([]);
  const [tierDefinitions, setTierDefinitions] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [escalationHistory, setEscalationHistory] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [disastersRes, defsRes] = await Promise.all([
        fetch('http://localhost:5000/api/disasters'),
        fetch('http://localhost:5000/api/tiers/definitions')
      ]);

      const disastersData = await disastersRes.json();
      const defsData = await defsRes.json();

      const disastersArray = Array.isArray(disastersData) ? disastersData : [];
      const defsArray = Array.isArray(defsData) ? defsData : [];

      setDisasters(disastersArray);
      setTierDefinitions(defsArray);

      if (disastersArray.length > 0) {
        selectDisaster(disastersArray[0].DisasterID);
      }
    } catch (error) {
      console.error('Error:', error);
      setDisasters([]);
      setTierDefinitions([]);
    } finally {
      setLoading(false);
    }
  };

  const selectDisaster = async (disasterId) => {
    setSelectedDisaster(disasterId);
    try {
      const [evalRes, historyRes, deploymentsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/tiers/disasters/${disasterId}/evaluate`),
        fetch(`http://localhost:5000/api/tiers/disasters/${disasterId}/history`),
        fetch(`http://localhost:5000/api/tiers/disasters/${disasterId}/deployments`)
      ]);

      const evalData = await evalRes.json();
      const historyData = await historyRes.json();
      const deploymentsData = await deploymentsRes.json();

      setEvaluation(evalData);
      setEscalationHistory(Array.isArray(historyData) ? historyData : []);
      setDeployments(Array.isArray(deploymentsData) ? deploymentsData : []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const escalateTier = async (disasterId) => {
    const reason = prompt('Enter escalation reason:');
    if (!reason) return;

    try {
      await fetch(`http://localhost:5000/api/tiers/disasters/${disasterId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ EscalationReason: reason })
      });
      selectDisaster(disasterId);
      alert('Tier escalated successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      1: 'from-blue-500 to-cyan-500',
      2: 'from-yellow-500 to-orange-500',
      3: 'from-orange-500 to-red-500',
      4: 'from-red-500 to-pink-500'
    };
    return colors[tier] || 'from-gray-500 to-gray-600';
  };

  const getTierName = (tier) => {
    const names = { 1: 'Local', 2: 'Regional', 3: 'National', 4: 'International' };
    return names[tier] || 'Unknown';
  };

  const getTierIcon = (tier) => {
    const icons = { 1: '🏘️', 2: '🌆', 3: '🇹🇭', 4: '🌍' };
    return icons[tier] || '❓';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-2xl font-bold">Loading tiers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 mb-4 group">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                <span className="text-4xl">⚡</span>
              </div>
              <div>
                <h1 className="text-5xl font-black text-white tracking-tight">Emergency Response Tiers</h1>
                <p className="text-gray-300 mt-2 text-lg">Auto-escalation based on disaster severity</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-white font-semibold transition-all hover:scale-105"
            >
              <span className="text-xl mr-2">💡</span>
              How It Works
            </button>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="glass bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 mb-8 border border-blue-400/30 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-3">How Response Tiers Work</h3>
                <div className="space-y-3 text-gray-200">
                  <p><strong className="text-white">🏘️ Tier 1 - Local Response:</strong> Small-scale incidents handled by local authorities (district level). Resources: local shelters, community volunteers.</p>
                  <p><strong className="text-white">🌆 Tier 2 - Regional Response:</strong> Medium disasters affecting multiple districts. Provincial resources activated, DDPM provincial support deployed.</p>
                  <p><strong className="text-white">🇹🇭 Tier 3 - National Response:</strong> Major disasters requiring national coordination. Military, national agencies, and extensive resources mobilized.</p>
                  <p><strong className="text-white">🌍 Tier 4 - International Response:</strong> Catastrophic events needing UN/international aid. Full national resources + foreign assistance.</p>
                  <p className="pt-2 border-t border-blue-400/30"><strong className="text-white">⚡ Auto-Escalation:</strong> System automatically suggests tier upgrades when affected population or damage exceeds thresholds (e.g., 5,000+ people → Tier 2, 50,000+ → Tier 3).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {tierDefinitions.map((tier) => (
            <div
              key={tier.TierLevel}
              className={`glass bg-gradient-to-br ${getTierColor(tier.TierLevel)}/20 rounded-2xl p-6 border ${getTierColor(tier.TierLevel).replace('from-', 'border-').replace(' to-', '').replace('-500', '-400')}/30 shadow-xl hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${getTierColor(tier.TierLevel)} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{getTierIcon(tier.TierLevel)}</span>
                </div>
                <span className="text-3xl font-black text-white">T{tier.TierLevel}</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">{tier.TierName}</h3>
              <p className="text-gray-300 text-sm">{tier.Description}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <label className="text-white text-sm font-semibold uppercase tracking-wider block mb-2">Select Disaster:</label>
              <select
                value={selectedDisaster || ''}
                onChange={(e) => selectDisaster(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-red-400 focus:ring-2 focus:ring-red-400/50 transition-all outline-none hover:bg-white/15"
              >
                {disasters.map(d => (
                  <option key={d.DisasterID} value={d.DisasterID} className="text-gray-900">
                    {d.DisasterType} - {d.Location} (Tier {d.ResponseTier || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => escalateTier(selectedDisaster)}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>🚀</span>
              <span>Escalate Tier</span>
            </button>
          </div>
        </div>

        {evaluation && (
          <div className="mb-8 glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-14 h-14 bg-gradient-to-br ${getTierColor(evaluation.currentTier)} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-3xl">{getTierIcon(evaluation.currentTier)}</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Current Tier: {getTierName(evaluation.currentTier)}</h2>
                <p className="text-gray-300">Level {evaluation.currentTier} Response</p>
              </div>
            </div>

            {evaluation.recommendedTier && evaluation.recommendedTier !== evaluation.currentTier && (
              <div className="bg-orange-500/20 border-2 border-orange-400/50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">⚠️</span>
                  <h3 className="text-2xl font-black text-white">Escalation Recommended</h3>
                </div>
                <p className="text-white mb-3">
                  System recommends escalating to <strong>Tier {evaluation.recommendedTier} ({getTierName(evaluation.recommendedTier)})</strong>
                </p>
                {evaluation.escalationReasons && (
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-orange-200 text-sm font-semibold mb-2">Reasons:</p>
                    <ul className="text-white text-sm space-y-1">
                      {evaluation.escalationReasons.map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-2">Affected Population</p>
                <p className="text-4xl font-black text-white">{evaluation.affectedPopulation || 0}</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-6">
                <p className="text-purple-200 text-sm font-semibold uppercase tracking-wider mb-2">Estimated Damage</p>
                <p className="text-4xl font-black text-white">{evaluation.estimatedDamage || 0}</p>
                <p className="text-purple-300 text-sm mt-1">THB</p>
              </div>

              <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-6">
                <p className="text-orange-200 text-sm font-semibold uppercase tracking-wider mb-2">Active Alerts</p>
                <p className="text-4xl font-black text-white">{evaluation.alertCount || 0}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📜</span>
              </div>
              <h2 className="text-2xl font-black text-white">Escalation History</h2>
            </div>

            <div className="space-y-4">
              {escalationHistory.length === 0 ? (
                <div className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 text-center">
                  <span className="text-4xl mb-2 block">📜</span>
                  <p className="text-white font-bold">No escalations yet</p>
                </div>
              ) : (
                escalationHistory.map((esc) => (
                  <div
                    key={esc.EscalationID}
                    className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getTierColor(esc.FromTier)} rounded-xl flex items-center justify-center`}>
                        <span className="text-xl">{getTierIcon(esc.FromTier)}</span>
                      </div>
                      <span className="text-white text-2xl">→</span>
                      <div className={`w-10 h-10 bg-gradient-to-br ${getTierColor(esc.ToTier)} rounded-xl flex items-center justify-center`}>
                        <span className="text-xl">{getTierIcon(esc.ToTier)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white">
                          Tier {esc.FromTier} → Tier {esc.ToTier}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(esc.EscalationDate).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {esc.Reason && (
                      <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
                        <p className="text-yellow-200 text-sm font-semibold mb-1">Reason:</p>
                        <p className="text-white text-sm">{esc.Reason}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🚁</span>
              </div>
              <h2 className="text-2xl font-black text-white">Tier Deployments</h2>
            </div>

            <div className="space-y-4">
              {deployments.length === 0 ? (
                <div className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 text-center">
                  <span className="text-4xl mb-2 block">🚁</span>
                  <p className="text-white font-bold">No deployments</p>
                </div>
              ) : (
                deployments.map((dep) => (
                  <div
                    key={dep.DeploymentID}
                    className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getTierColor(dep.TierLevel)} rounded-xl flex items-center justify-center`}>
                          <span className="text-xl">🚁</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{dep.ResourceType}</h3>
                          <span className="text-gray-400 text-sm">Tier {dep.TierLevel}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        dep.DeploymentStatus === 'Deployed' ? 'bg-green-600' :
                        dep.DeploymentStatus === 'In Transit' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}>
                        {dep.DeploymentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Quantity:</span>
                        <p className="text-white font-semibold">{dep.Quantity}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Deployed:</span>
                        <p className="text-white font-semibold">
                          {new Date(dep.DeployedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
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
