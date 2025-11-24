'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(
  () => import('@/components/LocationPicker'),
  { 
    ssr: false,
    loading: () => <div className="text-white">Loading location picker...</div>
  }
);

export default function CreateDisaster() {
  const [formData, setFormData] = useState({
    DisasterName: '',
    DisasterType: 'Flood',
    Severity: 'Moderate',
    Description: '',
    AffectedRegion: '',
    Latitude: '',
    Longitude: '',
    StartDate: new Date().toISOString().split('T')[0],
    EstimatedAffectedPopulation: '',
    EstimatedDamage: ''
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const disasterTypes = [
    'Flood', 'Earthquake', 'Tsunami', 'Landslide', 'Fire',
    'Storm', 'Drought', 'Disease Outbreak', 'Industrial Accident', 'Other'
  ];

  const severityLevels = ['Minor', 'Moderate', 'Severe', 'Catastrophic'];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (location) {
      setFormData({
        ...formData,
        AffectedRegion: location.province || location.name,
        Latitude: location.latitude,
        Longitude: location.longitude
      });
    } else {
      setFormData({
        ...formData,
        AffectedRegion: '',
        Latitude: '',
        Longitude: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/disasters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Latitude: parseFloat(formData.Latitude),
          Longitude: parseFloat(formData.Longitude),
          EstimatedAffectedPopulation: parseInt(formData.EstimatedAffectedPopulation) || 0,
          EstimatedDamage: parseFloat(formData.EstimatedDamage) || 0
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        alert('Error creating disaster');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating disaster');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 group">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">🚨</span>
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight">Report New Disaster</h1>
              <p className="text-gray-300 mt-2 text-lg">Fill in the details and select location easily</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400 rounded-2xl text-white backdrop-blur-sm shadow-xl animate-slide-up">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-bold text-lg">Disaster reported successfully!</p>
                <p className="text-green-100 text-sm">An alert has been automatically created. Redirecting...</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="text-3xl font-black text-white">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Disaster Name *</label>
                  <input
                    type="text"
                    value={formData.DisasterName}
                    onChange={(e) => setFormData({...formData, DisasterName: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                    placeholder="e.g., Bangkok Flood 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Disaster Type *</label>
                  <select
                    value={formData.DisasterType}
                    onChange={(e) => setFormData({...formData, DisasterType: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                    required
                  >
                    {disasterTypes.map(type => (
                      <option key={type} value={type} className="text-gray-900">{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Severity *</label>
                  <select
                    value={formData.Severity}
                    onChange={(e) => setFormData({...formData, Severity: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all outline-none hover:bg-white/15"
                    required
                  >
                    {severityLevels.map(level => (
                      <option key={level} value={level} className="text-gray-900">{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Start Date *</label>
                  <input
                    type="date"
                    value={formData.StartDate}
                    onChange={(e) => setFormData({...formData, StartDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.Description}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 h-24 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15 resize-none"
                  placeholder="Describe the disaster situation..."
                />
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📍</span>
                </div>
                <h2 className="text-3xl font-black text-white">Location</h2>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <div className="text-sm text-blue-200">
                  <strong>💡 Easy Location Selection:</strong>
                  <ul className="mt-2 space-y-1 ml-4 list-disc">
                    <li>Type location name (e.g., "Rangsit University", "Bangkok", "Chiang Mai")</li>
                    <li>Click 🗺️ button to pick location by clicking on map</li>
                    <li>We'll automatically fill in coordinates and region</li>
                  </ul>
                </div>
              </div>

              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={selectedLocation}
              />

              {/* Manual Override (Hidden but functional) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2 text-sm">Affected Region</label>
                  <input
                    type="text"
                    value={formData.AffectedRegion}
                    onChange={(e) => setFormData({...formData, AffectedRegion: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                    placeholder="Auto-filled from location"
                    readOnly={!!selectedLocation}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.Latitude}
                    onChange={(e) => setFormData({...formData, Latitude: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                    placeholder="Auto-filled"
                    readOnly={!!selectedLocation}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.Longitude}
                    onChange={(e) => setFormData({...formData, Longitude: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                    placeholder="Auto-filled"
                    readOnly={!!selectedLocation}
                  />
                </div>
              </div>
            </div>

            {/* Impact Estimates */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-3xl font-black text-white">Impact Estimates</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Estimated Affected Population</label>
                  <input
                    type="number"
                    value={formData.EstimatedAffectedPopulation}
                    onChange={(e) => setFormData({...formData, EstimatedAffectedPopulation: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all outline-none hover:bg-white/15"
                    placeholder="Number of people affected"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Estimated Damage (THB)</label>
                  <input
                    type="number"
                    value={formData.EstimatedDamage}
                    onChange={(e) => setFormData({...formData, EstimatedDamage: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all outline-none hover:bg-white/15"
                    placeholder="e.g., 5000000 (5M), 50000000 (50M)"
                  />
                  <p className="text-xs text-gray-300 mt-2 flex items-center gap-1">
                    <span>💡</span>
                    <span>Examples: Small flood 1-5M, Major flood 50-200M, Earthquake 500M-5B</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || !formData.Latitude || !formData.Longitude}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Disaster...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚨</span>
                    <span>Report Disaster</span>
                  </span>
                )}
              </button>
              <Link
                href="/"
                className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl font-bold text-lg transition-all text-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>

            {!formData.Latitude && (
              <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-300 font-semibold flex items-center justify-center gap-2">
                  <span>⚠️</span>
                  <span>Please select a location using the location picker above</span>
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
