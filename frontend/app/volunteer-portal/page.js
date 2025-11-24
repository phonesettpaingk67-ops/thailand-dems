'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VolunteerPortal() {
  const [volunteer, setVolunteer] = useState(null);
  const [myAssignments, setMyAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [volunteerID, setVolunteerID] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    HoursWorked: '',
    Notes: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/${volunteerID}`);
      const data = await response.json();
      setVolunteer(data);
      fetchMyAssignments(volunteerID);
      setIsLoggedIn(true);
      localStorage.setItem('volunteerID', volunteerID);
    } catch (error) {
      alert('Volunteer not found. Please check your ID.');
    }
  };

  const fetchMyAssignments = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/${id}/assignments`);
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const assignments = await response.json();
      setMyAssignments(assignments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setMyAssignments([]);
      setLoading(false);
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/api/volunteers/assignments/${selectedAssignment.AssignmentID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          HoursWorked: parseInt(updateForm.HoursWorked) || selectedAssignment.HoursWorked,
          Notes: updateForm.Notes || selectedAssignment.Notes
        })
      });
      setSelectedAssignment(null);
      fetchMyAssignments(volunteerID);
      alert('Assignment updated successfully!');
    } catch (error) {
      alert('Error updating assignment');
    }
  };

  const handleCompleteAssignment = async (assignmentID) => {
    if (!confirm('Mark this assignment as completed?')) return;
    try {
      await fetch(`http://localhost:5000/api/volunteers/assignments/${assignmentID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Completed', CompletedDate: new Date().toISOString() })
      });
      fetchMyAssignments(volunteerID);
      alert('Assignment marked as completed!');
    } catch (error) {
      alert('Error completing assignment');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setVolunteer(null);
    setMyAssignments([]);
    setVolunteerID('');
    localStorage.removeItem('volunteerID');
  };

  useEffect(() => {
    const savedID = localStorage.getItem('volunteerID');
    if (savedID) {
      setVolunteerID(savedID);
      handleLogin({ preventDefault: () => {} });
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-2">👥 Volunteer Portal</h1>
          <p className="text-slate-400 mb-6">Login to view your assignments</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Volunteer ID</label>
              <input
                type="number"
                value={volunteerID}
                onChange={(e) => setVolunteerID(e.target.value)}
                placeholder="Enter your volunteer ID"
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-400 hover:underline text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, {volunteer?.FullName}!</h1>
            <p className="text-slate-400">Volunteer ID: {volunteerID} • {volunteer?.Skills}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-400">{myAssignments.filter(a => a.Status === 'Active').length}</p>
            <p className="text-sm text-slate-400">Active Assignments</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-400">{myAssignments.filter(a => a.Status === 'Completed').length}</p>
            <p className="text-sm text-slate-400">Completed</p>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
            <p className="text-2xl font-bold text-purple-400">
              {myAssignments.reduce((sum, a) => sum + (a.HoursWorked || 0), 0)}
            </p>
            <p className="text-sm text-slate-400">Total Hours</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
            <p className="text-2xl font-bold text-orange-400 capitalize">{volunteer?.AvailabilityStatus}</p>
            <p className="text-sm text-slate-400">Status</p>
          </div>
        </div>

        {/* My Assignments */}
        <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">My Assignments</h2>
          
          {myAssignments.length === 0 ? (
            <p className="text-slate-400">No assignments yet</p>
          ) : (
            <div className="space-y-4">
              {myAssignments.map(assignment => (
                <div key={assignment.AssignmentID} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold">{assignment.DisasterName}</h3>
                      <p className="text-blue-300">{assignment.AffectedRegion}</p>
                    </div>
                    <span className={`px-3 py-1 rounded font-semibold ${
                      assignment.Status === 'Active' ? 'bg-green-500' :
                      assignment.Status === 'Completed' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}>
                      {assignment.Status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-slate-400">Role</p>
                      <p className="font-semibold">{assignment.Role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Shelter</p>
                      <p className="font-semibold">{assignment.ShelterName || 'Field Assignment'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Assigned</p>
                      <p className="font-semibold">{new Date(assignment.AssignedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Hours Worked</p>
                      <p className="font-semibold">{assignment.HoursWorked || 0} hrs</p>
                    </div>
                  </div>

                  {assignment.Notes && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-400">Notes</p>
                      <p className="text-sm bg-slate-800 p-2 rounded">{assignment.Notes}</p>
                    </div>
                  )}

                  {assignment.Status === 'Active' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setUpdateForm({
                            HoursWorked: assignment.HoursWorked || '',
                            Notes: assignment.Notes || ''
                          });
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-semibold"
                      >
                        Update Progress
                      </button>
                      <button
                        onClick={() => handleCompleteAssignment(assignment.AssignmentID)}
                        className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-semibold"
                      >
                        Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Update Progress</h3>
              <form onSubmit={handleUpdateAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hours Worked</label>
                  <input
                    type="number"
                    value={updateForm.HoursWorked}
                    onChange={(e) => setUpdateForm({...updateForm, HoursWorked: e.target.value})}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Progress Notes</label>
                  <textarea
                    value={updateForm.Notes}
                    onChange={(e) => setUpdateForm({...updateForm, Notes: e.target.value})}
                    rows={4}
                    placeholder="Add notes about your progress..."
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none"
                  ></textarea>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-semibold"
                  >
                    Save Update
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
