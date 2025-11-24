'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { supplyAPI } from '@/lib/api';

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const [formData, setFormData] = useState({
    SupplyName: '',
    Category: 'Water',
    TotalQuantity: '',
    AllocatedQuantity: '0',
    Unit: 'units',
    StorageLocation: '',
    Status: 'Available',
    ExpiryDate: '',
    NoExpiry: false
  });

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const response = await supplyAPI.getAll();
      setSupplies(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch supplies');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSupply(null);
    setFormData({
      SupplyName: '',
      Category: 'Water',
      TotalQuantity: '',
      AllocatedQuantity: '0',
      Unit: 'units',
      StorageLocation: '',
      Status: 'Available',
      ExpiryDate: '',
      NoExpiry: false
    });
    setShowModal(true);
  };

  const handleEdit = (supply) => {
    setEditingSupply(supply);
    setFormData({
      SupplyName: supply.SupplyName || '',
      Category: supply.Category || 'Water',
      TotalQuantity: supply.TotalQuantity || '',
      AllocatedQuantity: supply.AllocatedQuantity || '0',
      Unit: supply.Unit || 'units',
      StorageLocation: supply.StorageLocation || '',
      Status: supply.Status || 'Available',
      ExpiryDate: supply.ExpiryDate ? supply.ExpiryDate.split('T')[0] : '',
      NoExpiry: !supply.ExpiryDate
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supply?')) return;
    
    try {
      await supplyAPI.delete(id);
      fetchSupplies();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete supply');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSupply) {
        await supplyAPI.update(editingSupply.SupplyID, formData);
      } else {
        await supplyAPI.create(formData);
      }
      setShowModal(false);
      fetchSupplies();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save supply');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'bg-green-500/20 text-green-300 border-green-500/50',
      'Low Stock': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      'Out of Stock': 'bg-red-500/20 text-red-300 border-red-500/50',
      'Expired': 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Water': '💧',
      'Food': '🍚',
      'Medical': '⚕️',
      'Blankets': '🛏️',
      'Shelter Materials': '🏕️',
      'Clothing': '👕',
      'Hygiene': '🧼'
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Supplies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-white text-xl">{error}</p>
          <button 
            onClick={fetchSupplies}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const lowStockSupplies = supplies.filter(s => s.Status === 'Low Stock' || s.Status === 'Out of Stock');
  const totalQuantity = supplies.reduce((sum, s) => sum + parseFloat(s.TotalQuantity || 0), 0);
  const allocatedQuantity = supplies.reduce((sum, s) => sum + parseFloat(s.AllocatedQuantity || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Relief Supplies Management
            </h1>
            <p className="text-blue-200">Track and manage emergency relief supplies inventory</p>
          </div>
          <Link 
            href="/" 
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl animate-fade-in p-6 shadow-xl" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-sm font-medium">Total Supply Types</h3>
              <span className="text-3xl animate-float">📦</span>
            </div>
            <p className="text-4xl font-bold text-white">{supplies.length}</p>
          </div>
          
          <div className="glass rounded-2xl animate-fade-in p-6 shadow-xl" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-sm font-medium">Low Stock Items</h3>
              <span className="text-3xl animate-float" style={{animationDelay: '0.2s'}}>⚠️</span>
            </div>
            <p className="text-4xl font-bold text-yellow-400">{lowStockSupplies.length}</p>
          </div>

          <div className="glass rounded-2xl animate-fade-in p-6 shadow-xl" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-sm font-medium">Total Units</h3>
              <span className="text-3xl animate-float" style={{animationDelay: '0.4s'}}>📊</span>
            </div>
            <p className="text-4xl font-bold text-white">{Math.floor(totalQuantity).toLocaleString()}</p>
          </div>

          <div className="glass rounded-2xl animate-fade-in p-6 shadow-xl" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white text-sm font-medium">Allocated</h3>
              <span className="text-3xl animate-float" style={{animationDelay: '0.6s'}}>🚚</span>
            </div>
            <p className="text-4xl font-bold text-blue-400">{Math.floor(allocatedQuantity).toLocaleString()}</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockSupplies.length > 0 && (
          <div className="bg-yellow-600/20 border-l-4 border-yellow-500 p-4 rounded-lg mb-8">
            <h3 className="text-yellow-300 font-bold text-lg mb-2">⚠️ Low Stock Alert</h3>
            <p className="text-yellow-100">
              {lowStockSupplies.length} supply type(s) need restocking urgently.
            </p>
          </div>
        )}

        {/* Supplies Table */}
        <div className="glass rounded-2xl animate-fade-in p-6 shadow-xl" style={{animationDelay: '0.5s'}}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Supply Inventory</h2>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 hover:border-green-500 text-green-300 hover:text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add Supply
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-blue-200 border-b border-white/20">
                  <th className="pb-3 px-4">Supply Name</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Total Quantity</th>
                  <th className="pb-3 px-4">Allocated</th>
                  <th className="pb-3 px-4">Available</th>
                  <th className="pb-3 px-4">Location</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Expiry</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map((supply) => (
                  <tr key={supply.SupplyID} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-white font-medium">
                      {getCategoryIcon(supply.Category)} {supply.SupplyName}
                    </td>
                    <td className="py-3 px-4 text-blue-200">{supply.Category}</td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {Math.floor(parseFloat(supply.TotalQuantity || 0)).toLocaleString()} {supply.Unit}
                    </td>
                    <td className="py-3 px-4 text-blue-200">
                      {Math.floor(parseFloat(supply.AllocatedQuantity || 0)).toLocaleString()} {supply.Unit}
                    </td>
                    <td className="py-3 px-4 text-green-300 font-semibold">
                      {Math.floor(parseFloat(supply.TotalQuantity || 0) - parseFloat(supply.AllocatedQuantity || 0)).toLocaleString()} {supply.Unit}
                    </td>
                    <td className="py-3 px-4 text-blue-200">{supply.StorageLocation}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(supply.Status)}`}>
                        {supply.Status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-blue-200">
                        <span className="text-lg">📅</span>
                        <span className="font-medium">
                          {supply.ExpiryDate ? new Date(supply.ExpiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No Expiry'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(supply)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit Supply"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(supply.SupplyID)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Supply"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass bg-slate-900/95 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl custom-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <span className="text-4xl">{editingSupply ? '✏️' : '📦'}</span>
                  {editingSupply ? 'Edit Supply Item' : 'Add New Supply Item'}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">Supply Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.SupplyName}
                        onChange={(e) => setFormData({...formData, SupplyName: e.target.value})}
                        placeholder="e.g., Bottled Water, First Aid Kit"
                        className="input-modern w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">Category *</label>
                      <select
                        required
                        value={formData.Category}
                        onChange={(e) => setFormData({...formData, Category: e.target.value})}
                        className="input-modern w-full"
                      >
                        <option value="Water" className="text-gray-900">💧 Water</option>
                        <option value="Food" className="text-gray-900">🍱 Food</option>
                        <option value="Medical" className="text-gray-900">💊 Medical</option>
                        <option value="Blankets" className="text-gray-900">🛏️ Blankets</option>
                        <option value="Shelter Materials" className="text-gray-900">🏕️ Shelter Materials</option>
                        <option value="Clothing" className="text-gray-900">👕 Clothing</option>
                        <option value="Hygiene" className="text-gray-900">🧼 Hygiene</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quantity & Storage */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📊</span> Quantity & Storage
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">Total Quantity *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        value={formData.TotalQuantity}
                        onChange={(e) => setFormData({...formData, TotalQuantity: e.target.value})}
                        placeholder="0"
                        className="input-modern w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">Allocated Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.AllocatedQuantity}
                        onChange={(e) => setFormData({...formData, AllocatedQuantity: e.target.value})}
                        placeholder="0"
                        className="input-modern w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">Unit *</label>
                      <input
                        type="text"
                        required
                        value={formData.Unit}
                        onChange={(e) => setFormData({...formData, Unit: e.target.value})}
                        className="input-modern w-full"
                        placeholder="liters, kg, boxes"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-200 text-sm font-medium mb-2">Storage Location</label>
                    <input
                      type="text"
                      value={formData.StorageLocation}
                      onChange={(e) => setFormData({...formData, StorageLocation: e.target.value})}
                      placeholder="e.g., Warehouse A, Section 3"
                      className="input-modern w-full"
                    />
                  </div>
                </div>

                {/* Status & Expiry */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>⏰</span> Status & Expiry
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">Status *</label>
                      <select
                        required
                        value={formData.Status}
                        onChange={(e) => setFormData({...formData, Status: e.target.value})}
                        className="input-modern w-full"
                      >
                        <option value="Available" className="text-gray-900">🟢 Available</option>
                        <option value="Low Stock" className="text-gray-900">🟡 Low Stock</option>
                        <option value="Out of Stock" className="text-gray-900">🔴 Out of Stock</option>
                        <option value="Expired" className="text-gray-900">⚫ Expired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.ExpiryDate}
                        onChange={(e) => setFormData({...formData, ExpiryDate: e.target.value, NoExpiry: false})}
                        className="input-modern w-full"
                        disabled={formData.NoExpiry}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="noExpiry"
                          checked={formData.NoExpiry}
                          onChange={(e) => setFormData({...formData, NoExpiry: e.target.checked, ExpiryDate: e.target.checked ? '' : formData.ExpiryDate})}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="noExpiry" className="text-sm text-slate-300 cursor-pointer">
                          No expiry date (non-perishable)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-white/20">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>{editingSupply ? '💾' : '➕'}</span>
                    {editingSupply ? 'Update' : 'Create'} Supply
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
