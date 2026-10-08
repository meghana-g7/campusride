import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from './AuthContext';

const RideContext = createContext();

export const PREDEFINED_LOCATIONS = [
  { name: 'Sambhram Institute of Technology', desc: 'Adityanagar, Vidyaranyapura, Bengaluru (SAIT)', lat: 13.0805, lng: 77.5458, isCampus: true, directKm: 0 },
  { name: 'MS Palya Circle', desc: 'Vidyaranyapura, Bengaluru (2.0 km via Main Rd)', lat: 13.0760, lng: 77.5580, directKm: 2.0 },
  { name: 'Lakshmipura Cross', desc: 'Vidyaranyapura, Bengaluru (2.4 km via Hesaraghatta Rd)', lat: 13.0900, lng: 77.5380, directKm: 2.4 },
  { name: 'Jalahalli Cross Road', desc: 'Peenya / Jalahalli, Bengaluru (4.1 km via Peenya Rd)', lat: 13.0538, lng: 77.5255, directKm: 4.1 },
  { name: '8th Mile', desc: 'T. Dasarahalli, Bengaluru (5.2 km via NH 48)', lat: 13.0450, lng: 77.5100, directKm: 5.2 },
  { name: 'BEL Circle', desc: 'Jalahalli East, Bengaluru (5.5 km via BEL Rd)', lat: 13.0400, lng: 77.5500, directKm: 5.5 },
  { name: 'Nelamangala', desc: 'Bengaluru Rural, Karnataka (17.5 km via Tumkur Rd)', lat: 13.0980, lng: 77.3910, directKm: 17.5 }
];

export const RideProvider = ({ children }) => {
  const { user } = useAuth();

  const [pickup, setPickup] = useState('Sambhram Institute of Technology');
  const [destination, setDestination] = useState('MS Palya Circle');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [pinkRide, setPinkRide] = useState(false);

  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [recommendedDriver, setRecommendedDriver] = useState(null);
  const [algorithmData, setAlgorithmData] = useState(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const [activeRide, setActiveRide] = useState(null);
  const [incomingDriverRequest, setIncomingDriverRequest] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Restore active ride from localStorage on refresh
  useEffect(() => {
    const savedRideId = localStorage.getItem('campusride_active_ride_id');
    if (savedRideId) {
      api.get(`/rides/${savedRideId}`)
        .then(res => {
          if (res.data.success && res.data.ride) {
            setActiveRide(res.data.ride);
          }
        })
        .catch(() => {
          localStorage.removeItem('campusride_active_ride_id');
        });
    }
  }, []);

  // Fetch Nearby Drivers with algorithm matching
  const fetchNearbyDrivers = useCallback(async (customParams = {}) => {
    setLoadingDrivers(true);
    try {
      const p = customParams.pickup || pickup;
      const v = customParams.vehicleType || vehicleType;
      const pr = customParams.pinkRide !== undefined ? customParams.pinkRide : pinkRide;

      const res = await api.get('/drivers/nearby', {
        params: {
          pickup: p,
          vehicleType: v,
          pinkRide: pr,
          k: 4
        }
      });

      if (res.data.success) {
        setNearbyDrivers(res.data.drivers || []);
        setRecommendedDriver(res.data.recommendedDriver || null);
        setAlgorithmData(res.data.algorithmData || null);
      }
    } catch (err) {
      console.warn('Error fetching nearby drivers:', err.message);
    } finally {
      setLoadingDrivers(false);
    }
  }, [pickup, vehicleType, pinkRide]);

  // Request & Book Ride
  const bookRide = async (selectedDriverId = null) => {
    setBookingLoading(true);
    try {
      const payload = {
        pickup,
        destination,
        vehicleType,
        pinkRide,
        selectedDriverId: selectedDriverId || recommendedDriver?.id || recommendedDriver?._id
      };

      const res = await api.post('/rides', payload);
      if (res.data.success) {
        const ride = res.data.ride;
        setActiveRide(ride);
        const rideId = ride._id || ride.id;
        localStorage.setItem('campusride_active_ride_id', rideId);
        return { success: true, ride };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setBookingLoading(false);
    }
  };

  // Update Ride Status (for Driver or Passenger flow)
  const updateRideStatus = async (status, enteredPin = null, extra = {}) => {
    if (!activeRide) return { success: false, message: 'No active ride' };
    const rideId = activeRide._id || activeRide.id;

    try {
      const payload = { status, enteredPin, ...extra };
      const res = await api.patch(`/rides/${rideId}/status`, payload);
      if (res.data.success) {
        setActiveRide(res.data.ride);
        if (status === 'RIDE_COMPLETED' || status === 'CANCELLED') {
          // Keep activeRide until feedback submitted, then clear
        }
        return { success: true, ride: res.data.ride };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Submit Feedback & Rating
  const submitFeedback = async (rating, comment) => {
    if (!activeRide) return { success: false, message: 'No active ride to rate' };
    const rideId = activeRide._id || activeRide.id;

    try {
      const res = await api.post(`/rides/${rideId}/feedback`, { rating, comment });
      if (res.data.success) {
        localStorage.removeItem('campusride_active_ride_id');
        setActiveRide(null);
        return { success: true, stats: res.data.ratingStats };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Cancel Current Ride
  const cancelRide = async () => {
    if (!activeRide) return;
    await updateRideStatus('CANCELLED');
    localStorage.removeItem('campusride_active_ride_id');
    setActiveRide(null);
  };

  // Clear Active Ride manually
  const clearActiveRide = () => {
    localStorage.removeItem('campusride_active_ride_id');
    setActiveRide(null);
  };

  // Real-time Socket.IO synchronization for 2-Device Demo
  useEffect(() => {
    if (!socket) return;

    // Handle real-time incoming ride request on driver device
    const handleIncomingRequest = (data) => {
      console.log('[Socket] Incoming ride request for driver:', data);
      setIncomingDriverRequest(data.ride);
    };

    // Handle active ride updates
    const handleRideUpdate = (updatedRide) => {
      console.log('[Socket] Live ride update received:', updatedRide.status);
      setActiveRide(prev => {
        if (!prev) return updatedRide;
        const prevId = prev._id || prev.id;
        const newId = updatedRide._id || updatedRide.id;
        if (prevId === newId) {
          return { ...prev, ...updatedRide };
        }
        return prev;
      });
    };

    socket.on('incoming_ride_request', handleIncomingRequest);

    if (activeRide) {
      const rideId = activeRide._id || activeRide.id;
      socket.on(`ride_update_${rideId}`, handleRideUpdate);
    }

    return () => {
      socket.off('incoming_ride_request', handleIncomingRequest);
      if (activeRide) {
        const rideId = activeRide._id || activeRide.id;
        socket.off(`ride_update_${rideId}`, handleRideUpdate);
      }
    };
  }, [activeRide]);

  return (
    <RideContext.Provider
      value={{
        pickup,
        setPickup,
        destination,
        setDestination,
        vehicleType,
        setVehicleType,
        pinkRide,
        setPinkRide,
        nearbyDrivers,
        recommendedDriver,
        algorithmData,
        loadingDrivers,
        activeRide,
        setActiveRide,
        incomingDriverRequest,
        setIncomingDriverRequest,
        bookingLoading,
        fetchNearbyDrivers,
        bookRide,
        updateRideStatus,
        submitFeedback,
        cancelRide,
        clearActiveRide,
        predefinedLocations: PREDEFINED_LOCATIONS
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
export default RideContext;
