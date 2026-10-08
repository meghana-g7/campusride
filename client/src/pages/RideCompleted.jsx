import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import Header from '../components/Header';
import confetti from 'canvas-confetti';
import { Star, CheckCircle, QrCode, Banknote, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const RideCompleted = () => {
  const navigate = useNavigate();
  const { activeRide, submitFeedback, clearActiveRide } = useRide();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Very safe and comfortable campus ride!');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [showQrModal, setShowQrModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);

  React.useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const driver = activeRide?.driverDetails || {
    name: 'Ajay Kumar',
    vehicleNumber: 'KA02AB1234',
    vehicleModel: 'TVS Jupiter',
    usn: '1ST23CS042',
    phone: '9876543211',
    rating: 4.8
  };

  const fare = activeRide?.fare || 20;

  // Clean initials (No cartoon avatars!)
  const driverInitials = driver.name
    ? driver.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AK';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);

    const res = await submitFeedback(rating, comment);
    setSubmitting(false);

    if (res?.success) {
      setFeedbackResult(res.stats);
      setTimeout(() => {
        clearActiveRide();
        navigate('/history');
      }, 1800);
    } else {
      clearActiveRide();
      navigate('/history');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="" showBack={false} showSOS={true} showHelp={false} />

      <div className="flex-1 px-6 pt-4 pb-8 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* FIGMA PAGE 10: "RIDE COMPLETED" BANNER */}
          <div className="flex items-center space-x-2 my-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm">
              ✓
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Ride Completed
            </h2>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            You have safely reached your destination.
          </p>

          {/* FIGMA PAGE 10: DRIVER DETAILS CARD (CLEAN INITIALS, NO FUNNY PICS) */}
          <div className="p-4 bg-white rounded-3xl border-2 border-gray-100 shadow-sm flex items-center justify-between mb-5">
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
              <p className="text-xs font-bold text-emerald-700 mt-1">
                📞 {driver.phone}
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md">
              {driverInitials}
            </div>
          </div>

          {/* PAYMENT SECTION */}
          <div className="p-4 bg-amber-50/70 rounded-3xl border border-amber-200 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-amber-900">Total Trip Fare</span>
              <span className="text-xl font-black text-amber-900">₹{fare}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('UPI');
                  setShowQrModal(true);
                }}
                className="p-2.5 bg-white hover:bg-gray-50 border border-amber-300 rounded-2xl flex items-center justify-center space-x-1.5 text-xs font-extrabold text-gray-900 shadow-sm"
              >
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>UPI QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`p-2.5 rounded-2xl border flex items-center justify-center space-x-1.5 text-xs font-extrabold transition-all ${
                  paymentMethod === 'Cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border-amber-300 shadow-sm'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Cash Paid</span>
              </button>
            </div>
          </div>

          {/* FIGMA PAGE 10: 5 STAR RATING */}
          <div className="py-2 text-center">
            <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-2">
              Rate your Captain
            </p>
            <div className="flex items-center justify-center space-x-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform active:scale-95"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-gray-200 fill-gray-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* FIGMA PAGE 10: FEEDBACK INPUT */}
          <div className="mt-1">
            <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider mb-2">
              FEEDBACK
            </h4>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave feedback for SAIT campus ride..."
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none shadow-sm"
            />
          </div>

          {feedbackResult && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800">
              <p className="font-bold">✓ Algorithm 7 (Bayesian Rating Update):</p>
              <p className="mt-0.5">
                Captain new rating: <strong>{feedbackResult.newWeightedRating} ⭐</strong> (Total rides: {feedbackResult.totalRides})
              </p>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-[#EA5858] hover:bg-[#dc4848] active:scale-98 text-white font-extrabold text-lg rounded-full shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <>
                <span>Submit Feedback</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* UPI QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl relative">
            <h3 className="font-extrabold text-lg text-gray-900">Campus UPI Payment</h3>
            <p className="text-xs text-gray-500 mb-3">Pay Captain {driver.name} directly</p>

            <div className="w-48 h-48 mx-auto bg-gray-50 border-2 border-dashed border-purple-300 rounded-2xl flex flex-col items-center justify-center p-2 mb-3">
              <QrCode className="w-32 h-32 text-purple-700" />
              <span className="text-[10px] font-mono font-bold text-gray-600">
                UPI: sait.campusride.{driver.phone}@sbi
              </span>
            </div>

            <div className="text-center mb-4">
              <span className="text-2xl font-black text-gray-900">₹{fare}</span>
              <p className="text-[11px] text-gray-500">Scan via PhonePe, GPay, or Paytm</p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-2xl text-xs"
            >
              Confirm Payment Completed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideCompleted;
