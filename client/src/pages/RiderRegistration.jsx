import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import api from '../services/api';
import { CheckCircle2, Bike, Car, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const RiderRegistration = () => {
  const navigate = useNavigate();
  const { user, switchMode, refreshDriverProfile } = useAuth();

  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('KA02AB1234');
  const [vehicleModel, setVehicleModel] = useState('TVS Jupiter');
  const [rcNumber, setRcNumber] = useState('RC-KA02-2023-9812');

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    setStatusMessage('Verifying Driving License, Vehicle RC & Aadhar...');

    try {
      const res = await api.post('/drivers/profile', {
        vehicleType,
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        vehicleModel,
        rcNumber,
        rcDocument: 'mock_rc_verified.pdf',
        identityDocument: 'mock_aadhar_verified.pdf'
      });

      if (res.data.success) {
        setStatusMessage('Documents verified successfully! Going online...');
        await switchMode('driver');
        await refreshDriverProfile();
        setTimeout(() => {
          navigate('/driver');
        }, 1000);
      }
    } catch (err) {
      setStatusMessage(err.message || 'Verification failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="" showBack={true} onBack={() => navigate('/role')} showHelp={true} />

      <div className="flex-1 px-6 pt-4 pb-8 flex flex-col justify-between">
        <div>
          {/* FIGMA PAGE 2 TITLE */}
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Keep all your documents ready
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            SAIT Campus Safety & Driver Onboarding
          </p>

          {/* FIGMA PAGE 2 PROMINENT GREEN CHECKLIST BOX */}
          <div className="mt-5 p-6 bg-[#EDF9EE] rounded-3xl border border-[#D5F2D8] space-y-6 shadow-sm">
            {/* Driving License */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6 fill-white text-[#4CAF50]" />
              </div>
              <div>
                <p className="font-extrabold text-base text-gray-900">Driving License</p>
                <p className="text-[11px] text-gray-500">Government issued valid 2-wheeler / 4-wheeler DL</p>
              </div>
            </div>

            {/* Vehicle RC */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6 fill-white text-[#4CAF50]" />
              </div>
              <div>
                <p className="font-extrabold text-base text-gray-900">Vehicle RC</p>
                <p className="text-[11px] text-gray-500">Registration Certificate matching vehicle number</p>
              </div>
            </div>

            {/* Aadhar */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6 fill-white text-[#4CAF50]" />
              </div>
              <div>
                <p className="font-extrabold text-base text-gray-900">Aadhar / College ID</p>
                <p className="text-[11px] text-gray-500">SAIT Identity verification document</p>
              </div>
            </div>
          </div>

          {/* Vehicle Setup Form */}
          <form onSubmit={handleSubmit} id="driver-form" className="mt-6 space-y-3.5">
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                Select Your Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('Bike');
                    setVehicleModel('TVS Jupiter');
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold text-xs transition-all ${
                    vehicleType === 'Bike'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-200'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Bike (₹5/km)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('Car');
                    setVehicleModel('Maruti Swift');
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold text-xs transition-all ${
                    vehicleType === 'Car'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-200'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Car (₹10/km)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">
                  Vehicle Plate No.
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="KA02AB1234"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="TVS Jupiter"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
          </form>
        </div>

        {/* FIGMA PAGE 2 "Loading" / "Proceed" BUTTON */}
        <div className="pt-6">
          {statusMessage && (
            <p className="text-center text-xs font-bold text-emerald-700 mb-2 animate-pulse">
              ✓ {statusMessage}
            </p>
          )}

          <button
            type="submit"
            form="driver-form"
            disabled={submitting}
            className="w-full py-4 bg-[#EA5858] hover:bg-[#dc4848] active:scale-98 text-white font-extrabold text-lg rounded-full shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Proceed & Go Online</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderRegistration;
