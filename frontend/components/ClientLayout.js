'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { dashboardAPI } from '@/lib/api';
import AIAssistant from './AIAssistant';

export default function ClientLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('dems_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      // Refresh alerts every 30 seconds
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [pathname]);

  const fetchAlerts = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setAlerts(response.data?.activeAlerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('dems_user');
    setUser(null);
    router.push('/login');
  };

  const getAlertSeverityColor = (severity) => {
    const colors = {
      'Emergency': 'bg-red-600 border-red-400 text-white',
      'Critical': 'bg-orange-600 border-orange-400 text-white',
      'Warning': 'bg-yellow-600 border-yellow-400 text-white',
      'Info': 'bg-blue-600 border-blue-400 text-white'
    };
    return colors[severity] || 'bg-gray-600 border-gray-400 text-white';
  };

  // Don't show header on login page
  if (pathname === '/login') {
    return children;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  // Check role-based access for admin routes
  const isAdminRoute = pathname.startsWith('/admin/') || 
                       pathname === '/supplies' || 
                       pathname === '/volunteers';
  
  if (user.role === 'user' && isAdminRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-red-200 text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-red-100 mb-6">
            You don't have permission to access this page.
            <br />
            <span className="text-sm">This page is for administrators only.</span>
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const navItems = user.role === 'admin' ? [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Disasters', href: '/disasters', icon: '🔥' },
    { name: 'Shelters', href: '/shelters', icon: '🏠' },
    { name: 'Supplies', href: '/supplies', icon: '📦' },
    { name: 'Volunteers', href: '/volunteers', icon: '👥' },
  ] : [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Disasters', href: '/disasters', icon: '🔥' },
    { name: 'Weather', href: '/weather', icon: '🌤️' },
    { name: 'Evacuation', href: '/evacuation', icon: '🚗' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Top Navigation */}
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Thailand DEMS</h1>
                <p className="text-blue-200 text-xs">Disaster Management</p>
              </div>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-white/20 text-white'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button & Right Side Items */}
            <div className="flex items-center space-x-2">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {showMobileMenu ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

            {/* Notifications and User Menu */}
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  <span className="text-2xl">🔔</span>
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {alerts.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto z-50">
                    <div className="px-4 py-3 border-b border-white/10 bg-slate-700/50 sticky top-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center">
                          <span className="mr-2">🔔</span>
                          Active Alerts
                        </h3>
                        {alerts.length > 0 && (
                          <span className="px-2 py-1 bg-red-500/30 border border-red-400 rounded-full text-red-200 text-xs font-semibold">
                            {alerts.length}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {alerts.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <div className="text-4xl mb-2 opacity-50">✓</div>
                        <p className="text-slate-400 text-sm">No active alerts</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {alerts.map((alert) => (
                          <div key={alert.AlertID} className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white font-semibold text-sm flex-1">{alert.Title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getAlertSeverityColor(alert.Severity)} ml-2`}>
                                {alert.Severity}
                              </span>
                            </div>
                            <p className="text-slate-300 text-xs mb-2">{alert.Message}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center">
                                <span className="mr-1">📍</span>
                                {alert.AffectedRegion}
                              </span>
                              <span className="flex items-center">
                                <span className="mr-1">⏰</span>
                                {new Date(alert.IssuedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="px-2 py-1 bg-white/10 rounded text-xs text-blue-300">
                                {alert.AlertType}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.role === 'admin' ? '👑' : '👤'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-blue-200 text-xs capitalize">{user.role}</p>
                </div>
                <span className="text-white">▼</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-blue-200 text-xs">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-300 hover:bg-red-500/20 transition flex items-center"
                  >
                    <span className="mr-2">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-lg border-t border-white/10">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-white/20 text-white'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              {/* User info in mobile menu */}
              <div className="pt-3 mt-3 border-t border-white/10">
                <div className="px-4 py-2 text-white">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-blue-200 text-xs capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 text-red-300 hover:bg-red-500/20 transition flex items-center rounded-lg mt-1"
                >
                  <span className="mr-2">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* AI Assistant */}
      <AIAssistant user={user} />
    </div>
  );
}
