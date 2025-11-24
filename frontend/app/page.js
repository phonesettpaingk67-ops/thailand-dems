'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { dashboardAPI, disasterAPI, shelterAPI } from '@/lib/api';

// Dynamically import map to avoid SSR issues
const ThailandDisasterMap = dynamic(
  () => import('@/components/ThailandDisasterMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white text-sm">Loading Map...</p>
        </div>
      </div>
    )
  }
);

export default function DisasterDashboard() {
  const [data, setData] = useState(null);
  const [disasters, setDisasters] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [user, setUser] = useState(null);
  const [showRecentDisasters, setShowRecentDisasters] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('dems_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashResponse, disastersRes, sheltersRes] = await Promise.all([
        dashboardAPI.getStats(),
        disasterAPI.getAll(),
        shelterAPI.getAll()
      ]);
      setData(dashResponse.data);
      setDisasters(disastersRes.data || []);
      setShelters(sheltersRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Dashboard...</p>
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
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      'Catastrophic': 'bg-red-600',
      'Severe': 'bg-orange-600',
      'Moderate': 'bg-yellow-600',
      'Minor': 'bg-blue-600'
    };
    return colors[severity] || 'bg-gray-600';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-red-500',
      'Contained': 'bg-yellow-500',
      'Recovery': 'bg-blue-500',
      'Closed': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getAlertSeverityColor = (severity) => {
    const colors = {
      'Emergency': 'bg-red-600 border-red-400',
      'Critical': 'bg-orange-600 border-orange-400',
      'Warning': 'bg-yellow-600 border-yellow-400',
      'Info': 'bg-blue-600 border-blue-400'
    };
    return colors[severity] || 'bg-gray-600 border-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-start justify-between animate-fade-in">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                <span className="text-3xl">🚨</span>
              </div>
              <div>
                <h1 className="text-5xl font-black text-white mb-1 tracking-tight">
                  Thailand DEMS
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-blue-200 text-lg font-medium ml-20">
              {user?.role === 'admin' 
                ? 'Real-time disaster monitoring and response coordination'
                : 'Stay informed and safe during emergencies'}
            </p>
          </div>
          {user?.role !== 'admin' && (
            <Link 
              href="/report"
              className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white rounded-2xl font-bold transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="text-2xl relative z-10 animate-pulse">📝</span>
              <span className="relative z-10">Report Incident</span>
            </Link>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Active Disasters */}
          <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-red-500/30 animate-slide-up border border-red-400/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Active Emergencies</h3>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-2xl">🔥</span>
                </div>
              </div>
              <p className="text-5xl font-black text-white mb-2">
                {data?.disasters?.activeDisasters || 0}
              </p>
              <p className="text-red-100 text-sm font-medium">
                {user?.role === 'admin' 
                  ? `of ${data?.disasters?.totalDisasters || 0} total disasters`
                  : 'Ongoing situations requiring attention'}
              </p>
            </div>
          </div>

          {user?.role === 'admin' ? (
            /* Catastrophic Events - Admin Only */
            <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 animate-slide-up border border-orange-400/30" style={{animationDelay: '0.1s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Catastrophic</h3>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                <p className="text-5xl font-black text-white mb-2">
                  {data?.disasters?.catastrophicDisasters || 0}
                </p>
                <p className="text-orange-100 text-sm font-medium">Critical severity events</p>
              </div>
            </div>
          ) : (
            /* Available Shelters - Users */
            <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-green-500/30 animate-slide-up border border-green-400/30" style={{animationDelay: '0.1s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Shelters Open</h3>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-2xl">🏠</span>
                  </div>
                </div>
                <p className="text-5xl font-black text-white mb-2">
                  {data?.shelters?.availableShelters || 0}
                </p>
                <p className="text-green-100 text-sm font-medium">
                  Emergency shelters ready to help
                </p>
              </div>
            </div>
          )}

          {user?.role === 'admin' ? (
            /* Affected Population - Admin Only */
            <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 animate-slide-up border border-purple-400/30" style={{animationDelay: '0.2s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Affected People</h3>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <p className="text-5xl font-black text-white mb-2">
                  {(data?.disasters?.totalAffectedPopulation || 0).toLocaleString()}
                </p>
                <p className="text-purple-100 text-sm font-medium">Total population impacted</p>
              </div>
            </div>
          ) : (
            /* Shelter Space Available - Users */
            <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 animate-slide-up border border-cyan-400/30" style={{animationDelay: '0.2s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Shelter Capacity</h3>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-2xl">🛏️</span>
                  </div>
                </div>
                <p className="text-5xl font-black text-white mb-2">
                  {data?.shelters?.availableSpace?.toLocaleString() || 0}
                </p>
                <p className="text-cyan-100 text-sm font-medium">
                  Spaces available for evacuation
                </p>
              </div>
            </div>
          )}

          {/* Emergency Contacts - Users / Shelter Space - Admin */}
          {user?.role === 'admin' ? (
            <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-green-500/30 animate-slide-up border border-green-400/30" style={{animationDelay: '0.2s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Shelter Space</h3>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-2xl">🏠</span>
                  </div>
                </div>
                <p className="text-5xl font-black text-white mb-2">
                  {data?.shelters?.availableSpace?.toLocaleString() || 0}
                </p>
                <p className="text-green-100 text-sm font-medium">
                  available of {data?.shelters?.totalCapacity?.toLocaleString() || 0} total capacity
                </p>
              </div>
            </div>
          ) : (
            <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 animate-slide-up border border-orange-400/30" style={{animationDelay: '0.3s'}}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Emergency Help</h3>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-2xl">📞</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-black text-white">191</p>
                    <p className="text-orange-100 text-xs">Police</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-black text-white">1669</p>
                    <p className="text-orange-100 text-xs">EMS</p>
                  </div>
                </div>
                <p className="text-orange-100 text-xs font-medium mt-2">Call in life-threatening emergencies</p>
              </div>
            </div>
          )}

          {/* Admin-only cards */}
          {user?.role === 'admin' && (
            <>
              {/* Volunteer Force */}
              <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 animate-slide-up border border-blue-400/30" style={{animationDelay: '0.4s'}}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Volunteer Force</h3>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <span className="text-2xl">🙋</span>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-white mb-2">
                    {data?.volunteers?.totalVolunteers || 0}
                  </p>
                  <div className="flex items-center justify-between text-blue-100 text-sm font-medium">
                    <span>✓ {data?.volunteers?.availableVolunteers || 0} available</span>
                    <span>→ {data?.volunteers?.deployedVolunteers || 0} deployed</span>
                  </div>
                </div>
              </div>

              {/* Low Stock Supplies */}
              <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/30 animate-slide-up border border-yellow-400/30" style={{animationDelay: '0.5s'}}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Supply Alerts</h3>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-white mb-2">
                    {data?.supplies?.lowStockItems || 0}
                  </p>
                  <p className="text-yellow-100 text-sm font-medium">Low or out of stock items</p>
                </div>
              </div>

              {/* Shelter Capacity Percentage */}
              <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-teal-500/30 animate-slide-up border border-teal-400/30" style={{animationDelay: '0.6s'}}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Shelter Occupancy</h3>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-white mb-2">
                    {Math.round(((data?.shelters?.totalOccupancy || 0) / (data?.shelters?.totalCapacity || 1)) * 100)}%
                  </p>
                  <p className="text-teal-100 text-sm font-medium">
                    {((data?.shelters?.totalCapacity || 0) - (data?.shelters?.totalOccupancy || 0)).toLocaleString()} spaces remaining
                  </p>
                </div>
              </div>

              {/* User Reports */}
              <div className="card-hover group relative overflow-hidden glass bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 animate-slide-up border border-indigo-400/30" style={{animationDelay: '0.7s'}}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider">Citizen Reports</h3>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>
                  <p className="text-5xl font-black text-white mb-2">
                    {data?.reports?.totalReports || 0}
                  </p>
                  <p className="text-indigo-100 text-sm font-medium">
                    {data?.reports?.newReports || 0} new reports today
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Citizen Quick Access */}
        {user?.role !== 'admin' && (
        <div className="glass rounded-3xl p-8 shadow-2xl mb-12 animate-fade-in border border-slate-600/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <span className="text-3xl">🌐</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Citizen Services</h2>
              <p className="text-slate-300 text-sm">Access disaster information and emergency services</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/disasters" className="group glass bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 transition-all hover:scale-105 border border-red-400/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Disasters</h4>
                  <p className="text-red-200 text-xs">View active</p>
                </div>
              </div>
            </Link>

            <Link href="/weather" className="group glass bg-gradient-to-br from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/30 transition-all hover:scale-105 border border-cyan-400/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <span className="text-xl">🌤️</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Weather</h4>
                  <p className="text-cyan-200 text-xs">Live alerts</p>
                </div>
              </div>
            </Link>

            <Link href="/evacuation" className="group glass bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all hover:scale-105 border border-orange-400/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Evacuation</h4>
                  <p className="text-orange-200 text-xs">Routes & info</p>
                </div>
              </div>
            </Link>

            <Link href="/shelters" className="group glass bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-green-500/30 transition-all hover:scale-105 border border-green-400/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <span className="text-xl">🏠</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Shelters</h4>
                  <p className="text-green-200 text-xs">Find nearby</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        )}

        {/* Command Center - Quick Actions (Admin Only) */}
        {user?.role === 'admin' && (
        <div className="glass rounded-3xl p-8 shadow-2xl mb-12 animate-fade-in border border-slate-600/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <span className="text-3xl">🎯</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Command Center</h2>
              <p className="text-slate-300 text-sm">Quick access to all disaster management systems</p>
            </div>
          </div>

          {/* Admin Operations */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚙️</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Admin Operations</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/disasters" className="group glass bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-red-500/30 transition-all hover:scale-105 border border-red-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-xl">🔥</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Disasters</h4>
                    <p className="text-red-200 text-xs">View & manage</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/alerts" className="group glass bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/30 transition-all hover:scale-105 border border-yellow-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Alerts</h4>
                    <p className="text-yellow-200 text-xs">Manage warnings</p>
                  </div>
                </div>
              </Link>

              <Link href="/supplies" className="group glass bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-green-500/30 transition-all hover:scale-105 border border-green-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-xl">📦</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Supplies</h4>
                    <p className="text-green-200 text-xs">Inventory control</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/reports" className="group glass bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105 border border-purple-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Reports</h4>
                    <p className="text-purple-200 text-xs">Analytics</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Resource Management */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Resource Management</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/volunteers" className="group glass bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105 border border-purple-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Volunteers</h4>
                    <p className="text-purple-200 text-xs">Skills & deployment</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/agencies" className="group glass bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:scale-105 border border-blue-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-xl">🏢</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Agencies</h4>
                    <p className="text-blue-200 text-xs">Partnerships</p>
                  </div>
                </div>
              </Link>

              <Link href="/shelters" className="group glass bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all hover:scale-105 border border-orange-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-xl">🏠</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Shelters</h4>
                    <p className="text-orange-200 text-xs">Multi-tier network</p>
                  </div>
                </div>
              </Link>

              <Link href="/weather" className="group glass bg-gradient-to-br from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-xl p-4 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/30 transition-all hover:scale-105 border border-cyan-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <span className="text-xl">🌤️</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Weather</h4>
                    <p className="text-cyan-200 text-xs">Live alerts</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>


        </div>
        )}

        {/* Thailand Disaster Map */}
        <div id="disaster-map" className="glass rounded-3xl p-8 shadow-2xl mb-12 animate-fade-in border border-slate-600/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <span className="text-3xl">🗺️</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Live Disaster Map</h2>
              <p className="text-blue-300 text-sm">Real-time monitoring across Thailand</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2" style={{ height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
              {disasters.length > 0 && shelters.length > 0 ? (
                <ThailandDisasterMap 
                  disasters={disasters}
                  shelters={shelters}
                  onDisasterClick={(disaster) => {
                    setSelectedDisaster(disaster);
                    setSelectedShelter(null);
                  }}
                  onShelterClick={(shelter) => {
                    setSelectedShelter(shelter);
                    setSelectedDisaster(null);
                  }}
                  selectedDisaster={selectedDisaster}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-white/5 rounded-lg">
                  <p className="text-white text-lg">Loading map data...</p>
                </div>
              )}
            </div>
            {selectedDisaster ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20" style={{ height: '500px' }}>
                <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 px-5 py-3 border-b border-white/20 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Disaster Details</h3>
                  <button 
                    onClick={() => setSelectedDisaster(null)}
                    className="text-white/60 hover:text-white text-2xl leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="p-5 overflow-y-auto" style={{ height: 'calc(500px - 52px)' }}>
                  <div className="space-y-3">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Disaster Name</p>
                    <p className="text-white font-semibold text-lg">{selectedDisaster.DisasterName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Type</p>
                      <p className="text-white font-medium">{selectedDisaster.DisasterType}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Severity</p>
                      <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getSeverityColor(selectedDisaster.Severity)}`}>
                        {selectedDisaster.Severity}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Status</p>
                    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${getStatusColor(selectedDisaster.Status)}`}>
                      {selectedDisaster.Status}
                    </span>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Location</p>
                    <p className="text-white">{selectedDisaster.AffectedRegion}</p>
                    <p className="text-blue-200 text-xs mt-1">
                      📍 {parseFloat(selectedDisaster.Latitude)?.toFixed(4)}, {parseFloat(selectedDisaster.Longitude)?.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Description</p>
                    <p className="text-white text-sm">{selectedDisaster.Description}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Started</p>
                    <p className="text-white text-sm">{new Date(selectedDisaster.StartDate).toLocaleString()}</p>
                  </div>
                  {selectedDisaster.EndDate && (
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Ended</p>
                      <p className="text-white text-sm">{new Date(selectedDisaster.EndDate).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Affected Population</p>
                      <p className="text-white font-bold text-lg">
                        {(selectedDisaster.EstimatedAffectedPopulation || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm mb-1">Estimated Damage</p>
                      <p className="text-white font-bold text-lg">
                        {selectedDisaster.EstimatedDamage >= 1000000 
                          ? `฿${(selectedDisaster.EstimatedDamage / 1000000).toFixed(0)}M`
                          : selectedDisaster.EstimatedDamage >= 1000
                          ? `฿${(selectedDisaster.EstimatedDamage / 1000).toFixed(0)}K`
                          : `฿${(selectedDisaster.EstimatedDamage || 0).toLocaleString()}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            ) : selectedShelter ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20" style={{ height: '500px' }}>
                <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 px-5 py-3 border-b border-white/20 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Shelter Details</h3>
                  <button 
                    onClick={() => setSelectedShelter(null)}
                    className="text-white/60 hover:text-white text-2xl leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="p-5 overflow-y-auto" style={{ height: 'calc(500px - 52px)' }}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-green-200 text-sm mb-1">Shelter Name</p>
                      <p className="text-white font-semibold text-lg">{selectedShelter.ShelterName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-green-200 text-sm mb-1">Type</p>
                        <p className="text-white font-medium">{selectedShelter.ShelterType}</p>
                      </div>
                      <div>
                        <p className="text-green-200 text-sm mb-1">Status</p>
                        <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          selectedShelter.Status === 'Available' ? 'bg-green-600' :
                          selectedShelter.Status === 'Full' ? 'bg-red-600' : 'bg-gray-600'
                        }`}>
                          {selectedShelter.Status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-green-200 text-sm mb-1">Location</p>
                      <p className="text-white">{selectedShelter.Address}</p>
                      <p className="text-white text-sm mt-1">{selectedShelter.City}</p>
                      <p className="text-green-200 text-xs mt-1">
                        📍 {parseFloat(selectedShelter.Latitude)?.toFixed(4)}, {parseFloat(selectedShelter.Longitude)?.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-200 text-sm mb-1">Capacity</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">
                          {selectedShelter.CurrentOccupancy} / {selectedShelter.Capacity}
                        </span>
                        <span className="text-green-200 text-sm">
                          {((selectedShelter.CurrentOccupancy / selectedShelter.Capacity) * 100).toFixed(0)}% Full
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div 
                          style={{ width: `${(selectedShelter.CurrentOccupancy / selectedShelter.Capacity) * 100}%` }}
                          className={`h-full rounded-full ${
                            (selectedShelter.CurrentOccupancy / selectedShelter.Capacity) > 0.9 ? 'bg-red-500' :
                            (selectedShelter.CurrentOccupancy / selectedShelter.Capacity) > 0.7 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        />
                      </div>
                      <p className="text-green-300 text-sm mt-2">
                        🛏️ {selectedShelter.Capacity - selectedShelter.CurrentOccupancy} spaces available
                      </p>
                    </div>
                    {selectedShelter.Facilities && (
                      <div>
                        <p className="text-green-200 text-sm mb-1">Facilities</p>
                        <p className="text-white text-sm">{selectedShelter.Facilities}</p>
                      </div>
                    )}
                    {selectedShelter.ContactPerson && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-green-200 text-sm mb-1">Contact Information</p>
                        <p className="text-white font-medium">{selectedShelter.ContactPerson}</p>
                        {selectedShelter.ContactPhone && (
                          <p className="text-green-300 text-sm mt-1">📞 {selectedShelter.ContactPhone}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/20 flex items-center justify-center" style={{ height: '500px' }}>
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-50">🗺️</div>
                  <p className="text-white/60 text-lg font-semibold">Click on a marker</p>
                  <p className="text-white/40 text-sm mt-2">to view detailed information</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Disasters */}
        <div className="glass rounded-3xl p-8 shadow-2xl mb-12 animate-fade-in border border-slate-600/50">
          <button
            onClick={() => setShowRecentDisasters(!showRecentDisasters)}
            className="w-full flex items-center justify-between text-left group mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white flex items-center">
                  Recent Disasters
                  <span className="ml-3 px-3 py-1 text-base bg-orange-500/30 border border-orange-400 rounded-full text-orange-200 font-semibold">
                    {data?.recentDisasters?.length || 0}
                  </span>
                </h2>
                <p className="text-blue-300 text-sm mt-1">Click on any disaster to view on map</p>
              </div>
            </div>
            <div className={`text-white text-3xl transition-transform duration-300 ${showRecentDisasters ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>
          
          {showRecentDisasters && (
            <div className="overflow-x-auto animate-slide-up">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-blue-200 border-b-2 border-white/20">
                    <th className="pb-4 px-4 font-semibold uppercase text-xs tracking-wider">Disaster</th>
                    <th className="pb-4 px-4 font-semibold uppercase text-xs tracking-wider">Type</th>
                    <th className="pb-4 px-4 font-semibold uppercase text-xs tracking-wider">Region</th>
                    <th className="pb-4 px-4 font-semibold uppercase text-xs tracking-wider">Severity</th>
                    <th className="pb-4 px-4 font-semibold uppercase text-xs tracking-wider">Status</th>
                    <th className="pb-4 px-4 text-right font-semibold uppercase text-xs tracking-wider">Affected</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentDisasters?.map((disaster) => (
                    <tr 
                      key={disaster.DisasterID} 
                      className="border-b border-white/10 hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedDisaster(disaster);
                        document.getElementById('disaster-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <td className="py-4 px-4 text-white font-semibold group-hover:text-blue-300 transition-colors">{disaster.DisasterName}</td>
                      <td className="py-4 px-4 text-slate-300">{disaster.DisasterType}</td>
                      <td className="py-4 px-4 text-slate-300">{disaster.AffectedRegion}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getSeverityColor(disaster.Severity)} shadow-lg`}>
                          {disaster.Severity}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getStatusColor(disaster.Status)} shadow-lg`}>
                          {disaster.Status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-300 font-semibold">
                      {(disaster.EstimatedAffectedPopulation || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Emergency Contact Section */}
        <div className="glass bg-gradient-to-r from-red-600/30 to-orange-600/30 rounded-2xl p-6 shadow-xl border border-red-500/30 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-glow">
                <span className="text-3xl">🚨</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Emergency Hotline</h3>
                <p className="text-red-100 text-sm">Available 24/7 for immediate assistance</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a 
                href="tel:1784" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2">
                <span>📞</span>
                <span>1784</span>
              </a>
              <a 
                href="tel:191" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2">
                <span>🚑</span>
                <span>191</span>
              </a>
              <a 
                href="tel:199" 
                className="bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2">
                <span>🚒</span>
                <span>199</span>
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-red-400/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-red-100">
              <div>
                <span className="font-semibold">1784:</span> National Disaster Warning Center
              </div>
              <div>
                <span className="font-semibold">191:</span> Emergency Medical Services
              </div>
              <div>
                <span className="font-semibold">199:</span> Fire & Rescue Services
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
