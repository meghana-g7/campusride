import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRide } from '../context/RideContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import api from '../services/api';
import {
  Bike,
  Car,
  Star,
  Power,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Phone,
  User,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const { user, driverProfile, refreshDriverProfile, switchMode } = useAuth();
  const { incomingDriverRequest, setIncomingDriverRequest } = useRide();

  const [isOnline, setIsOnline] = useState(true);
  const [activeDriverRide, setActiveDriverRide] = useState(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!driverProfile) {
      refreshDriverProfile();
    }
  }, [driverProfile, refreshDriverProfile]);

  const toggleOnline = async () => {
    const nextStatus = isOnline ? 'Offline' : 'Available';
    try {
      await api.patch('/drivers/availability', { availability: nextStatus });
      setIsOnline(!isOnline);
      if (driverProfile) {
        driverProfile.availability = nextStatus;
      }
    } catch (e) {
      console.warn('Could not update status:', e.message);
    }
  };

  const handleAcceptRequest = async () => {
    if (!incomingDriverRequest) return;
    setActionLoading(true);
    const rideId = incomingDriverRequest._id || incomingDriverRequest.id;

    try {
      const res = await api.patch(`/rides/${rideId}/status`, { status: 'DRIVER_ARRIVING' });
      if (res.data.success) {
        setActiveDriverRide(res.data.ride);
        setIncomingDriverRequest(null);
      }
    } catch (err) {
      console.error('Accept error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartRide = async () => {
    setPinError('');
    if (!enteredPin || enteredPin.length !== 4) {
      setPinError('Please enter the 4-digit PIN given by the passenger.');
      return;
    }

    setActionLoading(true);
    const rideId = activeDriverRide._id || activeDriverRide.id;

    try {
      const res = await api.patch(`/rides/${rideId}/status`, {
        status: 'RIDE_STARTED',
        enteredPin
      });

      if (res.data.success) {
        setActiveDriverRide(res.data.ride);
      } else {
        setPinError(res.data.message || 'Incorrect PIN. Verification failed.');
      }
    } catch (err) {
      setPinError(err.message || 'PIN verification failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    setActionLoading(true);
    const rideId = activeDriverRide._id || activeDriverRide.id;

    try {
      const res = await api.patch(`/rides/${rideId}/status`, {
        status: 'RIDE_COMPLETED',
        paymentStatus: 'Paid',
        paymentMethod: 'UPI'
      });

      if (res.data.success) {
        setActiveDriverRide(null);
        refreshDriverProfile();
        alert('Ride completed successfully! Availability reset to Online.');
      }
    } catch (err) {
      console.error('Complete error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateRequest = () => {
    setIncomingDriverRequest({
      _id: 'r_demo_' + Date.now(),
      id: 'r_demo_' + Date.now(),
      passengerId: 'u_passenger_1',
      pickup: 'Sambhram Institute of Technology',
      destination: 'MS Palya Circle',
      distance: 2.0,
      fare: 20,
      eta: 4,
      otp: '3060',
      vehicleType: driverProfile?.vehicleType || 'Bike',
      pinkRide: !!driverProfile?.pinkRideEligible,
      passengerDetails: {
        name: 'Meghana',
        phone: '9876543210',
        usn: '1ST23CS001'
      }
    });
  };

  const currentVehicleType = driverProfile?.vehicleType || 'Bike';
  const driverName = driverProfile?.name || user?.name || 'Ajay Kumar';
  const initials = driverName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        title="Captain Dashboard"
        showBack={true}
        onBack={() => navigate('/role')}
        showHelp={true}
        rightElement={
          <button
            onClick={() => switchMode('passenger')}
            className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 hover:bg-blue-100"
          >
            Switch to Passenger
          </button>
        }
      />

      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
        {/* ONLINE / OFFLINE TOGGLE BANNER */}
        <div className="p-4 bg-white rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
                isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-black text-base text-gray-900">
                  {isOnline ? 'You are Online' : 'You are Offline'}
                </h3>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500">
                {isOnline ? 'Ready to receive SAIT campus rides' : 'Not accepting new rides'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleOnline}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all shadow-sm ${
              isOnline
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* DRIVER STATS CARD (CLEAN INITIALS, NO FUNNY CARTOON AVATARS) */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 text-white font-black text-lg flex items-center justify-center shadow-inner">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-black">{driverName}</h2>
                <p className="text-xs text-sky-400 font-mono">{driverProfile?.usn || user?.usn || '1ST23CS042'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-black text-amber-400 flex items-center">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    {driverProfile?.rating || '4.8'}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs text-slate-300 font-medium">
                    {driverProfile?.completedRides || 48} rides
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full block mb-1">
                Verified DL & RC
              </span>
              {driverProfile?.pinkRideEligible && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-pink-500/30 text-pink-200 border border-pink-400/30 rounded-full">
                  Pink Rider 👩
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">VEHICLE</span>
              <span className="font-extrabold text-white">
                {driverProfile?.vehicleNumber || 'KA02AB1234'} ({driverProfile?.vehicleModel || currentVehicleType})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CAMPUS BASE</span>
              <span className="font-extrabold text-white truncate block">
                Sambhram Inst. of Tech (SAIT)
              </span>
            </div>
          </div>
        </div>

        {/* INCOMING RIDE REQUEST POPUP (TWO-DEVICE DEMO) */}
        {incomingDriverRequest && !activeDriverRide && (
          <div className="p-5 bg-blue-50 border-2 border-blue-400 rounded-3xl shadow-xl animate-bounce-subtle">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                <h3 className="font-black text-base text-blue-950">
                  New Ride Request! 🚨
                </h3>
              </div>
              <span className="text-lg font-black text-blue-700">
                ₹{incomingDriverRequest.fare}
              </span>
            </div>

            <div className="space-y-2 mb-4 bg-white p-3.5 rounded-2xl border border-blue-100 text-xs">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-extrabold text-gray-900 truncate">
                  Pickup: {incomingDriverRequest.pickup}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-extrabold text-gray-900 truncate">
                  Drop: {incomingDriverRequest.destination}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-gray-500 font-semibold text-[11px]">
                <span>Distance: {incomingDriverRequest.distance} km</span>
                <span>Type: {incomingDriverRequest.vehicleType}</span>
                {incomingDriverRequest.pinkRide && (
                  <span className="text-pink-600 font-extrabold">Pink Ride</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIncomingDriverRequest(null)}
                className="py-3 bg-white hover:bg-gray-100 text-gray-600 font-bold rounded-2xl text-xs border border-gray-200"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptRequest}
                disabled={actionLoading}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-md"
              >
                {actionLoading ? 'Accepting...' : 'Accept Ride ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE RIDE WORKFLOW */}
        {activeDriverRide && (
          <div className="p-5 bg-white rounded-3xl border-2 border-blue-500 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                Active Ride: {activeDriverRide.status}
              </span>
              <span className="text-base font-black text-gray-900">
                ₹{activeDriverRide.fare}
              </span>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-bold text-gray-800">
                Route: {activeDriverRide.pickup} → {activeDriverRide.destination}
              </p>
              <p className="text-gray-500">
                Trip Distance: {activeDriverRide.distance} km
              </p>
            </div>

            {activeDriverRide.status !== 'RIDE_STARTED' ? (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div>
                  <h4 className="font-black text-xs uppercase text-gray-800">
                    Enter Passenger's 4-Digit PIN
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Ask passenger for the PIN to verify via SHA-256 and unlock the ride.
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="3 0 6 0"
                  className="w-full text-center text-xl font-black tracking-widest py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />

                {pinError && (
                  <p className="text-xs text-red-600 font-bold">
                    ⚠️ {pinError}
                  </p>
                )}

                <button
                  onClick={handleStartRide}
                  disabled={actionLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-md"
                >
                  {actionLoading ? 'Verifying PIN...' : 'Verify SHA-256 & Start Ride'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ride in progress! Driving to destination...</span>
                </div>

                <button
                  onClick={handleCompleteRide}
                  disabled={actionLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-md flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Ride (Reached Destination)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Simulation Shortcut */}
        {!incomingDriverRequest && !activeDriverRide && (
          <div className="pt-2">
            <button
              onClick={handleSimulateRequest}
              className="w-full py-3 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-2xl text-xs border border-dashed border-gray-300 shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>🧪 Demo Mode: Simulate Incoming Passenger Request</span>
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default RiderDashboard;
