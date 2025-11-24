'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id;

  const [agency, setAgency] = useState(null);
  const [resources, setResources] = useState([]);
  const [activations, setActivations] = useState([]);
  const [mous, setMous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  const [editFormData, setEditFormData] = useState({});
  const [resourceFormData, setResourceFormData] = useState({
    ResourceType: 'Volunteers',
    ResourceName: '',
    Quantity: '',
    Unit: '',
    DeploymentTime: '',
    Notes: ''
  });

  useEffect(() => {
    if (agencyId) {
      fetchAgencyDetails();
    }
  }, [agencyId]);

  const fetchAgencyDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/agencies/${agencyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dems_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch agency details');

      const data = await response.json();
      setAgency(data.agency);
      setResources(data.resources || []);
      setActivations(data.activations || []);
      setMous(data.mous || []);
      setEditFormData(data.agency);
    } catch (error) {
      console.error('Error fetching agency:', error);
      alert('Error loading agency details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAgency = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/agencies/${agencyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dems_token')}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        await fetchAgencyDetails();
        setShowEditModal(false);
        alert('Agency updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update agency');
      }
    } catch (error) {
      console.error('Error updating agency:', error);
      alert('Error updating agency');
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/agencies/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dems_token')}`
        },
        body: JSON.stringify({
          ...resourceFormData,
          AgencyID: agencyId
        })
      });

      if (response.ok) {
        await fetchAgencyDetails();
        setShowResourceModal(false);
        setResourceFormData({
          ResourceType: 'Volunteers',
          ResourceName: '',
          Quantity: '',
          Unit: '',
          DeploymentTime: '',
          Notes: ''
        });
        alert('Resource added successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add resource');
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Error adding resource');
    }
  };

  const handleUpdateResourceStatus = async (resourceId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/agencies/resources/${resourceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dems_token')}`
        },
        body: JSON.stringify({ AvailabilityStatus: newStatus })
      });

      if (response.ok) {
        await fetchAgencyDetails();
        alert('Resource status updated!');
      }
    } catch (error) {
      console.error('Error updating resource status:', error);
      alert('Error updating resource status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-500',
      'Inactive': 'bg-gray-500',
      'Suspended': 'bg-red-500',
      'Available': 'bg-green-500',
      'Deployed': 'bg-blue-500',
      'Reserved': 'bg-yellow-500',
      'Unavailable': 'bg-red-500',
      'Requested': 'bg-yellow-500',
      'Confirmed': 'bg-blue-500',
      'Completed': 'bg-green-500',
      'Cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTypeColor = (type) => {
    const colors = {
      'Government': 'from-blue-500 to-blue-700',
      'NGO': 'from-green-500 to-green-700',
      'International': 'from-purple-500 to-purple-700',
      'Private Sector': 'from-orange-500 to-orange-700',
      'Military': 'from-red-500 to-red-700',
      'Medical': 'from-pink-500 to-pink-700'
    };
    return colors[type] || 'from-gray-500 to-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading agency details...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
        <div className="text-center text-white">
          <p>Agency not found</p>
          <Link href="/admin/agencies" className="text-blue-400 hover:underline mt-4 inline-block">
            ← Back to Agencies
          </Link>
        </div>
      </div>
    );
  }

  const activeDeployments = activations.filter(a => ['Requested', 'Confirmed', 'Deployed'].includes(a.Status)).length;
  const completedDeployments = activations.filter(a => a.Status === 'Completed').length;
  const availableResources = resources.filter(r => r.AvailabilityStatus === 'Available').length;
  const deployedResources = resources.filter(r => r.AvailabilityStatus === 'Deployed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/agencies"
              className="text-white hover:text-blue-300 transition"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-white">
              {agency.AgencyName}
            </h1>
            <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(agency.Status)}`}>
              {agency.Status}
            </span>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            ✏️ Edit Agency
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`glass bg-gradient-to-br ${getTypeColor(agency.AgencyType)} rounded-xl p-4 shadow-xl`}>
            <p className="text-white/80 text-sm">Agency Type</p>
            <p className="text-2xl font-bold text-white">{agency.AgencyType}</p>
          </div>
          <div className="glass bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-4 shadow-xl">
            <p className="text-white/80 text-sm">Active Deployments</p>
            <p className="text-2xl font-bold text-white">{activeDeployments}</p>
          </div>
          <div className="glass bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 shadow-xl">
            <p className="text-white/80 text-sm">Completed Missions</p>
            <p className="text-2xl font-bold text-white">{completedDeployments}</p>
          </div>
          <div className="glass bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl p-4 shadow-xl">
            <p className="text-white/80 text-sm">Available Resources</p>
            <p className="text-2xl font-bold text-white">{availableResources} / {resources.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-xl p-1 mb-4 flex gap-2">
          {['overview', 'resources', 'activations', 'mou'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab === 'overview' && '📋 Overview'}
              {tab === 'resources' && '📦 Resources'}
              {tab === 'activations' && '🚀 Activations'}
              {tab === 'mou' && '📄 MOUs'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agency Profile */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Agency Profile</h2>
              <div className="space-y-3 text-white">
                <div>
                  <p className="text-white/60 text-sm">Contact Person</p>
                  <p className="font-semibold">{agency.ContactPerson || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Phone Number</p>
                  <p className="font-semibold">{agency.PhoneNumber || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <p className="font-semibold">{agency.Email || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Address</p>
                  <p className="font-semibold">{agency.Address || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">Province</p>
                    <p className="font-semibold">{agency.Province || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Region</p>
                    <p className="font-semibold">{agency.Region || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Activation Time</p>
                  <p className="font-semibold">⏱️ {agency.ActivationTime || 24} hours</p>
                </div>
              </div>
            </div>

            {/* Response Capability */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Response Capability</h2>
              <p className="text-white/90 leading-relaxed">
                {agency.ResponseCapability || 'No capability description provided.'}
              </p>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold text-white mb-3">Deployment Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Activations</span>
                    <span className="text-white font-bold">{activations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Success Rate</span>
                    <span className="text-white font-bold">
                      {activations.length > 0 
                        ? Math.round((completedDeployments / activations.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Resource Pool</span>
                    <span className="text-white font-bold">{resources.length} types</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="glass rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Resource Inventory</h2>
              <button
                onClick={() => setShowResourceModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                + Add Resource
              </button>
            </div>

            {resources.length === 0 ? (
              <div className="text-center text-white/60 py-12">
                <p className="text-xl mb-2">📦 No resources yet</p>
                <p className="text-sm">Add resources this agency can provide during disasters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(resource => (
                  <div key={resource.ResourceID} className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{resource.ResourceName}</h3>
                        <p className="text-white/60 text-sm">{resource.ResourceType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getStatusColor(resource.AvailabilityStatus)}`}>
                        {resource.AvailabilityStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-white/80 mb-3">
                      <p>📊 Quantity: <span className="font-semibold">{resource.Quantity} {resource.Unit}</span></p>
                      <p>⏱️ Deploy in: <span className="font-semibold">{resource.DeploymentTime || 'N/A'} hours</span></p>
                      {resource.Notes && (
                        <p className="text-xs text-white/60 mt-2">{resource.Notes}</p>
                      )}
                    </div>
                    <select
                      value={resource.AvailabilityStatus}
                      onChange={(e) => handleUpdateResourceStatus(resource.ResourceID, e.target.value)}
                      className="w-full bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm"
                    >
                      <option value="Available">Available</option>
                      <option value="Deployed">Deployed</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activations' && (
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Activation History</h2>
            
            {activations.length === 0 ? (
              <div className="text-center text-white/60 py-12">
                <p className="text-xl mb-2">🚀 No activations yet</p>
                <p className="text-sm">This agency hasn't been activated for any disasters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activations.map(activation => (
                  <div key={activation.ActivationID} className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{activation.DisasterName}</h3>
                        <p className="text-white/60 text-sm">{activation.DisasterType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-white text-sm font-semibold ${getStatusColor(activation.Status)}`}>
                        {activation.Status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-white/60 text-xs">Requested</p>
                        <p className="text-white text-sm">
                          {new Date(activation.RequestedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {activation.ActivatedAt && (
                        <div>
                          <p className="text-white/60 text-xs">Deployed</p>
                          <p className="text-white text-sm">
                            {new Date(activation.ActivatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {activation.ResourcesDeployed && (
                      <div className="mb-2">
                        <p className="text-white/60 text-xs mb-1">Resources Deployed</p>
                        <p className="text-white text-sm">{activation.ResourcesDeployed}</p>
                      </div>
                    )}

                    {activation.PersonnelDeployed > 0 && (
                      <div className="mb-2">
                        <p className="text-white/60 text-xs">Personnel Deployed</p>
                        <p className="text-white text-sm">👥 {activation.PersonnelDeployed} people</p>
                      </div>
                    )}

                    {activation.Notes && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/60 text-xs mb-1">Notes</p>
                        <p className="text-white/80 text-sm">{activation.Notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mou' && (
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Memorandum of Understanding</h2>
            
            {mous.length === 0 ? (
              <div className="text-center text-white/60 py-12">
                <p className="text-xl mb-2">📄 No MOUs</p>
                <p className="text-sm">No legal agreements on file</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mous.map(mou => (
                  <div key={mou.MOUID} className="bg-white/5 rounded-lg p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold">MOU #{mou.MOUID}</h3>
                        <p className="text-white/60 text-sm">
                          Signed: {new Date(mou.SignedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                        new Date(mou.ExpiryDate) > new Date() ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {new Date(mou.ExpiryDate) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm mb-2">
                      Expires: {new Date(mou.ExpiryDate).toLocaleDateString()}
                    </p>
                    {mou.Terms && (
                      <p className="text-white/70 text-sm">{mou.Terms}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Agency Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass bg-slate-800/90 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Edit Agency</h2>
            <form onSubmit={handleUpdateAgency} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Agency Name</label>
                <input
                  type="text"
                  value={editFormData.AgencyName || ''}
                  onChange={(e) => setEditFormData({...editFormData, AgencyName: e.target.value})}
                  className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Agency Type</label>
                  <select
                    value={editFormData.AgencyType || ''}
                    onChange={(e) => setEditFormData({...editFormData, AgencyType: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                    required
                  >
                    <option value="Government">Government</option>
                    <option value="NGO">NGO</option>
                    <option value="International">International</option>
                    <option value="Private Sector">Private Sector</option>
                    <option value="Military">Military</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Status</label>
                  <select
                    value={editFormData.Status || ''}
                    onChange={(e) => setEditFormData({...editFormData, Status: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editFormData.ContactPerson || ''}
                  onChange={(e) => setEditFormData({...editFormData, ContactPerson: e.target.value})}
                  className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.PhoneNumber || ''}
                    onChange={(e) => setEditFormData({...editFormData, PhoneNumber: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.Email || ''}
                    onChange={(e) => setEditFormData({...editFormData, Email: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Address</label>
                <textarea
                  value={editFormData.Address || ''}
                  onChange={(e) => setEditFormData({...editFormData, Address: e.target.value})}
                  className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  rows="2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Province</label>
                  <input
                    type="text"
                    value={editFormData.Province || ''}
                    onChange={(e) => setEditFormData({...editFormData, Province: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Region</label>
                  <input
                    type="text"
                    value={editFormData.Region || ''}
                    onChange={(e) => setEditFormData({...editFormData, Region: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Activation Time (hrs)</label>
                  <input
                    type="number"
                    value={editFormData.ActivationTime || ''}
                    onChange={(e) => setEditFormData({...editFormData, ActivationTime: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Response Capability</label>
                <textarea
                  value={editFormData.ResponseCapability || ''}
                  onChange={(e) => setEditFormData({...editFormData, ResponseCapability: e.target.value})}
                  className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  rows="3"
                  placeholder="Describe what this agency can provide during disasters..."
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass bg-slate-800/90 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Add Resource</h2>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Resource Type</label>
                <select
                  value={resourceFormData.ResourceType}
                  onChange={(e) => setResourceFormData({...resourceFormData, ResourceType: e.target.value})}
                  className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  required
                >
                  <option value="Volunteers">Volunteers</option>
                  <option value="Shelter Space">Shelter Space</option>
                  <option value="Medical Supplies">Medical Supplies</option>
                  <option value="Food">Food</option>
                  <option value="Water">Water</option>
                  <option value="Transport">Transport</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Financial">Financial</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Resource Name</label>
                <input
                  type="text"
                  value={resourceFormData.ResourceName}
                  onChange={(e) => setResourceFormData({...resourceFormData, ResourceName: e.target.value})}
                  className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  placeholder="e.g., Emergency Medical Team"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    value={resourceFormData.Quantity}
                    onChange={(e) => setResourceFormData({...resourceFormData, Quantity: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={resourceFormData.Unit}
                    onChange={(e) => setResourceFormData({...resourceFormData, Unit: e.target.value})}
                    className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                    placeholder="e.g., personnel, beds"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Deployment Time (hours)</label>
                <input
                  type="number"
                  value={resourceFormData.DeploymentTime}
                  onChange={(e) => setResourceFormData({...resourceFormData, DeploymentTime: e.target.value})}
                  className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  placeholder="How many hours to deploy this resource"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-semibold mb-1">Notes</label>
                <textarea
                  value={resourceFormData.Notes}
                  onChange={(e) => setResourceFormData({...resourceFormData, Notes: e.target.value})}
                  className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                  rows="2"
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
