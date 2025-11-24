'use client';
import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', status: 'Active' });
  const [showForm, setShowForm] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  
  const [formData, setFormData] = useState({
    AgencyName: '',
    AgencyType: 'Government',
    ContactPerson: '',
    PhoneNumber: '',
    Email: '',
    Address: '',
    Province: '',
    Region: 'Central',
    ResponseCapability: '',
    ActivationTime: 2
  });

  const agencyTypes = ['Government', 'NGO', 'International', 'Private Sector', 'Military', 'Medical'];
  const regions = ['Central', 'North', 'Northeast', 'South', 'East', 'West'];

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, agencies]);

  const fetchAgencies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/agencies');
      const data = await response.json();
      const agenciesArray = Array.isArray(data) ? data : [];
      setAgencies(agenciesArray);
      setFilteredAgencies(agenciesArray);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      setAgencies([]);
      setFilteredAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...agencies];

    if (filter.type !== 'all') {
      filtered = filtered.filter(a => a.AgencyType === filter.type);
    }

    if (filter.status !== 'all') {
      filtered = filtered.filter(a => a.Status === filter.status);
    }

    setFilteredAgencies(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingAgency 
        ? `http://localhost:5000/api/agencies/${editingAgency.AgencyID}`
        : 'http://localhost:5000/api/agencies';
      
      const method = editingAgency ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchAgencies();
        resetForm();
        alert(editingAgency ? 'Agency updated!' : 'Agency created!');
      }
    } catch (error) {
      console.error('Error saving agency:', error);
      alert('Error saving agency');
    }
  };

  const handleEdit = (agency) => {
    setEditingAgency(agency);
    setFormData({
      AgencyName: agency.AgencyName,
      AgencyType: agency.AgencyType,
      ContactPerson: agency.ContactPerson || '',
      PhoneNumber: agency.PhoneNumber || '',
      Email: agency.Email || '',
      Address: agency.Address || '',
      Province: agency.Province || '',
      Region: agency.Region || 'Central',
      ResponseCapability: agency.ResponseCapability || '',
      ActivationTime: agency.ActivationTime || 2
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this agency? This will remove all associated resources and activations.')) return;
    
    try {
      await fetch(`http://localhost:5000/api/agencies/${id}`, { method: 'DELETE' });
      fetchAgencies();
      alert('Agency deleted successfully');
    } catch (error) {
      console.error('Error deleting agency:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      AgencyName: '',
      AgencyType: 'Government',
      ContactPerson: '',
      PhoneNumber: '',
      Email: '',
      Address: '',
      Province: '',
      Region: 'Central',
      ResponseCapability: '',
      ActivationTime: 2
    });
    setEditingAgency(null);
    setShowForm(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      'Government': 'from-blue-500 to-cyan-500',
      'NGO': 'from-green-500 to-emerald-500',
      'International': 'from-purple-500 to-pink-500',
      'Private Sector': 'from-orange-500 to-red-500',
      'Military': 'from-gray-700 to-gray-900',
      'Medical': 'from-red-500 to-pink-500'
    };
    return colors[type] || 'from-gray-500 to-gray-700';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Government': '🏛️',
      'NGO': '🤝',
      'International': '🌍',
      'Private Sector': '🏢',
      'Military': '⚔️',
      'Medical': '⚕️'
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-2xl font-bold">Loading agencies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Development Notice Banner */}
        <div className="mb-6 animate-fade-in">
          <div className="glass bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-2 border-yellow-400/40 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <FiAlertTriangle className="text-white text-2xl" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-yellow-300 mb-2 flex items-center gap-2">
                  🚧 Feature In Development
                </h3>
                <p className="text-yellow-100 text-lg leading-relaxed">
                  The <strong>Partner Agencies</strong> system is currently under development. While you can view and manage agency data, 
                  the full integration with disaster response workflows, resource deployment, and coordination features is not yet complete.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-yellow-400/20 border border-yellow-400/40 rounded-lg text-yellow-200 text-sm font-semibold">
                    📊 Basic CRUD Available
                  </span>
                  <span className="px-4 py-2 bg-orange-400/20 border border-orange-400/40 rounded-lg text-orange-200 text-sm font-semibold">
                    🔧 Workflow Integration Pending
                  </span>
                  <span className="px-4 py-2 bg-amber-400/20 border border-amber-400/40 rounded-lg text-amber-200 text-sm font-semibold">
                    🎯 Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 group">
              <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
              <span className="font-semibold">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                <span className="text-4xl">🏢</span>
              </div>
              <div>
                <h1 className="text-5xl font-black text-white tracking-tight">Partner Agencies</h1>
                <p className="text-gray-300 mt-2 text-lg">
                  Coordinate external organizations providing resources and personnel during disasters
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  🤝 Government agencies, NGOs, international partners & private sector collaboration
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">{showForm ? '❌' : '➕'}</span>
            <span>{showForm ? 'Cancel' : 'Add Agency'}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="glass bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Total Agencies</p>
                <p className="text-4xl font-black text-white mt-2">{agencies.length}</p>
                <p className="text-sm text-blue-200 mt-1">Partner organizations</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-semibold uppercase tracking-wider">Active</p>
                <p className="text-4xl font-black text-white mt-2">
                  {agencies.filter(a => a.Status === 'Active').length}
                </p>
                <p className="text-sm text-green-200 mt-1">Ready to deploy</p>
              </div>
              <div className="w-14 h-14 bg-green-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-semibold uppercase tracking-wider">Government</p>
                <p className="text-4xl font-black text-white mt-2">
                  {agencies.filter(a => a.AgencyType === 'Government').length}
                </p>
                <p className="text-sm text-purple-200 mt-1">Official agencies</p>
              </div>
              <div className="w-14 h-14 bg-purple-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🏛️</span>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-semibold uppercase tracking-wider">NGOs</p>
                <p className="text-4xl font-black text-white mt-2">
                  {agencies.filter(a => a.AgencyType === 'NGO').length}
                </p>
                <p className="text-sm text-orange-200 mt-1">Non-governmental</p>
              </div>
              <div className="w-14 h-14 bg-orange-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🤝</span>
              </div>
            </div>
          </div>

          <div className="glass bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-400/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-sm font-semibold uppercase tracking-wider">International</p>
                <p className="text-4xl font-black text-white mt-2">
                  {agencies.filter(a => a.AgencyType === 'International').length}
                </p>
                <p className="text-sm text-cyan-200 mt-1">Global partners</p>
              </div>
              <div className="w-14 h-14 bg-cyan-500/30 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🌍</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">{editingAgency ? '✏️' : '📝'}</span>
              </div>
              <h2 className="text-3xl font-black text-white">
                {editingAgency ? 'Edit Agency' : 'Add New Agency'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Agency Name *</label>
                <input
                  type="text"
                  value={formData.AgencyName}
                  onChange={(e) => setFormData({...formData, AgencyName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="e.g., Thai Red Cross Society"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Agency Type *</label>
                <select
                  value={formData.AgencyType}
                  onChange={(e) => setFormData({...formData, AgencyType: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                  required
                >
                  {agencyTypes.map(type => (
                    <option key={type} value={type} className="text-gray-900">{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Region</label>
                <select
                  value={formData.Region}
                  onChange={(e) => setFormData({...formData, Region: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                >
                  {regions.map(region => (
                    <option key={region} value={region} className="text-gray-900">{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Contact Person</label>
                <input
                  type="text"
                  value={formData.ContactPerson}
                  onChange={(e) => setFormData({...formData, ContactPerson: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="Director Name"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  value={formData.PhoneNumber}
                  onChange={(e) => setFormData({...formData, PhoneNumber: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="02-xxx-xxxx"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="contact@agency.org"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Province</label>
                <input
                  type="text"
                  value={formData.Province}
                  onChange={(e) => setFormData({...formData, Province: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="Bangkok"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Activation Time (hours)</label>
                <input
                  type="number"
                  value={formData.ActivationTime}
                  onChange={(e) => setFormData({...formData, ActivationTime: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all outline-none hover:bg-white/15"
                  placeholder="2"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Address</label>
                <textarea
                  value={formData.Address}
                  onChange={(e) => setFormData({...formData, Address: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 h-20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15 resize-none"
                  placeholder="Full address..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-white mb-2 font-semibold text-sm uppercase tracking-wider">Response Capability</label>
                <textarea
                  value={formData.ResponseCapability}
                  onChange={(e) => setFormData({...formData, ResponseCapability: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 h-24 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15 resize-none"
                  placeholder="Describe resources, personnel, and capabilities this agency can provide..."
                />
              </div>

              <div className="md:col-span-2 flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>{editingAgency ? '✅' : '✨'}</span>
                  <span>{editingAgency ? 'Update Agency' : 'Create Agency'}</span>
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
                <label className="text-white text-sm font-semibold uppercase tracking-wider block mb-1">Type:</label>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({...filter, type: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all outline-none hover:bg-white/15"
                >
                  <option value="all" className="text-gray-900">All Types</option>
                  {agencyTypes.map(type => (
                    <option key={type} value={type} className="text-gray-900">{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <label className="text-white text-sm font-semibold uppercase tracking-wider block mb-1">Status:</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({...filter, status: e.target.value})}
                  className="px-4 py-2 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all outline-none hover:bg-white/15"
                >
                  <option value="all" className="text-gray-900">All Statuses</option>
                  <option value="Active" className="text-gray-900">Active</option>
                  <option value="Inactive" className="text-gray-900">Inactive</option>
                  <option value="Suspended" className="text-gray-900">Suspended</option>
                </select>
              </div>
            </div>

            <div className="ml-auto bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-6 py-3 rounded-xl border border-blue-400/30">
              <span className="text-white text-sm font-semibold uppercase tracking-wider">Showing:</span>
              <span className="text-3xl font-black text-white ml-3">{filteredAgencies.length}</span>
            </div>
          </div>
        </div>

        {/* Agencies List */}
        <div className="space-y-4">
          {filteredAgencies.length === 0 ? (
            <div className="glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-12 border border-white/20 text-center shadow-xl">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-white text-2xl font-bold">No agencies found</p>
              <p className="text-gray-300 mt-2">Try adjusting your filters or add a new agency</p>
            </div>
          ) : (
            filteredAgencies.map((agency) => (
              <div
                key={agency.AgencyID}
                className="group glass bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getTypeColor(agency.AgencyType)} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <span className="text-3xl">{getTypeIcon(agency.AgencyType)}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white group-hover:text-blue-300 transition-colors">
                          {agency.AgencyName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getTypeColor(agency.AgencyType)}`}>
                            {agency.AgencyType}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            agency.Status === 'Active' ? 'bg-green-500/20 text-green-300 border-green-500/50' : 
                            agency.Status === 'Inactive' ? 'bg-gray-500/20 text-gray-300 border-gray-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'
                          }`}>
                            {agency.Status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      {agency.ContactPerson && (
                        <div>
                          <span className="text-gray-400">Contact:</span>
                          <p className="text-white font-semibold">{agency.ContactPerson}</p>
                        </div>
                      )}
                      {agency.PhoneNumber && (
                        <div>
                          <span className="text-gray-400">Phone:</span>
                          <p className="text-white font-semibold">{agency.PhoneNumber}</p>
                        </div>
                      )}
                      {agency.Province && (
                        <div>
                          <span className="text-gray-400">Province:</span>
                          <p className="text-white font-semibold">{agency.Province}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Activation Time:</span>
                        <p className="text-white font-semibold">⏱️ {agency.ActivationTime || 0} hours</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Deployments:</span>
                        <p className="text-white font-semibold">
                          {agency.ActiveDeployments > 0 ? (
                            <span className="text-green-400">🚀 {agency.ActiveDeployments} active</span>
                          ) : (
                            <span className="text-gray-400">None active</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Resources & Deployment Stats */}
                    {(agency.TotalResources > 0 || agency.TotalDeployments > 0) && (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {agency.TotalResources > 0 && (
                          <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-3">
                            <p className="text-cyan-200 text-xs font-semibold mb-1">📦 Resources</p>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{agency.AvailableResources || 0}</span>
                              <span className="text-cyan-300 text-xs">available</span>
                              <span className="text-gray-400 text-xs">/ {agency.TotalResources}</span>
                            </div>
                          </div>
                        )}
                        {agency.TotalDeployments > 0 && (
                          <>
                            <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3">
                              <p className="text-green-200 text-xs font-semibold mb-1">🚀 Active</p>
                              <p className="text-white text-2xl font-black">{agency.ActiveDeployments || 0}</p>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-3">
                              <p className="text-blue-200 text-xs font-semibold mb-1">✅ Completed</p>
                              <p className="text-white text-2xl font-black">{agency.CompletedDeployments || 0}</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {agency.ResponseCapability && (
                      <div className="mt-4 bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                        <p className="text-blue-200 text-sm font-semibold mb-1">💡 Response Capability:</p>
                        <p className="text-white text-sm">{agency.ResponseCapability}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/admin/agencies/${agency.AgencyID}`}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FiEye />
                    </Link>
                    <button
                      onClick={() => handleEdit(agency)}
                      className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-colors"
                      title="Edit Agency"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(agency.AgencyID)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete Agency"
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
