import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import api from '../services/api';
import { Star, MapPin, Bike, Car, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/rides/history');
        if (res.data.success) {
          setRides(res.data.rides || []);
        }
      } catch (e) {
        console.warn('Failed to load history:', e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="Ride History" showBack={false} showHelp={true} />

      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Your Rides
          </h2>
          <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
            {rides.length} trips
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            <span>Loading campus ride history...</span>
          </div>
        ) : rides.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm font-bold">No completed rides yet.</p>
            <p className="text-xs mt-1">Book your first campus ride from the home screen!</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {rides.map((ride, idx) => {
              const driver = ride.driverDetails || { name: 'Campus Rider', vehicleType: ride.vehicleType };
              const dateStr = ride.createdAt
                ? new Date(ride.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : '12 Oct 2026';

              return (
                <div
                  key={ride._id || ride.id || idx}
                  className="p-4 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500">{dateStr}</span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        ride.status === 'RIDE_COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ride.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ride.status === 'RIDE_COMPLETED' ? 'Completed' : ride.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        {ride.vehicleType === 'Car' ? (
                          <Car className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Bike className="w-4 h-4 text-blue-600" />
                        )}
                        <h4 className="font-extrabold text-sm text-gray-900">
                          {driver.name}
                        </h4>
                        {ride.pinkRide && (
                          <span className="text-[9px] bg-pink-100 text-pink-700 font-extrabold px-1.5 py-0.2 rounded-md">
                            Pink Ride
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {driver.vehicleModel || driver.vehicleType} • {driver.vehicleNumber || 'KA02AB1234'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-gray-900">₹{ride.fare}</span>
                      <span className="text-[10px] text-gray-400 block">{ride.distance} km</span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="p-2.5 bg-gray-50 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-gray-700 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="truncate">{ride.pickup}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-gray-700 truncate">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      <span className="truncate">{ride.destination}</span>
                    </div>
                  </div>

                  {/* Rating if present */}
                  {ride.rating && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= ride.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-200 fill-gray-100'
                            }`}
                          />
                        ))}
                      </div>
                      {ride.feedbackComment && (
                        <span className="text-[11px] text-gray-500 italic truncate max-w-[180px]">
                          "{ride.feedbackComment}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default RideHistory;
