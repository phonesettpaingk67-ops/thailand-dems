'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { disasterAPI, shelterAPI } from '@/lib/api';

// Dynamically import map to avoid SSR issues
const ThailandDisasterMap = dynamic(
  () => import('@/components/ThailandDisasterMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-800 font-semibold">Loading Thailand Map...</p>
        </div>
      </div>
    )
  }
);

const LocationPicker = dynamic(
  () => import('@/components/LocationPicker'),
  { ssr: false }
);

export default function DisastersMapPage() {
  const [disasters, setDisasters] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [filter, setFilter] = useState({ status: '', severity: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDisaster, setEditingDisaster] = useState(null);
  const [user, setUser] = useState(null);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [availableAgencies, setAvailableAgencies] = useState([]);
  const [activeAgencies, setActiveAgencies] = useState([]);
  const [selectedDisasterForAgency, setSelectedDisasterForAgency] = useState(null);
  const [agencyFormData, setAgencyFormData] = useState({
    AgencyID: '',
    ResourcesDeployed: '',
    PersonnelDeployed: '',
    Notes: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('dems_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const [formData, setFormData] = useState({
    DisasterName: '',
    DisasterType: 'Flood',
    Severity: 'Moderate',
    Description: '',
    AffectedRegion: '',
    Latitude: '',
    Longitude: '',
    StartDate: '',
    EndDate: '',
    Status: 'Active',
    EstimatedAffectedPopulation: '',
    EstimatedDamage: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching disasters and shelters...');
      const [disastersRes, sheltersRes] = await Promise.all([
        disasterAPI.getAll(),
        shelterAPI.getAll()
      ]);
      console.log('Disasters fetched:', disastersRes.data);
      console.log('Shelters fetched:', sheltersRes.data);
      setDisasters(disastersRes.data || []);
      setShelters(sheltersRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredDisasters = disasters.filter(d => {
    if (filter.status && d.Status !== filter.status) return false;
    if (filter.severity && d.Severity !== filter.severity) return false;
    if (filter.type && d.DisasterType !== filter.type) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        d.DisasterName?.toLowerCase().includes(search) ||
        d.AffectedRegion?.toLowerCase().includes(search) ||
        d.Description?.toLowerCase().includes(search) ||
        d.DisasterType?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getSeverityColor = (severity) => {
    const colors = {
      'Catastrophic': 'bg-red-500/20 text-red-300 border-red-500/50',
      'Severe': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      'Moderate': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      'Minor': 'bg-blue-500/20 text-blue-300 border-blue-500/50'
    };
    return colors[severity] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-red-500/20 text-red-300 border-red-500/50',
      'Contained': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      'Recovery': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      'Closed': 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  const handleAdd = () => {
    setEditingDisaster(null);
    setFormData({
      DisasterName: '',
      DisasterType: 'Flood',
      Severity: 'Moderate',
      Description: '',
      AffectedRegion: '',
      Latitude: '',
      Longitude: '',
      StartDate: new Date().toISOString().split('T')[0],
      EndDate: '',
      Status: 'Active',
      EstimatedAffectedPopulation: '',
      EstimatedDamage: ''
    });
    setShowModal(true);
  };

  const handleEdit = (disaster) => {
    setEditingDisaster(disaster);
    setFormData({
      DisasterName: disaster.DisasterName || '',
      DisasterType: disaster.DisasterType || 'Flood',
      Severity: disaster.Severity || 'Moderate',
      Description: disaster.Description || '',
      AffectedRegion: disaster.AffectedRegion || '',
      Latitude: disaster.Latitude || '',
      Longitude: disaster.Longitude || '',
      StartDate: disaster.StartDate ? disaster.StartDate.split('T')[0] : '',
      EndDate: disaster.EndDate ? disaster.EndDate.split('T')[0] : '',
      Status: disaster.Status || 'Active',
      EstimatedAffectedPopulation: disaster.EstimatedAffectedPopulation || '',
      EstimatedDamage: disaster.EstimatedDamage || ''
    });
    setShowModal(true);
  };

  const handleActivateAgency = async (disaster) => {
    setSelectedDisasterForAgency(disaster);
    try {
      const [availableRes, activeRes] = await Promise.all([
        fetch(`http://localhost:5000/api/agencies/available?disasterId=${disaster.DisasterID}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dems_token')}` }
        }),
        fetch(`http://localhost:5000/api/agencies/disaster/${disaster.DisasterID}/active`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dems_token')}` }
        })
      ]);
      
      const availableData = await availableRes.json();
      const activeData = await activeRes.json();
      
      setAvailableAgencies(Array.isArray(availableData) ? availableData : []);
      setActiveAgencies(Array.isArray(activeData) ? activeData : []);
      setShowAgencyModal(true);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      alert('Error loading agencies');
    }
  };

  const handleSubmitAgencyActivation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/agencies/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dems_token')}`
        },
        body: JSON.stringify({
          DisasterID: selectedDisasterForAgency.DisasterID,
          ...agencyFormData
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Agency activated successfully!');
        setShowAgencyModal(false);
        setAgencyFormData({
          AgencyID: '',
          ResourcesDeployed: '',
          PersonnelDeployed: '',
          Notes: ''
        });
        // Refresh agencies
        handleActivateAgency(selectedDisasterForAgency);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to activate agency');
      }
    } catch (error) {
      console.error('Error activating agency:', error);
      alert('Error activating agency');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this disaster?')) return;
    try {
      await fetch(`http://localhost:5000/api/disasters/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error deleting disaster');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting disaster:', formData);
      const url = editingDisaster
        ? `http://localhost:5000/api/disasters/${editingDisaster.DisasterID}`
        : 'http://localhost:5000/api/disasters';
      
      const response = await fetch(url, {
        method: editingDisaster ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error response:', error);
        throw new Error(error.error || 'Failed to save disaster');
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      setShowModal(false);
      setEditingDisaster(null);
      setFormData({
        DisasterName: '',
        DisasterType: 'Flood',
        Severity: 'Moderate',
        Description: '',
        AffectedRegion: '',
        Latitude: '',
        Longitude: '',
        StartDate: '',
        EndDate: '',
        Status: 'Active',
        EstimatedAffectedPopulation: '',
        EstimatedDamage: ''
      });
      console.log('Refreshing data...');
      await fetchData();
    } catch (error) {
      console.error('Error saving disaster:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Disaster Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white hover:text-gray-200 transition transform hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="animate-float">🇹🇭</span> Thailand Disaster Map
              </h1>
              <p className="text-sm text-red-100">Real-time disaster locations and affected areas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Active Disasters</p>
            <p className="text-3xl font-bold">{disasters.filter(d => d.Status === 'Active').length}</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={handleAdd}
              className="btn btn-primary flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add Disaster
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2">
              <label className="text-white text-sm font-medium block mb-2">🔍 Search</label>
              <input
                type="text"
                placeholder="Search by name, region, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium block mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="input-modern w-full"
              >
                <option value="" className="bg-slate-800 text-white">All Statuses</option>
                <option value="Active" className="bg-slate-800 text-white">Active</option>
                <option value="Contained" className="bg-slate-800 text-white">Contained</option>
                <option value="Recovery" className="bg-slate-800 text-white">Recovery</option>
                <option value="Closed" className="bg-slate-800 text-white">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-white text-sm font-medium block mb-2">Severity</label>
              <select
                value={filter.severity}
                onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                className="input-modern w-full"
              >
                <option value="" className="bg-slate-800 text-white">All Severities</option>
                <option value="Catastrophic" className="bg-slate-800 text-white">Catastrophic</option>
                <option value="Severe" className="bg-slate-800 text-white">Severe</option>
                <option value="Moderate" className="bg-slate-800 text-white">Moderate</option>
                <option value="Minor" className="bg-slate-800 text-white">Minor</option>
              </select>
            </div>
            <div>
              <label className="text-white text-sm font-medium block mb-2">Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="input-modern w-full"
              >
                <option value="" className="bg-slate-800 text-white">All Types</option>
                <option value="Flood" className="bg-slate-800 text-white">Flood</option>
                <option value="Wildfire" className="bg-slate-800 text-white">Wildfire</option>
                <option value="Tsunami" className="bg-slate-800 text-white">Tsunami</option>
                <option value="Drought" className="bg-slate-800 text-white">Drought</option>
                <option value="Landslide" className="bg-slate-800 text-white">Landslide</option>
                <option value="Industrial Accident" className="bg-slate-800 text-white">Industrial Accident</option>
                <option value="Tornado" className="bg-slate-800 text-white">Tornado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter({ status: '', severity: '', type: '' });
                  setSelectedDisaster(null);
                }}
                className="btn btn-primary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div id="disaster-map" className="lg:col-span-2">
            <div className="glass rounded-2xl p-4 shadow-xl animate-fade-in">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <ThailandDisasterMap
                  disasters={filteredDisasters}
                  shelters={[]}
                  onDisasterClick={(disaster) => {
                    setSelectedDisaster(disaster);
                    document.getElementById(`disaster-${disaster.DisasterID}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  selectedDisaster={selectedDisaster}
                />
              </div>
            </div>
          </div>

          {/* Disaster List */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-4 shadow-xl h-[650px] overflow-y-auto animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h2 className="text-white text-xl font-bold mb-4">
                Disasters ({filteredDisasters.length})
              </h2>
              <div className="space-y-3">
                {filteredDisasters.map((disaster) => (
                  <div
                    key={disaster.DisasterID}
                    id={`disaster-${disaster.DisasterID}`}
                    className={`card-hover bg-white/5 border ${
                      selectedDisaster?.DisasterID === disaster.DisasterID
                        ? 'border-blue-400 bg-white/15 animate-glow'
                        : 'border-white/20'
                    } rounded-xl p-3 transition`}
                  >
                    <div onClick={() => {
                      setSelectedDisaster(disaster);
                      document.getElementById('disaster-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }} className="cursor-pointer">
                      <h3 className="text-white font-semibold mb-2">{disaster.DisasterName}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(disaster.Severity)}`}>
                            {disaster.Severity}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(disaster.Status)}`}>
                            {disaster.Status}
                          </span>
                        </div>
                        <p className="text-blue-200">📍 {disaster.AffectedRegion}</p>
                        <p className="text-gray-300 text-xs">
                          👥 {(disaster.EstimatedAffectedPopulation || 0).toLocaleString()} affected
                        </p>
                        {disaster.EstimatedDamage && (
                          <p className="text-gray-300 text-xs">
                            💰 ฿{(disaster.EstimatedDamage / 1000000).toFixed(0)}M damage
                          </p>
                        )}
                        <p className="text-gray-400 text-xs">
                          {new Date(disaster.StartDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(disaster); }}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit Disaster"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleActivateAgency(disaster); }}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Manage Agencies"
                        >
                          <FiUsers size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(disaster.DisasterID); }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Disaster"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="card-hover glass bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 shadow-xl animate-slide-up">
            <h3 className="text-white text-sm font-medium mb-2">Total Affected</h3>
            <p className="text-4xl font-bold text-white">
              {disasters.reduce((sum, d) => sum + (d.EstimatedAffectedPopulation || 0), 0).toLocaleString()}
            </p>
            <p className="text-red-100 text-xs mt-1">people impacted</p>
          </div>
          <div className="card-hover glass bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 shadow-xl animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h3 className="text-white text-sm font-medium mb-2">Active Shelters</h3>
            <p className="text-4xl font-bold text-white">
              {shelters.filter(s => s.Status === 'Available' || s.Status === 'Full').length}
            </p>
            <p className="text-orange-100 text-xs mt-1">operational</p>
          </div>
          <div className="card-hover glass bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl p-6 shadow-xl animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-white text-sm font-medium mb-2">People Sheltered</h3>
            <p className="text-4xl font-bold text-white">
              {shelters.reduce((sum, s) => sum + (s.CurrentOccupancy || 0), 0).toLocaleString()}
            </p>
            <p className="text-yellow-100 text-xs mt-1">in safe locations</p>
          </div>
          <div className="card-hover glass bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 shadow-xl animate-slide-up" style={{animationDelay: '0.3s'}}>
            <h3 className="text-white text-sm font-medium mb-2">Total Damage</h3>
            <p className="text-4xl font-bold text-white">
              ฿{(disasters.reduce((sum, d) => sum + (parseFloat(d.EstimatedDamage) || 0), 0) / 1000000000).toFixed(1)}B
            </p>
            <p className="text-purple-100 text-xs mt-1">estimated cost</p>
          </div>
        </div>
      </div>

      {/* Agency Activation Modal */}
      {showAgencyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass bg-slate-800/90 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-slide-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              🤝 Activate Partner Agency
              {selectedDisasterForAgency && (
                <span className="block text-lg text-blue-300 font-normal mt-1">
                  for {selectedDisasterForAgency.DisasterName}
                </span>
              )}
            </h2>

            {/* Active Agencies */}
            {activeAgencies.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">
                  🚀 Currently Activated ({activeAgencies.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeAgencies.map(activation => (
                    <div key={activation.ActivationID} className="bg-white/5 border border-white/20 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">{activation.AgencyName}</p>
                          <p className="text-white/60 text-sm">{activation.AgencyType}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          activation.Status === 'Deployed' ? 'bg-green-500' :
                          activation.Status === 'Confirmed' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}>
                          {activation.Status}
                        </span>
                      </div>
                      {activation.ResourcesDeployed && (
                        <p className="text-white/80 text-sm mt-1">📦 {activation.ResourcesDeployed}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activation Form */}
            <form onSubmit={handleSubmitAgencyActivation} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Select Agency *</label>
                <select
                  value={agencyFormData.AgencyID}
                  onChange={(e) => setAgencyFormData({...agencyFormData, AgencyID: e.target.value})}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none"
                  required
                >
                  <option value="" className="text-gray-900">-- Choose an agency --</option>
                  {availableAgencies.map(agency => (
                    <option key={agency.AgencyID} value={agency.AgencyID} className="text-gray-900">
                      {agency.AgencyName} ({agency.AgencyType}) - {agency.AvailableResources || 0} resources available
                    </option>
                  ))}
                </select>
                {availableAgencies.length === 0 && (
                  <p className="text-yellow-400 text-sm mt-1">
                    ⚠️ No available agencies. All agencies may already be activated for this disaster.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Resources to Deploy</label>
                <input
                  type="text"
                  value={agencyFormData.ResourcesDeployed}
                  onChange={(e) => setAgencyFormData({...agencyFormData, ResourcesDeployed: e.target.value})}
                  placeholder="e.g., 2 medical teams, 50 emergency tents"
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Personnel Count</label>
                <input
                  type="number"
                  value={agencyFormData.PersonnelDeployed}
                  onChange={(e) => setAgencyFormData({...agencyFormData, PersonnelDeployed: e.target.value})}
                  placeholder="Number of personnel"
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Deployment Notes</label>
                <textarea
                  value={agencyFormData.Notes}
                  onChange={(e) => setAgencyFormData({...agencyFormData, Notes: e.target.value})}
                  rows={3}
                  placeholder="Additional details about the deployment..."
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={!agencyFormData.AgencyID}
                  className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Request Activation
                </button>
                <button
                  type="button"
                  onClick={() => setShowAgencyModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass bg-slate-900/95 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl animate-slide-up custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">{editingDisaster ? '✏️' : '➕'}</span>
                {editingDisaster ? 'Edit Disaster Event' : 'Add New Disaster Event'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-2xl transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📋</span> Basic Information
                </h3>
                
                <div>
                  <label className="block text-slate-200 text-sm font-medium mb-2">Disaster Name *</label>
                  <input
                    type="text"
                    value={formData.DisasterName}
                    onChange={(e) => setFormData({...formData, DisasterName: e.target.value})}
                    className="input-modern w-full"
                    placeholder="e.g., Bangkok Flooding 2025"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">Disaster Type *</label>
                    <select
                      value={formData.DisasterType}
                      onChange={(e) => setFormData({...formData, DisasterType: e.target.value})}
                      className="input-modern w-full"
                      required
                    >
                      <option value="Flood" className="text-gray-900">🌊 Flood</option>
                      <option value="Wildfire" className="text-gray-900">🔥 Wildfire</option>
                      <option value="Tsunami" className="text-gray-900">🌊 Tsunami</option>
                      <option value="Earthquake" className="text-gray-900">🏗️ Earthquake</option>
                      <option value="Drought" className="text-gray-900">☀️ Drought</option>
                      <option value="Landslide" className="text-gray-900">⛰️ Landslide</option>
                      <option value="Storm" className="text-gray-900">⛈️ Storm</option>
                      <option value="Industrial Accident" className="text-gray-900">🏭 Industrial Accident</option>
                      <option value="Tornado" className="text-gray-900">🌪️ Tornado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">Severity *</label>
                    <select
                      value={formData.Severity}
                      onChange={(e) => setFormData({...formData, Severity: e.target.value})}
                      className="input-modern w-full"
                      required
                    >
                      <option value="Minor" className="text-gray-900">🟢 Minor</option>
                      <option value="Moderate" className="text-gray-900">🟡 Moderate</option>
                      <option value="Severe" className="text-gray-900">🟠 Severe</option>
                      <option value="Catastrophic" className="text-gray-900">🔴 Catastrophic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">Status *</label>
                    <select
                      value={formData.Status}
                      onChange={(e) => setFormData({...formData, Status: e.target.value})}
                      className="input-modern w-full"
                      required
                    >
                      <option value="Active" className="text-gray-900">🔴 Active</option>
                      <option value="Contained" className="text-gray-900">🟡 Contained</option>
                      <option value="Recovery" className="text-gray-900">🟢 Recovery</option>
                      <option value="Closed" className="text-gray-900">⚪ Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📍</span> Location
                </h3>
                
                <div>
                  <label className="block text-slate-200 text-sm font-medium mb-2">Affected Region *</label>
                  <input
                    type="text"
                    value={formData.AffectedRegion}
                    onChange={(e) => setFormData({...formData, AffectedRegion: e.target.value})}
                    placeholder="e.g., Bangkok Metropolitan Area"
                    className="input-modern w-full"
                    required
                  />
                </div>

                <LocationPicker
                  initialLocation={
                    formData.Latitude && formData.Longitude
                      ? {
                          latitude: parseFloat(formData.Latitude),
                          longitude: parseFloat(formData.Longitude),
                          name: formData.AffectedRegion
                        }
                      : null
                  }
                  onLocationSelect={(location) => {
                    if (location) {
                      setFormData({
                        ...formData,
                        Latitude: location.latitude,
                        Longitude: location.longitude,
                        AffectedRegion: location.name || formData.AffectedRegion
                      });
                    } else {
                      setFormData({
                        ...formData,
                        Latitude: '',
                        Longitude: ''
                      });
                    }
                  }}
                />
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📅</span> Timeline
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.StartDate}
                      onChange={(e) => setFormData({...formData, StartDate: e.target.value})}
                      className="input-modern w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.EndDate}
                      onChange={(e) => setFormData({...formData, EndDate: e.target.value})}
                      className="input-modern w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📊</span> Impact Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">Affected Population</label>
                    <input
                      type="number"
                      value={formData.EstimatedAffectedPopulation}
                      onChange={(e) => setFormData({...formData, EstimatedAffectedPopulation: e.target.value})}
                      placeholder="Number of people affected"
                      className="input-modern w-full"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">Estimated Damage (฿)</label>
                    <input
                      type="number"
                      value={formData.EstimatedDamage}
                      onChange={(e) => setFormData({...formData, EstimatedDamage: e.target.value})}
                      placeholder="Estimated financial damage"
                      className="input-modern w-full"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📝</span> Description
                </h3>
                
                <textarea
                  value={formData.Description}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  rows={4}
                  placeholder="Provide detailed information about the disaster situation, damages, and response measures..."
                  className="input-modern w-full resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-white/20">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>{editingDisaster ? '💾' : '➕'}</span>
                  {editingDisaster ? 'Update Disaster' : 'Create Disaster'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
