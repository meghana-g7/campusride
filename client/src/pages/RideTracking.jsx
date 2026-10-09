import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRide, PREDEFINED_LOCATIONS } from '../context/RideContext';
import Header from '../components/Header';
import MapView from '../components/MapView';
import { Phone, Star, ShieldCheck, MapPin, Navigation, CheckCircle2, PhoneCall, AlertTriangle } from 'lucide-react';

const RideTracking = () => {
  const navigate = useNavigate();
  const { activeRide, updateRideStatus, cancelRide } = useRide();

  useEffect(() => {
    if (!activeRide) {
      navigate('/home');
    }
  }, [activeRide, navigate]);

  if (!activeRide) return null;

  const isStarted = activeRide.status === 'RIDE_STARTED';
  const isCompleted = activeRide.status === 'RIDE_COMPLETED';

  useEffect(() => {
    if (isCompleted) {
      navigate('/completed');
    }
  }, [isCompleted, navigate]);

  const driver = activeRide.driverDetails || {
    name: 'Ajay Kumar',
    vehicleNumber: 'KA04EK2024',
    vehicleModel: 'Hero Splendor Plus',
    usn: '1ST21CS045',
    phone: '9876543211',
    rating: 4.8
  };

  const otpDigits = (activeRide.otp || '3060').split('');

  // Clean initials for captain (No cartoon photos)
  const driverInitials = driver.name
    ? driver.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AK';

  const pickupObj = PREDEFINED_LOCATIONS.find((l) => l.name === activeRide.pickup) || PREDEFINED_LOCATIONS[0];
  const destObj = PREDEFINED_LOCATIONS.find((l) => l.name === activeRide.destination) || PREDEFINED_LOCATIONS[1];

  // Exact Google Maps road distance
  const preciseDistance = destObj.directKm || activeRide.distance || 2.0;

  // Real-time Vehicle Movement Simulation (Traversing Waypoints)
  const [tripProgress, setTripProgress] = useState(0.15); // 0.0 to 1.0

  useEffect(() => {
    const timer = setInterval(() => {
      setTripProgress((prev) => {
        if (prev >= 0.95) return 0.95;
        return prev + 0.035;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isStarted]);

  // Compute live interpolated vehicle coordinates
  const calculateVehiclePosition = () => {
    if (!isStarted) {
      // Driver moving towards pickup (from 500m away to pickup)
      const startLat = pickupObj.lat - 0.0035;
      const startLng = pickupObj.lng + 0.0028;
      return {
        lat: startLat + (pickupObj.lat - startLat) * tripProgress,
        lng: startLng + (pickupObj.lng - startLng) * tripProgress
      };
    } else {
      // Driver moving from pickup to destination along curved path
      const midLat = (pickupObj.lat + destObj.lat) / 2 + 0.0018;
      const midLng = (pickupObj.lng + destObj.lng) / 2 - 0.0022;

      if (tripProgress < 0.5) {
        const segT = tripProgress * 2;
        return {
          lat: pickupObj.lat + (midLat - pickupObj.lat) * segT,
          lng: pickupObj.lng + (midLng - pickupObj.lng) * segT
        };
      } else {
        const segT = (tripProgress - 0.5) * 2;
        return {
          lat: midLat + (destObj.lat - midLat) * segT,
          lng: midLng + (destObj.lng - midLng) * segT
        };
      }
    }
  };

  const currentVehicleCoords = calculateVehiclePosition();

  // Dynamic distance & ETA countdown based on live progress
  const remainingDistance = isStarted
    ? Math.max(0.1, (preciseDistance * (1 - tripProgress)).toFixed(1))
    : Math.max(0.1, (0.8 * (1 - tripProgress)).toFixed(1));

  const remainingMins = isStarted
    ? Math.max(1, Math.round(remainingDistance * 2.5))
    : Math.max(1, Math.round(remainingDistance * 2));

  const handleSimulateStart = async () => {
    setTripProgress(0.05);
    await updateRideStatus('RIDE_STARTED', activeRide.otp);
  };

  const handleSimulateComplete = async () => {
    await updateRideStatus('RIDE_COMPLETED', null, { paymentStatus: 'Paid', paymentMethod: 'UPI' });
    navigate('/completed');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Header with Back Button and SOS */}
      <Header
        title="Live Ride Tracking"
        showBack={true}
        onBack={() => {
          if (window.confirm('Leave tracking screen? Your ride will continue in background.')) {
            navigate('/home');
          }
        }}
        showSOS={true}
        showHelp={false}
        rightElement={
          <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full tracking-wider animate-pulse">
            ● GPS Live
          </span>
        }
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Live Interactive Map with Vehicle Movement */}
        <div className="h-[44vh] w-full relative">
          <MapView
            center={[currentVehicleCoords.lat, currentVehicleCoords.lng]}
            zoom={15}
            pickupCoords={{ lat: pickupObj.lat, lng: pickupObj.lng }}
            dropCoords={{ lat: destObj.lat, lng: destObj.lng }}
            driverCoords={currentVehicleCoords}
            driverType={activeRide.vehicleType || 'Bike'}
            showRoute={true}
            className="h-full w-full rounded-none"
          />

          {/* Floating Live Status Badge */}
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-slate-700 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold font-mono">
              {isStarted ? `En Route (${remainingDistance} km left)` : `Captain Arriving (${remainingDistance} km)`}
            </span>
          </div>
        </div>

        {/* BOTTOM CONTENT (FIGMA PAGE 8 & 9) */}
        <div className="flex-1 -mt-6 bg-white rounded-t-3xl shadow-2xl z-20 px-5 pt-4 pb-6 flex flex-col justify-between overflow-y-auto border-t border-gray-100">
          <div>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-3" />

            {!isStarted ? (
              /* FIGMA PAGE 8: DRIVER ARRIVING & START PIN */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-emerald-600 tracking-tight">
                      Pickup in {remainingMins} mins
                    </h3>
                    <p className="text-xs font-bold text-gray-800">
                      Captain is approaching Sambhram Institute (SAIT)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-black text-gray-500">
                      {remainingDistance} km away
                    </span>
                  </div>
                </div>

                {/* 4-DIGIT PIN IN BOXED DIGITS (FIGMA PAGE 8) */}
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 block">
                      Start your ride with PIN
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Share this code with your captain
                    </span>
                  </div>

                  <div className="flex space-x-1.5">
                    {otpDigits.map((digit, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-9 bg-white rounded-xl border-2 border-red-400 shadow-sm flex items-center justify-center font-black text-base text-gray-900 font-mono"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DRIVER CARD (RAPIDO/OLA STYLE - CLEAN INITIALS, NO FUNNY PICS) */}
                <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-yellow-300 text-gray-900 font-mono font-black text-xs rounded-md border border-yellow-400 shadow-xs mb-1">
                      {driver.vehicleNumber}
                    </span>
                    <p className="text-xs font-bold text-gray-700">
                      {driver.vehicleModel}
                    </p>
                    <p className="text-sm font-extrabold text-blue-600 mt-0.5">
                      {driver.name}
                    </p>
                    <p className="text-[11px] font-mono text-gray-500">
                      USN: {driver.usn}
                    </p>

                    <a
                      href={`tel:${driver.phone}`}
                      className="inline-flex items-center space-x-1 mt-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Captain ({driver.phone})</span>
                    </a>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                      {driverInitials}
                    </div>
                    <div className="flex items-center space-x-0.5 mt-1 text-xs font-extrabold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{driver.rating || '4.9'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* FIGMA PAGE 9: RIDE IN PROGRESS / TRACKING */
              <div className="space-y-4">
                {/* Driver Details Card (Figma Page 9) */}
                <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-yellow-300 text-gray-900 font-mono font-black text-xs rounded-md border border-yellow-400 shadow-xs mb-1">
                      {driver.vehicleNumber}
                    </span>
                    <p className="text-xs font-bold text-gray-700">
                      {driver.vehicleModel}
                    </p>
                    <p className="text-sm font-extrabold text-blue-600 mt-0.5">
                      {driver.name}
                    </p>
                    <p className="text-[11px] font-mono text-gray-500">
                      USN: {driver.usn}
                    </p>
                    <a
                      href={`tel:${driver.phone}`}
                      className="inline-flex items-center space-x-1 mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call ({driver.phone})</span>
                    </a>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {driverInitials}
                  </div>
                </div>

                {/* FIGMA PAGE 9: DYNAMIC DISTANCE & PROGRESS */}
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-200 text-center space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-gray-500 px-2">
                    <span>Pickup (SAIT)</span>
                    <span className="text-blue-600 font-mono">
                      {Math.round(tripProgress * 100)}% Traveled
                    </span>
                    <span>{destObj.name}</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${Math.round(tripProgress * 100)}%` }}
                    />
                  </div>

                  <h3 className="text-xl font-black text-gray-900 tracking-tight pt-1">
                    {remainingDistance} km to destination
                  </h3>
                  <p className="text-xs font-extrabold text-gray-500">
                    Estimated {remainingMins} min remaining • Moving live on Google Maps
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PROJECT EVALUATION DEMO CONTROLLER */}
          <div className="pt-4 space-y-2 border-t border-gray-100 mt-4">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                Project Evaluation Demo Controller
              </span>
              {!isStarted ? (
                <button
                  onClick={handleSimulateStart}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-98"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Simulate Captain Starts Ride (PIN Verified ✓)</span>
                </button>
              ) : (
                <button
                  onClick={handleSimulateComplete}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-98"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simulate Ride Completed (Drop-off ✓)</span>
                </button>
              )}
            </div>

            <button
              onClick={cancelRide}
              className="w-full py-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
            >
              Cancel Ride Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideTracking;
