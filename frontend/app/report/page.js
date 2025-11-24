'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReportDisaster() {
  const [formData, setFormData] = useState({
    UserName: '',
    UserEmail: '',
    UserPhone: '',
    ReportedLocation: '',
    DisasterType: 'Flood',
    Severity: 'Moderate',
    Description: '',
    Latitude: '',
    Longitude: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          UserName: '',
          UserEmail: '',
          UserPhone: '',
          ReportedLocation: '',
          DisasterType: 'Flood',
          Severity: 'Moderate',
          Description: '',
          Latitude: '',
          Longitude: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
    setSubmitting(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            Latitude: position.coords.latitude.toFixed(6),
            Longitude: position.coords.longitude.toFixed(6)
          });
        },
        (error) => {
          alert('Unable to get your location. Please enter manually.');
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              <span className="animate-float inline-block">🚨</span> Report a Disaster
            </h1>
            <p className="text-slate-400">Help us respond faster by reporting disasters in your area</p>
          </div>
          <Link 
            href="/" 
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span>←</span> Back to Home
          </Link>
        </div>

        {submitted && (
          <div className="glass rounded-2xl animate-slide-up bg-green-500/20 border-green-500 p-4 mb-6">
            <p className="text-green-400 font-semibold">✅ Report submitted successfully! Our team will review it shortly.</p>
          </div>
        )}

        {/* Form */}
        <div className="glass rounded-2xl animate-fade-in p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-cyan-400"><span className="animate-float inline-block">👤</span> Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.UserName}
                    onChange={(e) => setFormData({...formData, UserName: e.target.value})}
                    className="input-modern w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.UserEmail}
                    onChange={(e) => setFormData({...formData, UserEmail: e.target.value})}
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.UserPhone}
                    onChange={(e) => setFormData({...formData, UserPhone: e.target.value})}
                    className="input-modern w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Disaster Details */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-orange-400"><span className="animate-float inline-block">⚠️</span> Disaster Details</h3>
              
              {/* Disaster Type - Card Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Disaster Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'Flood', icon: '🌊', color: 'blue' },
                    { value: 'Earthquake', icon: '🏗️', color: 'red' },
                    { value: 'Fire', icon: '🔥', color: 'orange' },
                    { value: 'Storm', icon: '⛈️', color: 'purple' },
                    { value: 'Landslide', icon: '⛰️', color: 'yellow' },
                    { value: 'Tsunami', icon: '🌊', color: 'cyan' },
                    { value: 'Drought', icon: '☀️', color: 'amber' },
                    { value: 'Other', icon: '⚠️', color: 'gray' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, DisasterType: type.value})}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.DisasterType === type.value
                          ? `bg-${type.color}-500/30 border-${type.color}-400 scale-105 shadow-lg shadow-${type.color}-500/30`
                          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="text-sm font-semibold text-white">{type.value}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity - Card Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Severity Level *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'Minor', label: 'Minor', desc: 'Minimal impact', color: 'green', icon: '✓' },
                    { value: 'Moderate', label: 'Moderate', desc: 'Some damage', color: 'yellow', icon: '⚠️' },
                    { value: 'Severe', label: 'Severe', desc: 'Significant damage', color: 'orange', icon: '⚡' },
                    { value: 'Critical', label: 'Critical', desc: 'Life-threatening', color: 'red', icon: '🚨' }
                  ].map((severity) => (
                    <button
                      key={severity.value}
                      type="button"
                      onClick={() => setFormData({...formData, Severity: severity.value})}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.Severity === severity.value
                          ? `bg-${severity.color}-500/30 border-${severity.color}-400 scale-105 shadow-lg shadow-${severity.color}-500/30`
                          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                      }`}
                    >
                      <div className="text-2xl mb-1">{severity.icon}</div>
                      <div className="text-sm font-bold text-white mb-1">{severity.label}</div>
                      <div className="text-xs text-slate-300">{severity.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400"><span className="animate-float inline-block">📍</span> Location</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Location Description *</label>
                <input
                  type="text"
                  value={formData.ReportedLocation}
                  onChange={(e) => setFormData({...formData, ReportedLocation: e.target.value})}
                  placeholder="e.g., Near Bangkok City Hall, Sukhumvit Road"
                  className="input-modern w-full"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.Latitude}
                    onChange={(e) => setFormData({...formData, Latitude: e.target.value})}
                    placeholder="13.7563"
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.Longitude}
                    onChange={(e) => setFormData({...formData, Longitude: e.target.value})}
                    placeholder="100.5018"
                    className="input-modern w-full"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full btn-success px-4 py-2 rounded-lg hover:scale-105 transition-transform"
                  >
                    📍 Use My Location
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.Description}
                onChange={(e) => setFormData({...formData, Description: e.target.value})}
                rows={5}
                placeholder="Please provide details about the disaster, affected areas, casualties, and any immediate needs..."
                className="input-modern w-full"
                required
              ></textarea>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-danger px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? '⏳ Submitting...' : '🚨 Submit Report'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 glass rounded-2xl animate-fade-in bg-blue-500/20 border-blue-500/50 p-4">
          <h4 className="font-semibold mb-2">ℹ️ Important Information</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Your report will be reviewed by our emergency response team</li>
            <li>• For life-threatening emergencies, call 191 (Police) or 1669 (EMS) immediately</li>
            <li>• Provide as much detail as possible to help us respond effectively</li>
            <li>• False reports may result in legal consequences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
