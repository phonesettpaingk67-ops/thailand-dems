'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import Link from 'next/link';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    Skills: '',
    AvailabilityStatus: 'Available'
  });

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/volunteers');
      const data = await response.json();
      setVolunteers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingVolunteer 
        ? `http://localhost:5000/api/volunteers/${editingVolunteer.VolunteerID}`
        : 'http://localhost:5000/api/volunteers';
      
      const method = editingVolunteer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchVolunteers();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving volunteer:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this volunteer?')) {
      try {
        await fetch(`http://localhost:5000/api/volunteers/${id}`, {
          method: 'DELETE'
        });
        fetchVolunteers();
      } catch (error) {
        console.error('Error deleting volunteer:', error);
      }
    }
  };

  const handleEdit = (volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      FirstName: volunteer.FirstName,
      LastName: volunteer.LastName,
      Email: volunteer.Email,
      Phone: volunteer.Phone,
      Skills: volunteer.Skills || '',
      AvailabilityStatus: volunteer.AvailabilityStatus
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVolunteer(null);
    setFormData({
      FirstName: '',
      LastName: '',
      Email: '',
      Phone: '',
      Skills: '',
      AvailabilityStatus: 'Available'
    });
  };

  const filteredVolunteers = volunteers.filter(v =>
    v.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.LastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-4xl font-bold text-white mb-2">Volunteers Management</h1>
                <p className="text-gray-300">Manage volunteer registrations and assignments</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
            >
              <FiPlus /> Add Volunteer
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
            <div className="text-blue-300 text-sm mb-2">Total Volunteers</div>
            <div className="text-3xl font-bold text-white">{volunteers.length}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30"
          >
            <div className="text-green-300 text-sm mb-2">Available</div>
            <div className="text-3xl font-bold text-white">
              {volunteers.filter(v => v.AvailabilityStatus === 'Available').length}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30"
          >
            <div className="text-yellow-300 text-sm mb-2">Deployed</div>
            <div className="text-3xl font-bold text-white">
              {volunteers.filter(v => v.AvailabilityStatus === 'Deployed').length}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
          >
            <div className="text-purple-300 text-sm mb-2">On Leave</div>
            <div className="text-3xl font-bold text-white">
              {volunteers.filter(v => v.AvailabilityStatus === 'On Leave').length}
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Volunteers Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-white/20"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Skills</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      Loading volunteers...
                    </td>
                  </tr>
                ) : filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      No volunteers found
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer.VolunteerID} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white">
                        {volunteer.FirstName} {volunteer.LastName}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{volunteer.Email}</td>
                      <td className="px-6 py-4 text-gray-300">{volunteer.Phone}</td>
                      <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                        {volunteer.Skills || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          volunteer.AvailabilityStatus === 'Available' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                            : volunteer.AvailabilityStatus === 'Deployed'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                        }`}>
                          {volunteer.AvailabilityStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(volunteer)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(volunteer.VolunteerID)}
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
              className="glass bg-slate-900/95 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl custom-scrollbar"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-4xl">{editingVolunteer ? '✏️' : '🙋'}</span>
                    {editingVolunteer ? 'Edit Volunteer' : 'Add New Volunteer'}
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
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>👤</span> Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.FirstName}
                        onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                        placeholder="Enter first name"
                        className="input-modern w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.LastName}
                        onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                        placeholder="Enter last name"
                        className="input-modern w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📞</span> Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.Email}
                        onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                        placeholder="volunteer@example.com"
                        className="input-modern w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.Phone}
                        onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                        placeholder="+66 XX XXX XXXX"
                        className="input-modern w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills & Availability */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🎯</span> Skills & Availability
                  </h3>
                  
                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">
                      Skills & Certifications
                    </label>
                    <textarea
                      value={formData.Skills}
                      onChange={(e) => setFormData({ ...formData, Skills: e.target.value })}
                      rows="3"
                      placeholder="e.g., First Aid, CPR, Search and Rescue, Medical Training, Communication Skills"
                      className="input-modern w-full resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">Separate skills with commas</p>
                  </div>

                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">
                      Availability Status
                    </label>
                    <select
                      value={formData.AvailabilityStatus}
                      onChange={(e) => setFormData({ ...formData, AvailabilityStatus: e.target.value })}
                      className="input-modern w-full"
                    >
                      <option value="Available" className="text-gray-900">🟢 Available</option>
                      <option value="Deployed" className="text-gray-900">🔴 Deployed</option>
                      <option value="On Leave" className="text-gray-900">🟡 On Leave</option>
                      <option value="Unavailable" className="text-gray-900">⚪ Unavailable</option>
                    </select>
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
                    <span>{editingVolunteer ? '💾' : '➕'}</span>
                    {editingVolunteer ? 'Update' : 'Create'} Volunteer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
  );
}
