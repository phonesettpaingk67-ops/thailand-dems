'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/reports${filter !== 'All' ? `?status=${filter}` : ''}`),
        fetch('http://localhost:5000/api/reports/stats')
      ]);
      const reportsData = await reportsRes.json();
      const statsData = await statsRes.json();
      setReports(reportsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (reportId, status) => {
    try {
      await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          Status: status, 
          AdminNotes: adminNotes,
          VerifiedBy: 'Admin' 
        })
      });
      setSelectedReport(null);
      setAdminNotes('');
      fetchData();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const deleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'Severe': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'Minor': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'Escalated': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Dismissed': return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2"><span className="animate-float inline-block">📋</span> User Disaster Reports</h1>
            <p className="text-slate-400">Review and manage citizen-submitted disaster reports</p>
          </div>
          <Link 
            href="/" 
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="glass rounded-2xl animate-fade-in p-4 hover:scale-105 transition-transform">
              <p className="text-2xl font-bold">{stats.totalReports}</p>
              <p className="text-sm text-slate-400">Total Reports</p>
            </div>
            <div className="glass rounded-2xl animate-fade-in bg-yellow-500/20 border-yellow-500/30 p-4 hover:scale-105 transition-transform">
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingReports}</p>
              <p className="text-sm text-slate-400">Pending</p>
            </div>
            <div className="glass rounded-2xl animate-fade-in bg-green-500/20 border-green-500/30 p-4 hover:scale-105 transition-transform">
              <p className="text-2xl font-bold text-green-400">{stats.verifiedReports}</p>
              <p className="text-sm text-slate-400">Verified</p>
            </div>
            <div className="glass rounded-2xl animate-fade-in bg-slate-500/20 border-slate-500/30 p-4 hover:scale-105 transition-transform">
              <p className="text-2xl font-bold text-slate-400">{stats.dismissedReports}</p>
              <p className="text-sm text-slate-400">Dismissed</p>
            </div>
            <div className="glass rounded-2xl animate-fade-in bg-red-500/20 border-red-500/30 p-4 hover:scale-105 transition-transform">
              <p className="text-2xl font-bold text-red-400">{stats.criticalReports}</p>
              <p className="text-sm text-slate-400">Critical</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['All', 'Pending', 'Verified', 'Escalated', 'Dismissed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-all hover:scale-105 ${
                filter === status 
                  ? 'btn-primary' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Reports Table */}
        <div className="glass rounded-2xl animate-fade-in overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left p-4">Reported</th>
                  <th className="text-left p-4">Reporter</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Severity</th>
                  <th className="text-left p-4">Location</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.ReportID} className="border-t border-slate-700 hover:bg-slate-700/30">
                    <td className="p-4">
                      <p className="font-medium">{new Date(report.ReportedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{new Date(report.ReportedAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{report.UserName}</p>
                      <p className="text-xs text-slate-400">{report.UserPhone}</p>
                    </td>
                    <td className="p-4">{report.DisasterType}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.Severity)}`}>
                        {report.Severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <p>{report.ReportedLocation}</p>
                      {report.Latitude && report.Longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${report.Latitude},${report.Longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:underline"
                        >
                          📍 View Map
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.Status)}`}>
                        {report.Status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setAdminNotes(report.AdminNotes || '');
                          }}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Review Report"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => deleteReport(report.ReportID)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Report"
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

        {/* Review Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass bg-slate-800/90 rounded-2xl animate-slide-up p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Review Report #{selectedReport.ReportID}</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-slate-400">Reporter</p>
                  <p className="font-medium">{selectedReport.UserName} - {selectedReport.UserPhone}</p>
                  {selectedReport.UserEmail && <p className="text-sm">{selectedReport.UserEmail}</p>}
                </div>
                
                <div>
                  <p className="text-sm text-slate-400">Disaster Type & Severity</p>
                  <p className="font-medium">{selectedReport.DisasterType} - <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(selectedReport.Severity)}`}>{selectedReport.Severity}</span></p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-400">Location</p>
                  <p className="font-medium">{selectedReport.ReportedLocation}</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-400">Description</p>
                  <p className="bg-slate-700 p-3 rounded">{selectedReport.Description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="input-modern w-full"
                    placeholder="Add notes about this report..."
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(selectedReport.ReportID, 'Verified')}
                  className="flex-1 btn-success px-4 py-2 rounded font-semibold hover:scale-105 transition-transform"
                >
                  ✅ Verify
                </button>
                <button
                  onClick={() => updateStatus(selectedReport.ReportID, 'Escalated')}
                  className="flex-1 btn-warning px-4 py-2 rounded font-semibold hover:scale-105 transition-transform"
                >
                  ⚠️ Escalate
                </button>
                <button
                  onClick={() => updateStatus(selectedReport.ReportID, 'Dismissed')}
                  className="flex-1 bg-slate-500 hover:bg-slate-600 px-4 py-2 rounded font-semibold hover:scale-105 transition-transform"
                >
                  ❌ Dismiss
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-semibold hover:scale-105 transition-transform"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
