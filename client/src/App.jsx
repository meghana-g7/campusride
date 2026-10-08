import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RideProvider } from './context/RideContext';

// Pages
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import RoleSelectScreen from './pages/RoleSelectScreen';
import PassengerHome from './pages/PassengerHome';
import RideConfirmation from './pages/RideConfirmation';
import RideTracking from './pages/RideTracking';
import RideCompleted from './pages/RideCompleted';
import RiderRegistration from './pages/RiderRegistration';
import RiderDashboard from './pages/RiderDashboard';
import RideHistory from './pages/RideHistory';
import AlgorithmShowcase from './pages/AlgorithmShowcase';
import ProfileScreen from './pages/ProfileScreen';

// Protected Route helper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token, loading, mode } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white font-bold text-sm">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading CampusRide...</span>
        </div>
      </div>
    );
  }

  // If no token, allow for demo preview or redirect to login
  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/role" element={<RoleSelectScreen />} />

      {/* Passenger Flow */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <PassengerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/confirm"
        element={
          <ProtectedRoute>
            <RideConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracking"
        element={
          <ProtectedRoute>
            <RideTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/completed"
        element={
          <ProtectedRoute>
            <RideCompleted />
          </ProtectedRoute>
        }
      />

      {/* Driver Flow */}
      <Route
        path="/rider-verify"
        element={
          <ProtectedRoute>
            <RiderRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver"
        element={
          <ProtectedRoute>
            <RiderDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shared Screens */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <RideHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/algorithms"
        element={
          <ProtectedRoute>
            <AlgorithmShowcase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RideProvider>
          {/* Mobile Shell Wrapper */}
          <div className="min-h-screen bg-slate-900 flex justify-center items-center md:py-6">
            <div className="mobile-frame w-full max-w-md bg-white min-h-screen md:min-h-[844px] md:max-h-[900px] md:rounded-[40px] md:shadow-2xl md:border-8 md:border-slate-800 overflow-hidden flex flex-col">
              <AppRoutes />
            </div>
          </div>
        </RideProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
