import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRide, PREDEFINED_LOCATIONS } from '../context/RideContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import MapView from '../components/MapView';
import { Search, MapPin, Sparkles, ChevronUp, RefreshCw, X, ArrowUpDown, ShieldCheck } from 'lucide-react';

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

  // Location selector sheet state (Figma Page 5)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [activeSelectionType, setActiveSelectionType] = useState('drop'); // 'pickup' | 'drop'
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Location selection
  const handleSelectPredefined = (locName) => {
    setErrorMsg('');
    if (activeSelectionType === 'pickup') {
      setPickup(locName);
      setActiveSelectionType('drop');
    } else {
      setDestination(locName);
      // Validate SAIT Campus rule
      const pCampus = (activeSelectionType === 'pickup' ? locName : pickup).toLowerCase().includes('sambhram');
      const dCampus = (activeSelectionType === 'drop' ? locName : destination).toLowerCase().includes('sambhram');

      if (!pCampus && !dCampus) {
        setErrorMsg('Campus Rule: Either Pickup or Drop location must be Sambhram Institute of Technology (SAIT).');
        return;
      }

      setIsLocationModalOpen(false);
    }
  };

  const swapLocations = () => {
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
      setIsLocationModalOpen(true);
      return;
    }

    if (pickup === destination) {
      setErrorMsg('Pickup and destination cannot be the same location.');
      setIsLocationModalOpen(true);
      return;
    }

    fetchNearbyDrivers({ pickup, vehicleType, pinkRide });
    navigate('/confirm');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="" showBack={false} showHelp={true} />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Interactive Google-Mapped Campus View */}
        <div className="h-[40vh] w-full relative">
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

        {/* BOTTOM CONTENT DRAWER (FIGMA PAGE 4) */}
        <div className="flex-1 -mt-6 bg-white rounded-t-3xl shadow-2xl z-20 px-5 pt-4 pb-6 flex flex-col justify-between border-t border-gray-100 overflow-y-auto">
          <div>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-3" />

            {/* "Where do you want to go?" Search Bar */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 shadow-sm transition-all text-left mb-4 active:scale-99"
            >
              <div className="flex items-center space-x-3 truncate">
                <Search className="w-5 h-5 text-gray-700 shrink-0" />
                <div className="truncate">
                  <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                    Where do you want to go?
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {pickup} → {destination}
                  </p>
                </div>
              </div>
              <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
            </button>

            {/* VEHICLE SELECTION CARDS WITH USER UPLOADED IMAGES (BIKE & CAR) */}
            <div className="grid grid-cols-2 gap-3.5 mb-4">
              {/* Bike Option (User Image 3) */}
              <button
                type="button"
                onClick={() => setVehicleType('Bike')}
                className={`p-2 rounded-3xl border-2 flex flex-col items-center justify-between transition-all relative overflow-hidden bg-white ${
                  vehicleType === 'Bike'
                    ? 'border-blue-600 shadow-lg ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full aspect-square max-h-32 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-slate-50">
                  <img
                    src="/assets/bike_option.jpg"
                    alt="Bike Ride"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-full text-center py-1 mt-1">
                  <span className="text-[11px] font-black text-gray-900 block">SAIT BIKE</span>
                  <span className="text-[10px] text-gray-500 font-bold">₹5 / km</span>
                </div>
              </button>

              {/* Car Option (User Image 4) */}
              <button
                type="button"
                onClick={() => setVehicleType('Car')}
                className={`p-2 rounded-3xl border-2 flex flex-col items-center justify-between transition-all relative overflow-hidden bg-white ${
                  vehicleType === 'Car'
                    ? 'border-blue-600 shadow-lg ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full aspect-square max-h-32 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-slate-50">
                  <img
                    src="/assets/car_option.jpg"
                    alt="Car Ride"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-full text-center py-1 mt-1">
                  <span className="text-[11px] font-black text-gray-900 block">SAIT CAR</span>
                  <span className="text-[10px] text-gray-500 font-bold">₹10 / km</span>
                </div>
              </button>
            </div>

            {/* PINK RIDE BANNER WITH USER UPLOADED IMAGE 2 */}
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
                  alt="Pink Ride Safe Together"
                  className="w-full h-auto object-cover max-h-24"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-sm ${
                      pinkRide ? 'bg-pink-600 text-white' : 'bg-white/90 text-pink-700'
                    }`}
                  >
                    {pinkRide ? '✓ Selected' : 'Tap to Select'}
                  </span>
                </div>
              </div>

              <div className="bg-pink-50/70 p-2.5 px-3 flex items-center justify-between text-[10px] font-bold text-pink-900">
                <span>🛵 Skilled Women Riders</span>
                <span>•</span>
                <span>✓ Verified & Trusted</span>
                <span>•</span>
                <span>👥 For Women By Women</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4">
            <button
              onClick={handleProceedToConfirm}
              className="w-full py-4 bg-[#EA5858] hover:bg-[#dc4848] active:scale-98 text-white font-extrabold text-base rounded-full shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>Search Rides & Match Captain</span>
            </button>
          </div>
        </div>
      </div>

      {/* LOCATION PICKER DRAWER (FIGMA PAGE 5 REPRODUCTION) */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900">Pickup & Destination</h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs Section */}
            <div className="p-5 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center space-x-3 relative">
                <div className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
                  <div className="w-0.5 h-10 bg-gray-300 my-1"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-100"></div>
                </div>

                <div className="flex-1 space-y-2.5">
                  <div
                    onClick={() => setActiveSelectionType('pickup')}
                    className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                      activeSelectionType === 'pickup'
                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-100 shadow-sm'
                        : 'bg-white/60 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Pickup Location</span>
                    <span className="text-gray-900 truncate block">{pickup}</span>
                  </div>

                  <div
                    onClick={() => setActiveSelectionType('drop')}
                    className={`p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                      activeSelectionType === 'drop'
                        ? 'bg-white border-red-500 ring-2 ring-red-100 shadow-sm'
                        : 'bg-white/60 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Drop Location</span>
                    <span className="text-gray-900 truncate block">{destination}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={swapLocations}
                  className="p-2.5 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 shadow-sm text-gray-600"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 font-bold mt-3 px-1">
                  ⚠️ {errorMsg}
                </p>
              )}
            </div>

            {/* PREDEFINED GOOGLE MAPS CAMPUS LOCATIONS */}
            <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-gray-100">
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                Google Maps Verified Campus Locations ({activeSelectionType === 'pickup' ? 'Select Pickup' : 'Select Drop'})
              </p>

              {PREDEFINED_LOCATIONS.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPredefined(loc.name)}
                  className="w-full py-3.5 flex items-start space-x-3 text-left hover:bg-gray-50 rounded-xl px-2 transition-colors active:scale-99"
                >
                  <RefreshCw className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-sm text-gray-900 truncate">
                        {loc.name}
                      </p>
                      {loc.isCampus ? (
                        <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                          SAIT Hub
                        </span>
                      ) : (
                        <span className="text-[11px] font-black text-gray-500 font-mono">
                          {loc.directKm} km
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {loc.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl text-sm"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default PassengerHome;
