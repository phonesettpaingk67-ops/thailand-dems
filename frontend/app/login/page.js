'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'roadmap'
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (role === 'admin') {
      if (username === 'admin' && password === 'admin123') {
        const userData = {
          username: 'admin',
          role: 'admin',
          name: 'System Administrator',
          email: 'admin@dems.th'
        };
        localStorage.setItem('dems_user', JSON.stringify(userData));
        window.location.href = '/';
      } else {
        setError('Invalid admin credentials');
        setLoading(false);
      }
    } else {
      const userData = {
        username: 'citizen',
        role: 'user',
        name: 'Public Citizen',
        email: 'user@dems.th'
      };
      localStorage.setItem('dems_user', JSON.stringify(userData));
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layer Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-pink-500/20 to-orange-500/20 animate-gradient"></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' fill='%23fff' opacity='0.4'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slowest"></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={`shape-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-shapes ${15 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            {i % 3 === 0 && (
              <div className="w-4 h-4 border-2 border-white/20 rotate-45 animate-spin-slow"></div>
            )}
            {i % 3 === 1 && (
              <div className="w-3 h-3 bg-white/10 rounded-full animate-ping-slow"></div>
            )}
            {i % 3 === 2 && (
              <div className="w-6 h-6 border-2 border-white/15 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Animated gradient particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ['rgba(59, 130, 246, 0.4)', 'rgba(168, 85, 247, 0.4)', 'rgba(236, 72, 153, 0.4)'][i % 3]
              } 0%, transparent 70%)`,
              animation: `float-particles ${Math.random() * 15 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 50}%`,
              left: '-10px',
              animation: `shooting-star ${3 + Math.random() * 2}s linear infinite`,
              animationDelay: `${i * 5}s`,
              boxShadow: '0 0 20px 2px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full transition-all duration-700 ease-in-out ${
          activeTab === 'roadmap' ? 'max-w-6xl' : 'max-w-md'
        }`}>
          {/* Logo and Title */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="relative inline-block mb-6">
              {/* Glowing ring around logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
              <div className="relative inline-flex items-center justify-center w-28 h-28 bg-white rounded-full shadow-2xl transform hover:scale-110 transition-all duration-500 hover:rotate-12">
                <span className="text-7xl">🚨</span>
              </div>
            </div>
            <h1 className="text-6xl font-black text-white mb-3 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                Thailand DEMS
              </span>
            </h1>
            <p className="text-white/95 text-xl font-semibold tracking-wide mb-2">
              Disaster & Emergency Management System
            </p>
            <p className="text-blue-200 text-sm font-medium">
              Protecting Communities • Saving Lives • Building Resilience
            </p>
            <div className="mt-6 h-1 w-40 mx-auto bg-gradient-to-r from-transparent via-white to-transparent rounded-full opacity-60"></div>
          </div>

          {/* Login Card */}
          <div className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/30 transform hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 group">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200/50 bg-gradient-to-r from-slate-50/80 via-white/60 to-slate-50/80">
              <button
                onClick={() => setActiveTab('login')}
                className={`relative flex-1 py-5 px-6 font-bold text-base transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl transition-transform duration-300 group-hover:scale-110">🔐</span>
                  <span className="tracking-wide">Login</span>
                </div>
                {activeTab === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`relative flex-1 py-5 px-6 font-bold text-base transition-all duration-300 ${
                  activeTab === 'roadmap'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl transition-transform duration-300 group-hover:scale-110">🗺️</span>
                  <span className="tracking-wide">Roadmap</span>
                </div>
                {activeTab === 'roadmap' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full"></div>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">{activeTab === 'login' ? (
                <>
                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-r-xl p-5 animate-shake-smooth shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">⚠️</span>
                        </div>
                        <div>
                          <p className="text-red-900 font-bold text-sm">Authentication Failed</p>
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-5 mb-7">
                    <button
                      type="button"
                      onClick={() => setRole('user')}
                      className={`group relative overflow-hidden rounded-2xl py-6 px-5 font-semibold transition-all duration-500 ${
                        role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white shadow-2xl shadow-blue-500/50 scale-105 ring-4 ring-blue-300/50'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:scale-105 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className={`text-5xl mb-3 transition-transform duration-300 ${role === 'user' ? 'scale-110' : 'group-hover:scale-110'}`}>👤</div>
                        <div className="text-lg font-black tracking-wide">Citizen</div>
                        <div className={`text-xs mt-2 font-medium ${role === 'user' ? 'opacity-90' : 'opacity-70'}`}>Public Access</div>
                      </div>
                      {role === 'user' && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`group relative overflow-hidden rounded-2xl py-6 px-5 font-semibold transition-all duration-500 ${
                        role === 'admin'
                          ? 'bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 text-white shadow-2xl shadow-red-500/50 scale-105 ring-4 ring-red-300/50'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:scale-105 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className={`text-5xl mb-3 transition-transform duration-300 ${role === 'admin' ? 'scale-110' : 'group-hover:scale-110'}`}>🔐</div>
                        <div className="text-lg font-black tracking-wide">Admin</div>
                        <div className={`text-xs mt-2 font-medium ${role === 'admin' ? 'opacity-90' : 'opacity-70'}`}>System Control</div>
                      </div>
                      {role === 'admin' && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-6">
                    {role === 'admin' ? (
                      <>
                        <div className="group">
                          <label className="block text-gray-800 font-bold mb-3 text-sm tracking-wide flex items-center gap-2">
                            <span className="text-blue-600">●</span>
                            Username
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 group-focus-within:scale-110 transition-all duration-300">
                              👤
                            </div>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-gray-800 font-medium"
                              placeholder="Enter your username"
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="group">
                          <label className="block text-gray-700 font-semibold mb-2 text-sm">
                            Password
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl opacity-50 group-focus-within:opacity-100 transition-opacity">
                              🔐
                            </div>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-gray-800 font-medium"
                              placeholder="Enter your password"
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                        <div className="flex items-start space-x-3">
                          <div className="text-3xl">ℹ️</div>
                          <div>
                            <p className="text-blue-900 font-semibold mb-1">Public Access</p>
                            <p className="text-blue-700 text-sm">
                              Click the button below to access public disaster information and reporting features.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        role === 'admin'
                          ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>🚀</span>
                          <span>
                            {role === 'admin' ? 'Admin Sign In' : 'Continue as Citizen'}
                          </span>
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-8 pt-6 border-t-2 border-gray-200/50">
                    <p className="text-gray-600 text-xs text-center mb-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                      <span className="text-base">🔑</span>
                      Demo Credentials
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="group bg-gradient-to-br from-red-50 via-pink-50 to-red-50 border-2 border-red-200 rounded-xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                        <p className="text-red-700 font-black mb-3 text-sm flex items-center gap-2">
                          <span>🔐</span> Admin Access
                        </p>
                        <div className="space-y-2">
                          <div className="bg-white/60 rounded-lg px-3 py-2">
                            <p className="text-gray-500 text-xs font-semibold mb-1">Username</p>
                            <p className="text-gray-900 font-mono font-bold">admin</p>
                          </div>
                          <div className="bg-white/60 rounded-lg px-3 py-2">
                            <p className="text-gray-500 text-xs font-semibold mb-1">Password</p>
                            <p className="text-gray-900 font-mono font-bold">admin123</p>
                          </div>
                        </div>
                      </div>
                      <div className="group bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                        <p className="text-blue-700 font-black mb-3 text-sm flex items-center gap-2">
                          <span>👤</span> Citizen Access
                        </p>
                        <div className="bg-white/60 rounded-lg px-3 py-3 text-center">
                          <p className="text-blue-900 font-bold text-sm">No Login Required</p>
                          <p className="text-gray-600 mt-1">One-click access</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Notice */}
                  <div className="mt-6 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-2 border-red-400/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-md animate-pulse-slow">
                        <span className="text-3xl">🆘</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-red-900 font-black text-base mb-1">24/7 Emergency Hotline</p>
                        <p className="text-red-700 font-black text-2xl tracking-wider">☎ 1784</p>
                        <p className="text-red-600 text-xs font-semibold mt-1">Thailand Disaster & Emergency Services</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Roadmap Tab */
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 roadmap-scroll">
                  {/* Roadmap Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4">
                      <span className="text-3xl">🗺️</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-2">Development Roadmap</h2>
                    <p className="text-gray-600 text-sm">Our vision for the future of Thailand DEMS</p>
                  </div>

                  {/* Phase 1: Q1 2025 - Current Implementation */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800">Phase 1: Foundation</h3>
                        <p className="text-green-700 text-sm font-medium">Q4 2024 - Completed ✓</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-green-900">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span><strong>Core Disaster Management:</strong> Disaster tracking, alerts, shelters, and damage assessments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span><strong>Volunteer System:</strong> Basic volunteer registration, assignment, and tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span><strong>Supply Management:</strong> Relief supply inventory and distribution tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span><strong>Public Reporting:</strong> Citizen disaster reporting interface</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span><strong>Thailand Geographic Data:</strong> Province, city, and landmark integration</span>
                      </li>
                    </ul>
                  </div>

                  {/* Phase 2: Q1-Q2 2025 - Enhanced Features */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
                        <span className="text-2xl">🚀</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-800">Phase 2: Intelligence Layer</h3>
                        <p className="text-blue-700 text-sm font-medium">Q1-Q2 2025 - In Progress</p>
                      </div>
                    </div>
                    <ul className="space-y-3 text-sm text-blue-900">
                      <li className="bg-white/60 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-yellow-500 mt-0.5">🔧</span>
                          <strong className="text-blue-800">Resource Intelligence System</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">AI-powered capacity analysis, smart recommendations, and automated gap detection for shelters, volunteers, and supplies</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-yellow-500 mt-0.5">🔧</span>
                          <strong className="text-blue-800">4-Tier Response System</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Automated escalation framework (Local → Regional → National → International) with trigger criteria and resource deployment</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-yellow-500 mt-0.5">🔧</span>
                          <strong className="text-blue-800">Volunteer Authentication Portal</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Secure login system for volunteers to view assignments, update hours, and access personalized dashboard</p>
                      </li>
                    </ul>
                  </div>

                  {/* Phase 3: Q2-Q3 2025 - Agency Integration */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
                        <span className="text-2xl">🏢</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-800">Phase 3: Partnership Network</h3>
                        <p className="text-purple-700 text-sm font-medium">Q2-Q3 2025 - Planned</p>
                      </div>
                    </div>
                    <ul className="space-y-3 text-sm text-purple-900">
                      <li className="bg-white/60 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-purple-600 mt-0.5">📋</span>
                          <strong className="text-purple-800">Agency Workflow Integration</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Connect agencies with disaster response workflows, auto-activation triggers, resource deployment tracking, and MOU management</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-purple-600 mt-0.5">📋</span>
                          <strong className="text-purple-800">Partner Facility Activation</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Real-time activation of schools, temples, hotels as emergency shelters with capacity tracking and host family coordination</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-purple-600 mt-0.5">📋</span>
                          <strong className="text-purple-800">Inter-Agency Communication</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Unified messaging system for coordination between government, NGOs, international partners, and private sector</p>
                      </li>
                    </ul>
                  </div>

                  {/* Phase 4: Q3-Q4 2025 - Enhanced Volunteer System */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-800">Phase 4: Volunteer Enhancement</h3>
                        <p className="text-orange-700 text-sm font-medium">Q3-Q4 2025 - Planned</p>
                      </div>
                    </div>
                    <ul className="space-y-3 text-sm text-orange-900">
                      <li className="bg-white/60 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-orange-600 mt-0.5">📋</span>
                          <strong className="text-orange-800">Smart Skill Matching</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">AI-powered matching of volunteer skills to disaster needs (medical, search & rescue, logistics, translation, etc.)</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-orange-600 mt-0.5">📋</span>
                          <strong className="text-orange-800">Deployment Optimization</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Geographic and availability-based volunteer deployment with shift scheduling and workload balancing</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-orange-600 mt-0.5">📋</span>
                          <strong className="text-orange-800">Recognition & Gamification</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Achievement badges, leaderboards, certificates, and volunteer impact dashboards to boost engagement</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-orange-600 mt-0.5">📋</span>
                          <strong className="text-orange-800">Mobile Volunteer App</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Native iOS/Android app for real-time notifications, check-in/out, field reporting, and offline capabilities</p>
                      </li>
                    </ul>
                  </div>

                  {/* Phase 5: 2026 - Advanced Features */}
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-300 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl shadow-md">
                        <span className="text-2xl">🔮</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-indigo-800">Phase 5: Next Generation</h3>
                        <p className="text-indigo-700 text-sm font-medium">2026 & Beyond</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-indigo-900">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5">🔮</span>
                        <span><strong>Predictive Analytics:</strong> Machine learning for disaster prediction and impact forecasting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5">🔮</span>
                        <span><strong>Real-Time Mapping:</strong> Live disaster visualization with satellite imagery and drone integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5">🔮</span>
                        <span><strong>International Coordination:</strong> ASEAN AHA Centre and UN OCHA integration for cross-border disasters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5">🔮</span>
                        <span><strong>IoT Sensors:</strong> Weather stations, water levels, seismic monitors for early warning systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5">🔮</span>
                        <span><strong>Blockchain Aid Tracking:</strong> Transparent supply chain for international aid and donations</span>
                      </li>
                    </ul>
                  </div>

                  {/* Phase 6: Regional Expansion Goal */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md">
                        <span className="text-2xl">🌏</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-emerald-800">Phase 6: Regional Expansion</h3>
                        <p className="text-emerald-700 text-sm font-medium">Long-term Vision - Southeast Asia</p>
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-4 border border-emerald-200 mb-3">
                      <h4 className="text-base font-bold text-emerald-800 mb-3 flex items-center gap-2">
                        <span>🎯</span>
                        <span>Expansion Goal: ASEAN-Wide Disaster Management</span>
                      </h4>
                      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        Transform Thailand DEMS into a <strong>regional disaster management platform</strong> serving Southeast Asian nations, 
                        starting with Myanmar and expanding across ASEAN member states.
                      </p>
                    </div>
                    <ul className="space-y-3 text-sm text-emerald-900">
                      <li className="bg-white/60 rounded-lg p-3 border border-emerald-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-emerald-600 mt-0.5">🇲🇲</span>
                          <strong className="text-emerald-800">Phase 1: Myanmar Deployment</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Localize system for Myanmar (Burmese language, Myanmar provinces/regions, local agencies), pilot in cyclone-prone areas, train Myanmar DDPM staff</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-emerald-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-emerald-600 mt-0.5">🌏</span>
                          <strong className="text-emerald-800">Phase 2: ASEAN Expansion</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Expand to Vietnam, Laos, Cambodia, Philippines, Indonesia - multi-language support (10 ASEAN languages), country-specific geographic data and government structures</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-emerald-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-emerald-600 mt-0.5">🤝</span>
                          <strong className="text-emerald-800">Cross-Border Disaster Coordination</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Enable real-time coordination for transboundary disasters (floods, tsunamis, earthquakes), shared resource pools, unified early warning systems across borders</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-emerald-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-emerald-600 mt-0.5">🏛️</span>
                          <strong className="text-emerald-800">ASEAN AHA Centre Integration</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Direct integration with ASEAN Coordinating Centre for Humanitarian Assistance for regional disaster data sharing and coordinated response</p>
                      </li>
                      <li className="bg-white/60 rounded-lg p-3 border border-emerald-200">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-emerald-600 mt-0.5">💡</span>
                          <strong className="text-emerald-800">Knowledge Sharing Platform</strong>
                        </div>
                        <p className="text-gray-700 text-xs ml-6">Regional best practices database, disaster response case studies, cross-country training programs, volunteer exchange networks</p>
                      </li>
                    </ul>
                    <div className="mt-4 bg-emerald-100/60 border border-emerald-300 rounded-lg p-4">
                      <p className="text-emerald-900 text-xs leading-relaxed">
                        <strong>🎯 Ultimate Goal:</strong> Establish Thailand DEMS as the <em>standard disaster management platform</em> for Southeast Asia, 
                        serving 650+ million people across 11 ASEAN nations with unified response capabilities and shared resilience infrastructure.
                      </p>
                    </div>
                  </div>

                  {/* Current Status Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 rounded-2xl p-6 shadow-lg">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span>📊</span>
                      <span>Current Implementation Status</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                        <p className="text-3xl font-black text-green-700">24</p>
                        <p className="text-xs text-green-800 font-semibold mt-1">Working Tables</p>
                      </div>
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                        <p className="text-3xl font-black text-yellow-700">7</p>
                        <p className="text-xs text-yellow-800 font-semibold mt-1">In Development</p>
                      </div>
                      <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                        <p className="text-3xl font-black text-blue-700">15+</p>
                        <p className="text-xs text-blue-800 font-semibold mt-1">Planned Features</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/90 text-sm mt-8 drop-shadow-lg font-medium tracking-wide">
            © 2025 Thailand DEMS. All rights reserved.
          </p>
          <p className="text-center text-white/70 text-xs mt-2 drop-shadow">
            Empowering Communities Through Technology
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-particles {
          0% { 
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { 
            transform: translateY(-100vh) translateX(50px) scale(1.5);
            opacity: 0;
          }
        }
        @keyframes float-shapes {
          0%, 100% { 
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-30px) rotate(180deg);
            opacity: 0.6;
          }
        }
        @keyframes shooting-star {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw) translateY(50vh);
            opacity: 0;
          }
        }
        @keyframes shake-smooth {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes gradient {
          0%, 100% { 
            background-position: 0% 50%;
            opacity: 0.3;
          }
          50% { 
            background-position: 100% 50%;
            opacity: 0.5;
          }
        }
        @keyframes pulse-slow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        @keyframes pulse-slower {
          0%, 100% { 
            opacity: 0.2;
            transform: scale(1) translateX(0);
          }
          50% { 
            opacity: 0.4;
            transform: scale(1.1) translateX(20px);
          }
        }
        @keyframes pulse-slowest {
          0%, 100% { 
            opacity: 0.15;
            transform: scale(1) translateY(0);
          }
          50% { 
            opacity: 0.3;
            transform: scale(1.08) translateY(-20px);
          }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ping-slow {
          0% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.5);
            opacity: 0.4;
          }
          100% { 
            transform: scale(1);
            opacity: 0.8;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-shake-smooth {
          animation: shake-smooth 0.6s ease-in-out;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        .animate-pulse-slowest {
          animation: pulse-slowest 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 3s ease-in-out infinite;
        }
        .roadmap-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .roadmap-scroll::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #f1f5f9, #e2e8f0);
          border-radius: 10px;
          margin: 4px;
        }
        .roadmap-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        .roadmap-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
}
