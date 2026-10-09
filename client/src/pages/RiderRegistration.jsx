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
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const [dlUploaded, setDlUploaded] = useState(false);
  const [rcUploaded, setRcUploaded] = useState(false);
  const [aadhaarUploaded, setAadhaarUploaded] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!vehicleNumber.trim()) {
      setStatusMessage('Please enter your vehicle plate number.');
      return;
    }
    setSubmitting(true);
    setStatusMessage('Verifying Driving License, Vehicle RC & Aadhaar...');

    try {
      const res = await api.post('/drivers/profile', {
        vehicleType,
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        vehicleModel: vehicleModel.trim() || (vehicleType === 'Bike' ? 'Two-Wheeler' : 'Sedan/Hatchback'),
        rcNumber: rcNumber.trim() || `RC-${vehicleNumber.toUpperCase().trim()}`,
        rcDocument: rcUploaded ? 'rc_uploaded.jpg' : 'mock_rc_verified.pdf',
        identityDocument: aadhaarUploaded ? 'aadhaar_uploaded.jpg' : 'mock_aadhar_verified.pdf'
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
          <div className="mt-4 p-5 bg-[#EDF9EE] rounded-3xl border border-[#D5F2D8] space-y-4 shadow-sm">
            {/* Driving License */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 fill-white text-[#4CAF50]" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900">Driving License</p>
                  <p className="text-[10px] text-gray-500">Government issued valid DL</p>
                </div>
              </div>
              <label className="cursor-pointer px-2.5 py-1 bg-white hover:bg-gray-50 border border-green-300 rounded-xl text-[11px] font-bold text-green-800 shadow-xs">
                {dlUploaded ? '✓ Uploaded' : 'Upload DL'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={() => setDlUploaded(true)}
                />
              </label>
            </div>

            {/* Vehicle RC */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 fill-white text-[#4CAF50]" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900">Vehicle RC Card</p>
                  <p className="text-[10px] text-gray-500">Registration Certificate</p>
                </div>
              </div>
              <label className="cursor-pointer px-2.5 py-1 bg-white hover:bg-gray-50 border border-green-300 rounded-xl text-[11px] font-bold text-green-800 shadow-xs">
                {rcUploaded ? '✓ Uploaded' : 'Upload RC'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={() => setRcUploaded(true)}
                />
              </label>
            </div>

            {/* Aadhaar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 fill-white text-[#4CAF50]" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900">Aadhaar Card / SAIT ID</p>
                  <p className="text-[10px] text-gray-500">Government / College Identity</p>
                </div>
              </div>
              <label className="cursor-pointer px-2.5 py-1 bg-white hover:bg-gray-50 border border-green-300 rounded-xl text-[11px] font-bold text-green-800 shadow-xs">
                {aadhaarUploaded ? '✓ Uploaded' : 'Upload ID'}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={() => setAadhaarUploaded(true)}
                />
              </label>
            </div>
          </div>

          {/* Vehicle Setup Form */}
          <form onSubmit={handleSubmit} id="driver-form" className="mt-5 space-y-3">
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                Select Your Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('Bike');
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
                  placeholder="e.g. KA04EK2024"
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
                  placeholder="e.g. Activa 6G / Swift"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">
                  Vehicle RC Number
                </label>
                <input
                  type="text"
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value.toUpperCase())}
                  placeholder="RC Number"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase mb-1">
                  Driving License No.
                </label>
                <input
                  type="text"
                  value={dlNumber}
                  onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                  placeholder="DL Number"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
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
