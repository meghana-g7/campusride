import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRide, PREDEFINED_LOCATIONS } from '../context/RideContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import MapView from '../components/MapView';
import {
  MapPin,
  Sparkles,
  ArrowUpDown,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Car,
  Bike
} from 'lucide-react';

const PassengerHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    pickup,
    setPickup,
    destination,
    setDestination,
    vehicleType,
    setVehicleType,
    pinkRide,
    setPinkRide,
    fetchNearbyDrivers
  } = useRide();

  const [errorMsg, setErrorMsg] = useState('');

  // Lookup destination object for exact Google Maps road distance
  const currentDestObj =
    PREDEFINED_LOCATIONS.find((l) => l.name === destination) || PREDEFINED_LOCATIONS[1];
  const directDistance = currentDestObj.directKm || 2.0;

  // Rate Calculation: Bike = ₹5/km, Car = ₹10/km
  const ratePerKm = vehicleType === 'Car' ? 10 : 5;
  const estimatedFare = Math.max(20, Math.round(directDistance * ratePerKm));

  const handleSelectDestination = (destName) => {
    setErrorMsg('');
    setDestination(destName);
  };

  const swapLocations = () => {
    setErrorMsg('');
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  const handleProceedToConfirm = () => {
    setErrorMsg('');
    const pCampus = pickup.toLowerCase().includes('sambhram');
    const dCampus = destination.toLowerCase().includes('sambhram');

    if (!pCampus && !dCampus) {
      setErrorMsg('Campus Rule: At least one location must be Sambhram Institute of Technology (SAIT).');
      return;
    }

    if (pickup === destination) {
      setErrorMsg('Pickup and destination cannot be the same location.');
      return;
    }

    fetchNearbyDrivers({ pickup, vehicleType, pinkRide });
    navigate('/confirm');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Header with prominent Back button and SOS button */}
      <Header
        title="Book Campus Ride"
        showBack={true}
        onBack={() => navigate('/role')}
        showSOS={true}
        showHelp={true}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Interactive Google-Mapped Campus View */}
        <div className="h-[34vh] w-full relative">
          <MapView
            center={[13.0805, 77.5458]}
            zoom={14}
            className="h-full w-full rounded-none"
            showRoute={false}
          />

          {/* Floating Campus Badge */}
          <div className="absolute top-3 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-gray-100 pointer-events-auto flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] font-black text-gray-900 tracking-tight">SAIT Campus Zone</span>
            </div>
            {user && (
              <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-2xl shadow-md text-[11px] font-bold text-gray-800 pointer-events-auto">
                {user.name} ({user.usn || 'SAIT'})
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM CONTENT (SPACIOUS, RAPIDO/OLA STYLE) */}
        <div className="flex-1 -mt-5 bg-white rounded-t-3xl shadow-2xl z-20 px-5 pt-4 pb-20 flex flex-col justify-between border-t border-gray-100 overflow-y-auto">
          <div className="space-y-4">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />

            {/* ERROR ALERT */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 1. CLEAN LOCATION PICKER CARD */}
            <div className="p-4 bg-gray-50 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
                  <div className="w-0.5 h-9 bg-gray-300 my-1"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-100"></div>
                </div>

                <div className="flex-1 space-y-2">
                  {/* Pickup */}
                  <div>
                    <label className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                      Pickup Location
                    </label>
                    <select
                      value={pickup}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full mt-0.5 p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {PREDEFINED_LOCATIONS.map((loc, i) => (
                        <option key={i} value={loc.name}>
                          {loc.name} {loc.isCampus ? '(SAIT Campus)' : `(${loc.directKm} km)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="text-[10px] font-black text-red-700 uppercase tracking-wider block">
                      Drop Destination
                    </label>
                    <select
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full mt-0.5 p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      {PREDEFINED_LOCATIONS.map((loc, i) => (
                        <option key={i} value={loc.name}>
                          {loc.name} {loc.isCampus ? '(SAIT Campus)' : `(${loc.directKm} km)`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={swapLocations}
                  className="p-3 bg-white hover:bg-gray-100 active:scale-95 rounded-2xl border border-gray-200 text-gray-700 shadow-sm transition-all"
                  title="Swap Pickup and Drop"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Destination Suggestion Pills */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                  Popular Campus Routes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PREDEFINED_LOCATIONS.filter((l) => !l.isCampus).map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDestination(loc.name)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                        destination === loc.name
                          ? 'bg-red-500 text-white border-red-500 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {loc.name} ({loc.directKm} km)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. RIDE TYPE: BIKE VS CAR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">
                  Select Ride Type
                </span>
                <span className="text-xs font-mono font-black text-gray-900">
                  Google Maps Road Distance: {directDistance} km
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Bike Option */}
                <button
                  type="button"
                  onClick={() => setVehicleType('Bike')}
                  className={`p-3 rounded-3xl border-2 flex flex-col items-center justify-between transition-all relative overflow-hidden bg-white ${
                    vehicleType === 'Bike'
                      ? 'border-blue-600 shadow-lg ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-slate-50">
                    <img
                      src="/assets/bike_option.jpg"
                      alt="SAIT Bike"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="w-full text-center py-1 mt-1">
                    <span className="text-xs font-black text-gray-900 block">SAIT BIKE</span>
                    <span className="text-[11px] text-gray-500 font-bold">₹5 / km</span>
                    <span className="text-xs font-black text-blue-600 mt-0.5 block font-mono">
                      ₹{Math.max(20, Math.round(directDistance * 5))}
                    </span>
                  </div>
                </button>

                {/* Car Option */}
                <button
                  type="button"
                  onClick={() => setVehicleType('Car')}
                  className={`p-3 rounded-3xl border-2 flex flex-col items-center justify-between transition-all relative overflow-hidden bg-white ${
                    vehicleType === 'Car'
                      ? 'border-blue-600 shadow-lg ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-slate-50">
                    <img
                      src="/assets/car_option.jpg"
                      alt="SAIT Car"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="w-full text-center py-1 mt-1">
                    <span className="text-xs font-black text-gray-900 block">SAIT CAR</span>
                    <span className="text-[11px] text-gray-500 font-bold">₹10 / km</span>
                    <span className="text-xs font-black text-blue-600 mt-0.5 block font-mono">
                      ₹{Math.max(40, Math.round(directDistance * 10))}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. PINK RIDE WOMEN SAFETY BANNER */}
            <div
              onClick={() => setPinkRide(!pinkRide)}
              className={`rounded-3xl border-2 transition-all cursor-pointer overflow-hidden shadow-sm ${
                pinkRide
                  ? 'border-pink-500 ring-4 ring-pink-100 shadow-md'
                  : 'border-pink-200 hover:border-pink-300'
              }`}
            >
              <div className="relative">
                <img
                  src="/assets/pink_ride_banner.jpg"
                  alt="Pink Ride Women Safety"
                  className="w-full h-auto object-cover max-h-24"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-sm ${
                      pinkRide ? 'bg-pink-600 text-white' : 'bg-white/90 text-pink-700'
                    }`}
                  >
                    {pinkRide ? '✓ Pink Ride Selected' : 'Tap for Pink Ride'}
                  </span>
                </div>
              </div>

              <div className="bg-pink-50 p-2.5 px-3 flex items-center justify-between text-[10px] font-black text-pink-900">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
                  <span>Verified Female Captains Only</span>
                </span>
                <span>•</span>
                <span>Ananya & Women Safety Fleet</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4">
            <button
              onClick={handleProceedToConfirm}
              className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-extrabold text-base rounded-full shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>Search Rides • ₹{estimatedFare}</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PassengerHome;
