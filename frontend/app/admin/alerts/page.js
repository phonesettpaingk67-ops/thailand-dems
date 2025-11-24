'use client';
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPause } from 'react-icons/fi';
import Link from 'next/link';

export default function AlertManagement() {
  const [alerts, setAlerts] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', severity: 'all' });
  
  const [formData, setFormData] = useState({
    AlertType: 'Early Warning',
    Severity: 'Warning',
    Title: '',
    Message: '',
    AffectedRegion: '',
    IssuedBy: '',
    ExpiresAt: '',
    DisasterID: ''
  });

  const alertTypes = ['Early Warning', 'Evacuation', 'All Clear', 'Supply Request', 'Volunteer Needed', 'Other'];
  const severityLevels = ['Info', 'Warning', 'Critical', 'Emergency'];
  const statusOptions = ['all', 'Active', 'Expired', 'Cancelled'];

  useEffect(() => {
    fetchAlerts();
    fetchDisasters();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      let url = 'http://localhost:5000/api/alerts';
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.severity !== 'all') params.append('severity', filter.severity);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisasters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/disasters?status=Active');
      const data = await response.json();
      setDisasters(data);
    } catch (error) {
      console.error('Error fetching disasters:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingAlert 
        ? `http://localhost:5000/api/alerts/${editingAlert.AlertID}`
        : 'http://localhost:5000/api/alerts';
      
      const method = editingAlert ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          DisasterID: formData.DisasterID || null,
          ExpiresAt: formData.ExpiresAt || null
        })
      });

      if (response.ok) {
        fetchAlerts();
        resetForm();
        alert(editingAlert ? 'Alert updated successfully!' : 'Alert created successfully!');
      }
    } catch (error) {
      console.error('Error saving alert:', error);
      alert('Error saving alert');
    }
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      AlertType: alert.AlertType,
      Severity: alert.Severity,
      Title: alert.Title,
      Message: alert.Message,
      AffectedRegion: alert.AffectedRegion,
      IssuedBy: alert.IssuedBy,
      ExpiresAt: alert.ExpiresAt ? alert.ExpiresAt.split('T')[0] : '',
      DisasterID: alert.DisasterID || ''
    });
    setShowForm(true);
  };

  const handleCancel = async (alertId) => {
    if (!confirm('Are you sure you want to cancel this alert?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/alerts/${alertId}/cancel`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchAlerts();
        alert('Alert cancelled successfully!');
      }
    } catch (error) {
      console.error('Error cancelling alert:', error);
    }
  };

  const handleDelete = async (alertId) => {
    if (!confirm('Are you sure you want to delete this alert? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/alerts/${alertId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchAlerts();
        alert('Alert deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      AlertType: 'Early Warning',
      Severity: 'Warning',
      Title: '',
      Message: '',
      AffectedRegion: '',
      IssuedBy: '',
      ExpiresAt: '',
      DisasterID: ''
    });
    setEditingAlert(null);
    setShowForm(false);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Emergency': 'bg-red-500/20 text-red-300 border-red-500/50',
      'Critical': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      'Warning': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      'Info': 'bg-blue-500/20 text-blue-300 border-blue-500/50'
    };
    return colors[severity] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-500/20 text-green-300 border-green-500/50',
      'Expired': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
      'Cancelled': 'bg-red-500/20 text-red-300 border-red-500/50'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-2xl font-bold">Loading alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 group">
              <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
              <span className="font-semibold">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-4xl">🚨</span>
              </div>
              <div>
                <h1 className="text-5xl font-black text-white tracking-tight">Alert Management</h1>
                <p className="text-gray-300 mt-2 text-lg">Create, update, and manage disaster alerts</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">{showForm ? '❌' : '➕'}</span>
            <span>{showForm ? 'Cancel' : 'Create New Alert'}</span>
          </button>
        </div>

        {/* Alert Form */}
        {showForm && (
          <div className="mb-8 glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">{editingAlert ? '✏️' : '📝'}</span>
              </div>
              <h2 className="text-3xl font-black text-white">
                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Alert Type</label>
                <select
                  value={formData.AlertType}
                  onChange={(e) => setFormData({...formData, AlertType: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                  required
                >
                  {alertTypes.map(type => (
                    <option key={type} value={type} className="text-gray-900">{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Severity</label>
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

              <div className="md:col-span-2">
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={formData.Title}
                  onChange={(e) => setFormData({...formData, Title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="Alert title..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Message</label>
                <textarea
                  value={formData.Message}
                  onChange={(e) => setFormData({...formData, Message: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 h-24 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15 resize-none"
                  placeholder="Alert message..."
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Affected Region</label>
                <input
                  type="text"
                  value={formData.AffectedRegion}
                  onChange={(e) => setFormData({...formData, AffectedRegion: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="e.g., Bangkok Metropolitan"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Issued By</label>
                <input
                  type="text"
                  value={formData.IssuedBy}
                  onChange={(e) => setFormData({...formData, IssuedBy: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="e.g., Thai Meteorological Department"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Link to Disaster (Optional)</label>
                <select
                  value={formData.DisasterID}
                  onChange={(e) => setFormData({...formData, DisasterID: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition-all outline-none hover:bg-white/15"
                >
                  <option value="" className="text-gray-900">No disaster link</option>
                  {disasters.map(disaster => (
                    <option key={disaster.DisasterID} value={disaster.DisasterID} className="text-gray-900">
                      {disaster.DisasterName} ({disaster.DisasterType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Expires At (Optional)</label>
                <input
                  type="date"
                  value={formData.ExpiresAt}
                  onChange={(e) => setFormData({...formData, ExpiresAt: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all outline-none hover:bg-white/15"
                />
              </div>

              <div className="md:col-span-2 flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>{editingAlert ? '✅' : '✨'}</span>
                  <span>{editingAlert ? 'Update Alert' : 'Create Alert'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <label className="text-white text-sm font-semibold uppercase tracking-wider block mb-1">Status:</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({...filter, status: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status} className="text-gray-900">
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <label className="text-white text-sm font-semibold uppercase tracking-wider block mb-1">Severity:</label>
                <select
                  value={filter.severity}
                  onChange={(e) => setFilter({...filter, severity: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all outline-none hover:bg-white/15"
                >
                  <option value="all" className="text-gray-900">All Severities</option>
                  {severityLevels.map(level => (
                    <option key={level} value={level} className="text-gray-900">{level}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ml-auto bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-6 py-3 rounded-xl border border-blue-400/30">
              <span className="text-white text-sm font-semibold uppercase tracking-wider">Total Alerts:</span>
              <span className="text-3xl font-black text-white ml-3">{alerts.length}</span>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-12 border border-white/20 text-center shadow-xl">
              <span className="text-6xl mb-4 block">📡</span>
              <p className="text-white text-2xl font-bold">No alerts found</p>
              <p className="text-gray-300 mt-2">Try adjusting your filters or create a new alert</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.AlertID}
                className="group glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.Severity)}`}>
                        {alert.Severity}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(alert.Status)}`}>
                        {alert.Status}
                      </span>
                      <span className="text-gray-300 text-sm">{alert.AlertType}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{alert.Title}</h3>
                    <p className="text-gray-300 mb-3">{alert.Message}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Region:</span>
                        <p className="text-white font-semibold">{alert.AffectedRegion}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Issued By:</span>
                        <p className="text-white font-semibold">{alert.IssuedBy}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Issued At:</span>
                        <p className="text-white font-semibold">
                          {new Date(alert.IssuedAt).toLocaleString()}
                        </p>
                      </div>
                      {alert.ExpiresAt && (
                        <div>
                          <span className="text-gray-400">Expires:</span>
                          <p className="text-white font-semibold">
                            {new Date(alert.ExpiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {alert.DisasterName && (
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Linked Disaster:</span>
                          <p className="text-white font-semibold">
                            {alert.DisasterName} ({alert.DisasterType})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(alert)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Edit Alert"
                    >
                      <FiEdit2 />
                    </button>
                    {alert.Status === 'Active' && (
                      <button
                        onClick={() => handleCancel(alert.AlertID)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-colors"
                        title="Cancel Alert"
                      >
                        <FiPause />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert.AlertID)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete Alert"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
