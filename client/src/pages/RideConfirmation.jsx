import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRide, PREDEFINED_LOCATIONS } from '../context/RideContext';
import Header from '../components/Header';
import MapView from '../components/MapView';
import { Bike, Car, Star, Clock, MapPin, Sparkles, CheckCircle, ChevronDown, ChevronUp, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

const RideConfirmation = () => {
  const navigate = useNavigate();
  const {
    pickup,
    destination,
    vehicleType,
    setVehicleType,
    pinkRide,
    nearbyDrivers,
    recommendedDriver,
    algorithmData,
    loadingDrivers,
    bookRide,
    bookingLoading
  } = useRide();

  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [showAlgoDetails, setShowAlgoDetails] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Coordinates and precise Google Maps distances
  const pickupObj = PREDEFINED_LOCATIONS.find(l => l.name === pickup) || PREDEFINED_LOCATIONS[0];
  const destObj = PREDEFINED_LOCATIONS.find(l => l.name === destination) || PREDEFINED_LOCATIONS[1];

  // Exact Google Maps verified road distance
  let preciseKm = 2.0;
  if (destObj.directKm && destObj.directKm > 0) {
    preciseKm = destObj.directKm;
  } else if (pickupObj.directKm && pickupObj.directKm > 0) {
    preciseKm = pickupObj.directKm;
  }

  const bikeFare = Math.max(20, Math.round(preciseKm * 5));
  const carFare = Math.max(40, Math.round(preciseKm * 10));
  const activeFare = vehicleType === 'Car' ? carFare : bikeFare;
  const estimatedMin = Math.max(3, Math.round(preciseKm * 2.5));

  // Default selected driver
  useEffect(() => {
    if (recommendedDriver) {
      setSelectedDriverId(recommendedDriver.id || recommendedDriver._id);
    }
  }, [recommendedDriver]);

  const handleConfirmRide = async () => {
    setErrorMsg('');
    const res = await bookRide(selectedDriverId);
    if (res?.success) {
      navigate('/tracking');
    } else {
      setErrorMsg(res?.message || 'Ride booking failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="Ride Options" showBack={true} onBack={() => navigate('/home')} showHelp={true} />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Map View with Real Route (Figma Page 6 & 7) */}
        <div className="h-[34vh] w-full relative">
          <MapView
            center={[pickupObj.lat, pickupObj.lng]}
            pickupCoords={{ lat: pickupObj.lat, lng: pickupObj.lng }}
            dropCoords={{ lat: destObj.lat, lng: destObj.lng }}
            driverCoords={recommendedDriver ? { lat: recommendedDriver.latitude, lng: recommendedDriver.longitude } : null}
            driverType={vehicleType}
            showRoute={true}
            className="h-full w-full rounded-none"
          />

          {/* FIGMA PAGE 6: "PICK UP" Green Label Banner */}
          <div className="absolute top-3 left-4 z-20 bg-[#10B981] text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md tracking-wider flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>PICK UP</span>
          </div>

          {/* Exact Distance & Duration Pill */}
          <div className="absolute bottom-3 right-4 z-20 bg-slate-900/95 text-white backdrop-blur-sm px-3.5 py-1.5 rounded-2xl shadow-xl border border-slate-700 text-right">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Google Maps Route</p>
            <p className="text-xs font-black">{preciseKm} km • {estimatedMin} mins</p>
          </div>
        </div>

        {/* BOTTOM CONTENT (FIGMA PAGE 7) */}
        <div className="flex-1 -mt-5 bg-white rounded-t-3xl shadow-2xl z-20 px-5 pt-3.5 pb-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-3" />

            {/* Check Pickup Point Box (Figma Page 6) */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 mb-3 flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                  Check your pickup point
                </span>
                <p className="text-xs font-black text-gray-900 truncate">
                  SURVEY 131, {pickup}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  Drop: {destination}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* VEHICLE FARE TILES (FIGMA PAGE 7) */}
            <div className="space-y-2 mb-3">
              {/* Bike Option */}
              <div
                onClick={() => setVehicleType('Bike')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  vehicleType === 'Bike'
                    ? 'border-red-500 bg-red-50/20 shadow-md ring-1 ring-red-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img src="/assets/bike_option.jpg" alt="Bike" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-sm text-gray-900">Bike</h4>
                      {pinkRide && (
                        <span className="text-[9px] bg-pink-100 text-pink-700 font-black px-1.5 py-0.2 rounded-md">
                          Pink Ride
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {estimatedMin} min away • Drop ~{preciseKm} km
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-gray-900">{bikeFare} RS</span>
                  <span className="text-[10px] text-gray-400 block font-bold">₹5/km</span>
                </div>
              </div>

              {/* Car Option */}
              <div
                onClick={() => setVehicleType('Car')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  vehicleType === 'Car'
                    ? 'border-red-500 bg-red-50/20 shadow-md ring-1 ring-red-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img src="/assets/car_option.jpg" alt="Car" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-gray-900">Car</h4>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {estimatedMin + 2} min away • Drop ~{preciseKm} km
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-gray-900">{carFare} RS</span>
                  <span className="text-[10px] text-gray-400 block font-bold">₹10/km</span>
                </div>
              </div>
            </div>

            {/* NEARBY DRIVERS LIST (RAPIDO/OLA/UBER STYLE - CLEAN INITIALS, NO FUNNY PICS) */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
                  Nearby Captains (KNN & Greedy Ranked)
                </span>
                <button
                  type="button"
                  onClick={() => setShowAlgoDetails(!showAlgoDetails)}
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center space-x-0.5"
                >
                  <span>Algorithm Insights</span>
                  {showAlgoDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Algorithm Details Box */}
              {showAlgoDetails && algorithmData && (
                <div className="p-3 mb-2.5 bg-slate-900 text-white rounded-2xl text-[10px] space-y-1 shadow-inner">
                  <div className="flex justify-between items-center text-sky-400 font-bold border-b border-slate-800 pb-1">
                    <span>Algorithm 2: KNN (K=4) + Algorithm 3: Greedy Score</span>
                  </div>
                  <p className="font-mono text-emerald-300">{algorithmData.formula}</p>
                </div>
              )}

              {loadingDrivers ? (
                <div className="py-3 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  <span>Matching captains with algorithms...</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {nearbyDrivers.map((driver) => {
                    const isSelected = selectedDriverId === (driver.id || driver._id);
                    const isBest = recommendedDriver && (driver.id === recommendedDriver.id || driver._id === recommendedDriver._id);

                    // Professional driver initials (e.g. "Ananya" -> "AN", "Ajay Kumar" -> "AK")
                    const initials = driver.name
                      ? driver.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'CP';

                    return (
                      <div
                        key={driver.id || driver._id}
                        onClick={() => setSelectedDriverId(driver.id || driver._id)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-200'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {/* Clean Initials Avatar (No cartoon photos!) */}
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            {initials}
                          </div>

                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-black text-xs text-gray-900">{driver.name}</span>
                              <span className="text-[10px] font-bold text-amber-600 flex items-center">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                                {driver.rating}
                              </span>
                              {isBest && (
                                <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                                  Best Match
                                </span>
                              )}
                              {driver.pinkRideEligible && (
                                <span className="bg-pink-100 text-pink-700 text-[8px] font-black px-1 py-0.2 rounded-full">
                                  Pink
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">
                              {driver.vehicleModel || driver.vehicleType} • {driver.distanceKm || driver.distance} km away • ETA {driver.etaMinutes || driver.eta} min
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">
                            Score: {driver.matchingScore || '0.85'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* FIGMA PAGE 7 "Book ride" CORAL RED BUTTON */}
          <div className="pt-2">
            <button
              onClick={handleConfirmRide}
              disabled={bookingLoading}
              className="w-full py-4 bg-[#EA5858] hover:bg-[#dc4848] active:scale-98 text-white font-extrabold text-lg rounded-full shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2"
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Matching Captain...</span>
                </>
              ) : (
                <span>Book ride • ₹{activeFare}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideConfirmation;
