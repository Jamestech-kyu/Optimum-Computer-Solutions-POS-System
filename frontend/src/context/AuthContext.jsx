import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi } from '../api/auth';

// Create the context object
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app first loads, check if the user was already logged in
  useEffect(() => {
    const token     = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await loginApi({ username, password });
    // Save tokens to browser storage
    localStorage.setItem('access_token',  data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user',          JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // True if user is manager or admin — used to show/hide certain features
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — any component can call useAuth() to get login state
export function useAuth() {
  return useContext(AuthContext);
}