import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { User, Phone, Mail, Award, ShieldCheck, ArrowRightLeft, LogOut, CheckCircle2, ChevronRight } from 'lucide-react';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, driverProfile, mode, switchMode, logout } = useAuth();

  const handleToggleMode = async () => {
    const nextMode = mode === 'passenger' ? 'driver' : 'passenger';
    await switchMode(nextMode);
    if (nextMode === 'driver') {
      navigate('/driver');
    } else {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.name || 'Meghana';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="My Profile" showBack={false} showHelp={true} />

      <div className="flex-1 px-5 py-6 space-y-4 overflow-y-auto">
        {/* User Card (Clean Initials, No Cartoon Avatars) */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-gray-900">{userName}</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                SAIT Verified
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-red-600 mt-0.5">{user?.usn || '1ST23CS001'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Sambhram Institute of Technology (SAIT)</p>
          </div>
        </div>

        {/* Mode Switch Card */}
        <div className="p-5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-3xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-red-100 block">
              Current Active Mode
            </span>
            <h3 className="text-lg font-black capitalize mt-0.5">
              {mode === 'driver' ? 'Captain (Driver)' : 'Passenger (Rider)'}
            </h3>
            <p className="text-xs text-red-100 mt-0.5">
              {mode === 'driver' ? 'Accepting campus ride requests' : 'Ready to search campus rides'}
            </p>
          </div>

          <button
            onClick={handleToggleMode}
            className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Switch</span>
          </button>
        </div>

        {/* Quick Link to Figma Page 2 Green Checklist */}
        <div
          onClick={() => navigate('/rider-verify')}
          className="p-4 bg-emerald-50 rounded-3xl border border-emerald-200 cursor-pointer hover:bg-emerald-100/70 transition-all flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-gray-900">
                Rider Verification Checklist
              </h4>
              <p className="text-[11px] text-emerald-800">
                View Driving License, Vehicle RC & Aadhar status
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-700" />
        </div>

        {/* Account Details */}
        <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3.5 text-xs">
          <h4 className="font-black text-xs uppercase text-gray-400 tracking-wider mb-2">
            Campus Identity Details
          </h4>

          <div className="flex items-center justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500 flex items-center"><Award className="w-4 h-4 mr-2 text-gray-400" /> College USN</span>
            <span className="font-mono font-bold text-gray-900">{user?.usn || '1ST23CS001'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500 flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" /> Phone</span>
            <span className="font-bold text-gray-900">+91 {user?.phone || '9876543210'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500 flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" /> Email</span>
            <span className="font-bold text-gray-900">{user?.email || 'meghana@sambhram.org'}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500 flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-gray-400" /> Institution</span>
            <span className="font-bold text-gray-900">Sambhram Institute of Technology (SAIT)</span>
          </div>
        </div>

        {/* Vehicle Information */}
        {driverProfile && (
          <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase text-gray-400 tracking-wider">
                Registered Vehicle
              </h4>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {driverProfile.vehicleType}
              </span>
            </div>
            <p className="font-extrabold text-sm text-gray-900">
              {driverProfile.vehicleNumber} ({driverProfile.vehicleModel})
            </p>
            <p className="text-gray-500">
              RC: {driverProfile.rcNumber || 'Verified on file'}
            </p>
          </div>
        )}

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-gray-100 hover:bg-red-50 text-red-600 font-extrabold text-xs rounded-2xl transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from CampusRide</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
