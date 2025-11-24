'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('dems_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated and not on login page
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const login = (username, password) => {
    // Simple authentication (in production, this should call an API)
    if (username === 'admin' && password === 'admin123') {
      const userData = {
        username: 'admin',
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@dems.th'
      };
      setUser(userData);
      localStorage.setItem('dems_user', JSON.stringify(userData));
      router.push('/');
      return { success: true };
    } else if (username === 'user' && password === 'user123') {
      const userData = {
        username: 'user',
        role: 'user',
        name: 'Public User',
        email: 'user@dems.th'
      };
      setUser(userData);
      localStorage.setItem('dems_user', JSON.stringify(userData));
      router.push('/');
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dems_user');
    router.push('/login');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    // User permissions
    const userPermissions = ['view_map', 'view_disasters'];
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
