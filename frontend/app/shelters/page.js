'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiMapPin, FiEye } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const LocationPicker = dynamic(
  () => import('@/components/LocationPicker'),
  { ssr: false }
);

export default function SheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);
  const [viewingShelter, setViewingShelter] = useState(null);
  
  const [formData, setFormData] = useState({
    ShelterName: '',
    ShelterType: 'Temporary',
    Address: '',
    City: '',
    Latitude: '',
    Longitude: '',
    Capacity: '',
    CurrentOccupancy: 0,
    Status: 'Available',
    Facilities: '',
    ContactPerson: '',
    ContactPhone: ''
  });

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/shelters');
      const data = await response.json();
      setShelters(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shelters:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingShelter 
        ? `http://localhost:5000/api/shelters/${editingShelter.ShelterID}`
        : 'http://localhost:5000/api/shelters';
      
      const method = editingShelter ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          Capacity: parseInt(formData.Capacity) || 0,
          CurrentOccupancy: parseInt(formData.CurrentOccupancy) || 0,
          Latitude: parseFloat(formData.Latitude) || null,
          Longitude: parseFloat(formData.Longitude) || null
        })
      });

      if (response.ok) {
        fetchShelters();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving shelter:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this shelter?')) {
      try {
        await fetch(`http://localhost:5000/api/shelters/${id}`, {
          method: 'DELETE'
        });
        fetchShelters();
      } catch (error) {
        console.error('Error deleting shelter:', error);
      }
    }
  };

  const handleEdit = (shelter) => {
    setEditingShelter(shelter);
    setFormData({
      ShelterName: shelter.ShelterName,
      ShelterType: shelter.ShelterType,
      Address: shelter.Address,
      City: shelter.City,
      Latitude: shelter.Latitude || '',
      Longitude: shelter.Longitude || '',
      Capacity: shelter.Capacity,
      CurrentOccupancy: shelter.CurrentOccupancy || 0,
      Status: shelter.Status,
      Facilities: shelter.Facilities || '',
      ContactPerson: shelter.ContactPerson || '',
      ContactPhone: shelter.ContactPhone || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShelter(null);
    setFormData({
      ShelterName: '',
      ShelterType: 'Temporary',
      Address: '',
      City: '',
      Latitude: '',
      Longitude: '',
      Capacity: '',
      CurrentOccupancy: 0,
      Status: 'Available',
      Facilities: '',
      ContactPerson: '',
      ContactPhone: ''
    });
  };

  const filteredShelters = shelters.filter(s =>
    s.ShelterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'Full': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'Closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      case 'Under Maintenance': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white hover:text-gray-300 transition transform hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Shelters Management</h1>
                <p className="text-gray-300">Emergency shelter network and capacity management</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
            >
              <FiPlus /> Add Shelter
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30"
          >
            <div className="text-blue-300 text-sm mb-2">Total Shelters</div>
            <div className="text-3xl font-bold text-white">{shelters.length}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30"
          >
            <div className="text-green-300 text-sm mb-2">Available</div>
            <div className="text-3xl font-bold text-white">
              {shelters.filter(s => s.Status === 'Available').length}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
          >
            <div className="text-purple-300 text-sm mb-2">Total Capacity</div>
            <div className="text-3xl font-bold text-white">
              {shelters.reduce((sum, s) => sum + (s.Capacity || 0), 0).toLocaleString()}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg rounded-xl p-6 border border-orange-500/30"
          >
            <div className="text-orange-300 text-sm mb-2">Current Occupancy</div>
            <div className="text-3xl font-bold text-white">
              {shelters.reduce((sum, s) => sum + (s.CurrentOccupancy || 0), 0).toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search shelters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Shelters Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Shelter Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Capacity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Occupancy</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                      Loading shelters...
                    </td>
                  </tr>
                ) : filteredShelters.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                      No shelters found
                    </td>
                  </tr>
                ) : (
                  filteredShelters.map((shelter) => (
                    <tr key={shelter.ShelterID} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{shelter.ShelterName}</td>
                      <td className="px-6 py-4 text-gray-300">{shelter.ShelterType}</td>
                      <td className="px-6 py-4 text-gray-300">
                        <div className="flex items-center gap-1">
                          <FiMapPin className="text-gray-400" size={14} />
                          {shelter.City}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{shelter.Capacity?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {shelter.CurrentOccupancy || 0}
                        <span className="text-xs text-gray-500 ml-1">
                          ({shelter.Capacity ? Math.round((shelter.CurrentOccupancy || 0) / shelter.Capacity * 100) : 0}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shelter.Status)}`}>
                          {shelter.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {shelter.ContactPerson || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingShelter(shelter)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleEdit(shelter)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(shelter.ShelterID)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass bg-slate-900/95 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl my-8 custom-scrollbar"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">{editingShelter ? '✏️' : '🏠'}</span>
                    {editingShelter ? 'Edit Shelter' : 'Add New Shelter'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:text-white text-2xl transition-colors"
                  >
                    <FiX size={28} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📋</span> Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">
                      Shelter Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ShelterName}
                      onChange={(e) => setFormData({ ...formData, ShelterName: e.target.value })}
                      placeholder="e.g., Central Bangkok Emergency Shelter"
                      className="input-modern w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Shelter Type *
                      </label>
                      <select
                        required
                        value={formData.ShelterType}
                        onChange={(e) => setFormData({ ...formData, ShelterType: e.target.value })}
                        className="input-modern w-full"
                      >
                        <option value="Temporary" className="text-gray-900">🏕️ Temporary</option>
                        <option value="Permanent" className="text-gray-900">🏛️ Permanent</option>
                        <option value="Evacuation Center" className="text-gray-900">🚨 Evacuation Center</option>
                        <option value="Relief Camp" className="text-gray-900">⛺ Relief Camp</option>
                        <option value="Community Center" className="text-gray-900">🏘️ Community Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Status
                      </label>
                      <select
                        value={formData.Status}
                        onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                        className="input-modern w-full"
                      >
                        <option value="Available" className="text-gray-900">🟢 Available</option>
                        <option value="Full" className="text-gray-900">🔴 Full</option>
                        <option value="Closed" className="text-gray-900">⚪ Closed</option>
                        <option value="Under Maintenance" className="text-gray-900">🔧 Under Maintenance</option>
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
                    <label className="block text-slate-200 text-sm font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.City}
                      onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                      placeholder="e.g., Bangkok"
                      className="input-modern w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.Address}
                      onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                      placeholder="Full street address"
                      className="input-modern w-full"
                    />
                  </div>

                  <LocationPicker
                    initialLocation={
                      formData.Latitude && formData.Longitude
                        ? {
                            latitude: parseFloat(formData.Latitude),
                            longitude: parseFloat(formData.Longitude),
                            name: formData.ShelterName || formData.City
                          }
                        : null
                    }
                    onLocationSelect={(location) => {
                      if (location) {
                        setFormData({
                          ...formData,
                          Latitude: location.latitude,
                          Longitude: location.longitude,
                          City: location.province || formData.City,
                          Address: location.address || formData.Address
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

                {/* Capacity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>👥</span> Capacity
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Total Capacity *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.Capacity}
                        onChange={(e) => setFormData({ ...formData, Capacity: e.target.value })}
                        placeholder="Maximum number of people"
                        className="input-modern w-full"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Current Occupancy
                      </label>
                      <input
                        type="number"
                        value={formData.CurrentOccupancy}
                        onChange={(e) => setFormData({ ...formData, CurrentOccupancy: e.target.value })}
                        placeholder="Current number of people"
                        className="input-modern w-full"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Facilities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📞</span> Contact & Facilities
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={formData.ContactPerson}
                        onChange={(e) => setFormData({ ...formData, ContactPerson: e.target.value })}
                        placeholder="Name of contact person"
                        className="input-modern w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.ContactPhone}
                        onChange={(e) => setFormData({ ...formData, ContactPhone: e.target.value })}
                        placeholder="Phone number"
                        className="input-modern w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">
                      Available Facilities
                    </label>
                    <textarea
                      value={formData.Facilities}
                      onChange={(e) => setFormData({ ...formData, Facilities: e.target.value })}
                      rows="3"
                      placeholder="e.g., Medical station, Meals, Showers, WiFi, Sleeping mats"
                      className="input-modern w-full resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-white/20">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>{editingShelter ? '💾' : '➕'}</span>
                    {editingShelter ? 'Update' : 'Create'} Shelter
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* View Details Modal */}
        {viewingShelter && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass bg-slate-900/95 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl custom-scrollbar"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/20 bg-gradient-to-r from-orange-500/20 to-red-500/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">🏠</span>
                    {viewingShelter.ShelterName}
                  </h2>
                  <button
                    onClick={() => setViewingShelter(null)}
                    className="text-slate-400 hover:text-white text-2xl transition-colors"
                  >
                    <FiX size={28} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewingShelter.Status)}`}>
                    {viewingShelter.Status}
                  </span>
                  <span className="text-slate-300 text-sm">• {viewingShelter.ShelterType}</span>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Location Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <span>📍</span> Location Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                    <div>
                      <p className="text-sm text-slate-400">Address</p>
                      <p className="font-medium">{viewingShelter.Address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">City</p>
                      <p className="font-medium">{viewingShelter.City}</p>
                    </div>
                    {viewingShelter.Latitude && viewingShelter.Longitude && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-400">Coordinates</p>
                        <p className="font-medium">{viewingShelter.Latitude}, {viewingShelter.Longitude}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Capacity Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <span>👥</span> Capacity Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-sm text-blue-300">Total Capacity</p>
                      <p className="text-2xl font-bold text-white">{viewingShelter.Capacity}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-sm text-yellow-300">Current Occupancy</p>
                      <p className="text-2xl font-bold text-white">{viewingShelter.CurrentOccupancy || 0}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-sm text-green-300">Available Space</p>
                      <p className="text-2xl font-bold text-white">{viewingShelter.Capacity - (viewingShelter.CurrentOccupancy || 0)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                      <span>Occupancy Rate</span>
                      <span>{Math.round(((viewingShelter.CurrentOccupancy || 0) / viewingShelter.Capacity) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(((viewingShelter.CurrentOccupancy || 0) / viewingShelter.Capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <span>🏥</span> Available Facilities
                  </h3>
                  {viewingShelter.Facilities ? (
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-slate-300 whitespace-pre-line">{viewingShelter.Facilities}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No facilities information available</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <span>📞</span> Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                    <div>
                      <p className="text-sm text-slate-400">Contact Person</p>
                      <p className="font-medium">{viewingShelter.ContactPerson || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Phone Number</p>
                      <p className="font-medium">{viewingShelter.ContactPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="pt-4 border-t border-white/20">
                  <button
                    onClick={() => setViewingShelter(null)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
  );
}
