import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = {
  passenger: {
    email: 'passenger@campusride.demo',
    password: 'password123',
    label: 'Passenger (Meghana)',
    role: 'passenger'
  },
  driver_bike: {
    email: 'driver@campusride.demo',
    password: 'password123',
    label: 'Bike Driver (Ajay Kumar)',
    role: 'driver'
  },
  driver_pink: {
    email: 'ananya@campusride.demo',
    password: 'password123',
    label: 'Pink Ride Driver (Ananya)',
    role: 'driver'
  },
  driver_car: {
    email: 'kiran@campusride.demo',
    password: 'password123',
    label: 'Car Driver (Kiran)',
    role: 'driver'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusride_token') || null);
  const [mode, setMode] = useState(localStorage.getItem('campusride_mode') || 'passenger');
  const [loading, setLoading] = useState(true);

  // Initialize and load user profile if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          setDriverProfile(response.data.driverProfile);
          if (response.data.user?.id) {
            socket.emit('join_user_room', response.data.user.id);
          }
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: userData, driverProfile: driverData } = res.data;
        localStorage.setItem('campusride_token', newToken);
        setToken(newToken);
        setUser(userData);
        setDriverProfile(driverData);

        const chosenMode = userData.role === 'driver' ? 'driver' : 'passenger';
        setMode(chosenMode);
        localStorage.setItem('campusride_mode', chosenMode);

        socket.emit('join_user_room', userData.id);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Instant 1-Click Demo Login for fast review presentation
  const demoLogin = async (accountKey = 'passenger') => {
    const account = DEMO_ACCOUNTS[accountKey] || DEMO_ACCOUNTS.passenger;
    return await login(account.email, account.password);
  };

  // Register handler
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('campusride_token', newToken);
        setToken(newToken);
        setUser(userData);

        const chosenMode = formData.role || 'passenger';
        setMode(chosenMode);
        localStorage.setItem('campusride_mode', chosenMode);

        socket.emit('join_user_room', userData.id);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Switch between Passenger mode and Rider/Driver mode
  const switchMode = async (newMode) => {
    try {
      setMode(newMode);
      localStorage.setItem('campusride_mode', newMode);
      if (token) {
        await api.post('/auth/switch-role', { role: newMode });
      }
    } catch (e) {
      console.warn('Switch mode error:', e.message);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('campusride_token');
    localStorage.removeItem('campusride_mode');
    setToken(null);
    setUser(null);
    setDriverProfile(null);
    setMode('passenger');
  };

  // Refresh Driver Profile
  const refreshDriverProfile = async () => {
    try {
      const res = await api.get('/drivers/profile');
      if (res.data.success) {
        setDriverProfile(res.data.profile);
      }
    } catch (e) {
      console.warn('Could not refresh driver profile:', e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        driverProfile,
        token,
        mode,
        loading,
        login,
        demoLogin,
        register,
        logout,
        switchMode,
        setDriverProfile,
        refreshDriverProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
