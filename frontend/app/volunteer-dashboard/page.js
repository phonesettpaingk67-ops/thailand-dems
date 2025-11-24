'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VolunteerDashboard() {
  const router = useRouter();
  const [volunteer, setVolunteer] = useState(null);
  const [myAssignments, setMyAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    HoursWorked: '',
    Notes: ''
  });

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('dems_user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'volunteer') {
      router.push('/login');
      return;
    }

    // Load volunteer data
    fetchVolunteerData(user.volunteerId);
  }, [router]);

  const fetchVolunteerData = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/${id}`);
      const data = await response.json();
      setVolunteer(data);
      fetchMyAssignments(id);
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
      setLoading(false);
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
          HoursWorked: updateForm.HoursWorked || selectedAssignment.HoursWorked,
          Notes: updateForm.Notes || selectedAssignment.Notes
        })
      });
      alert('Assignment updated successfully!');
      setSelectedAssignment(null);
      setUpdateForm({ HoursWorked: '', Notes: '' });
      fetchMyAssignments(volunteer.VolunteerID);
    } catch (error) {
      alert('Error updating assignment');
    }
  };

  const handleMarkComplete = async (assignmentId) => {
    if (confirm('Mark this assignment as completed?')) {
      try {
        await fetch(`http://localhost:5000/api/volunteers/assignments/${assignmentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Status: 'Completed',
            CompletedDate: new Date().toISOString().split('T')[0]
          })
        });
        alert('Assignment marked as completed!');
        fetchMyAssignments(volunteer.VolunteerID);
      } catch (error) {
        alert('Error completing assignment');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dems_user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!volunteer) {
    return null;
  }

  const activeAssignments = myAssignments.filter(a => a.Status === 'Active');
  const completedAssignments = myAssignments.filter(a => a.Status === 'Completed');
  const totalHours = myAssignments.reduce((sum, a) => sum + (a.HoursWorked || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🤝 Volunteer Dashboard
              </h1>
              <p className="text-white/80 text-lg">Welcome, {volunteer.FullName}!</p>
              <p className="text-white/60 text-sm">ID: {volunteer.VolunteerID} | {volunteer.Email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Active Assignments</div>
            <div className="text-4xl font-bold text-white">{activeAssignments.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Completed</div>
            <div className="text-4xl font-bold text-white">{completedAssignments.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Total Hours</div>
            <div className="text-4xl font-bold text-white">{totalHours}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20">
            <div className="text-white/70 text-sm mb-2">Status</div>
            <div className={`text-2xl font-bold ${
              volunteer.AvailabilityStatus === 'Available' ? 'text-green-400' :
              volunteer.AvailabilityStatus === 'Deployed' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {volunteer.AvailabilityStatus}
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📋 My Assignments</h2>
          
          {myAssignments.length === 0 ? (
            <div className="text-white/70 text-center py-8">
              No assignments yet. Check back later!
            </div>
          ) : (
            <div className="space-y-4">
              {myAssignments.map(assignment => (
                <div
                  key={assignment.AssignmentID}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {assignment.DisasterName || `Disaster #${assignment.DisasterID}`}
                      </h3>
                      <p className="text-white/70">Role: {assignment.Role}</p>
                      {assignment.ShelterName && (
                        <p className="text-white/60 text-sm">Shelter: {assignment.ShelterName}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      assignment.Status === 'Active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      assignment.Status === 'Completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {assignment.Status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-white/60">Assigned:</span>
                      <span className="text-white ml-2">
                        {new Date(assignment.AssignedDate).toLocaleDateString()}
                      </span>
                    </div>
                    {assignment.CompletedDate && (
                      <div>
                        <span className="text-white/60">Completed:</span>
                        <span className="text-white ml-2">
                          {new Date(assignment.CompletedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-white/60">Hours Worked:</span>
                      <span className="text-white ml-2">{assignment.HoursWorked || 0} hrs</span>
                    </div>
                  </div>

                  {assignment.Notes && (
                    <div className="bg-white/5 rounded p-2 mb-3">
                      <p className="text-white/80 text-sm">{assignment.Notes}</p>
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
                        className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg transition"
                      >
                        📝 Update Progress
                      </button>
                      <button
                        onClick={() => handleMarkComplete(assignment.AssignmentID)}
                        className="px-4 py-2 bg-green-500/80 hover:bg-green-600 text-white rounded-lg transition"
                      >
                        ✅ Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Update Assignment Progress</h3>
            <form onSubmit={handleUpdateAssignment}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Hours Worked
                </label>
                <input
                  type="number"
                  value={updateForm.HoursWorked}
                  onChange={(e) => setUpdateForm({ ...updateForm, HoursWorked: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  step="0.5"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Notes
                </label>
                <textarea
                  value={updateForm.Notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, Notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
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
