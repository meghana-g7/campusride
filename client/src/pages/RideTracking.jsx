import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRide, PREDEFINED_LOCATIONS } from '../context/RideContext';
import Header from '../components/Header';
import MapView from '../components/MapView';
import { Phone, Star, ShieldCheck, MapPin, Navigation, CheckCircle2, PhoneCall } from 'lucide-react';

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
    vehicleNumber: 'KA02AB1234',
    vehicleModel: 'TVS Jupiter',
    usn: '1ST23CS042',
    phone: '9876543211',
    rating: 4.8
  };

  const otpDigits = (activeRide.otp || '3060').split('');

  // Clean initials for captain (No cartoon photos!)
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

  const driverCoords = isStarted
    ? {
        lat: (pickupObj.lat + destObj.lat) / 2,
        lng: (pickupObj.lng + destObj.lng) / 2
      }
    : {
        lat: pickupObj.lat - 0.002,
        lng: pickupObj.lng + 0.002
      };

  const handleSimulateStart = async () => {
    await updateRideStatus('RIDE_STARTED', activeRide.otp);
  };

  const handleSimulateComplete = async () => {
    await updateRideStatus('RIDE_COMPLETED', null, { paymentStatus: 'Paid', paymentMethod: 'UPI' });
    navigate('/completed');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with Red SOS button */}
      <Header
        title=""
        showBack={false}
        showSOS={true}
        showHelp={false}
        rightElement={
          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
            Live Route
          </span>
        }
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Live Interactive Map */}
        <div className="h-[44vh] w-full relative">
          <MapView
            center={[driverCoords.lat, driverCoords.lng]}
            zoom={15}
            pickupCoords={{ lat: pickupObj.lat, lng: pickupObj.lng }}
            dropCoords={{ lat: destObj.lat, lng: destObj.lng }}
            driverCoords={driverCoords}
            driverType={activeRide.vehicleType || 'Bike'}
            showRoute={true}
            className="h-full w-full rounded-none"
          />

          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-slate-700 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold font-mono">
              {isStarted ? 'En Route to Drop-off' : '800 m to pickup'}
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
                <div>
                  <h3 className="text-xl font-black text-emerald-600 tracking-tight">
                    Pickup in 2 mins
                  </h3>
                  <p className="text-sm font-bold text-gray-800">
                    Captain on the way
                  </p>
                </div>

                {/* 4-DIGIT PIN IN BOXED DIGITS (FIGMA PAGE 8) */}
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    Start your ride with PIN
                  </span>

                  <div className="flex space-x-2">
                    {otpDigits.map((digit, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-9 bg-white rounded-xl border-2 border-gray-300 shadow-sm flex items-center justify-center font-black text-base text-gray-900"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DRIVER CARD (RAPIDO/OLA STYLE - CLEAN INITIALS, NO FUNNY PICS) */}
                <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    {/* Number plate box */}
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
                      {driver.usn}
                    </p>

                    <a
                      href={`tel:${driver.phone}`}
                      className="inline-flex items-center space-x-1 mt-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{driver.phone}</span>
                    </a>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                      {driverInitials}
                    </div>
                    <div className="flex items-center space-x-0.5 mt-1 text-xs font-extrabold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{driver.rating || '4.8'}</span>
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
                      {driver.usn}
                    </p>
                    <a
                      href={`tel:${driver.phone}`}
                      className="inline-flex items-center space-x-1 mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{driver.phone}</span>
                    </a>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {driverInitials}
                  </div>
                </div>

                {/* FIGMA PAGE 9: "1.5 km to destination, 5 min remaining" */}
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200 text-center space-y-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    {preciseDistance} km to destination
                  </h3>
                  <p className="text-sm font-extrabold text-gray-500">
                    {Math.max(3, Math.round(preciseDistance * 2.5))} min remaining
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* TWO-DEVICE DEMO SIMULATION CONTROLS */}
          <div className="pt-4 space-y-2 border-t border-gray-100 mt-4">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                Project Evaluation Demo Controller
              </span>
              {!isStarted ? (
                <button
                  onClick={handleSimulateStart}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Simulate Driver Starts Ride (PIN Verified ✓)</span>
                </button>
              ) : (
                <button
                  onClick={handleSimulateComplete}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simulate Ride Completed (Drop-off)</span>
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
