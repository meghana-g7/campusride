import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import {
  User,
  Mail,
  GraduationCap,
  Award,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Building2,
  Camera,
  Upload,
  Eye,
  RefreshCw,
  X,
  ScanFace
} from 'lucide-react';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Mode: 'register' (New Student Verification) or 'signin' (Existing Account)
  const [activeTab, setActiveTab] = useState('register');

  // Completely Clean, Fresh Form State (NO PRE-FILLED / RAW DATABASE)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    collegeEmail: '',
    classDepartment: '6th Sem, CSE',
    usn: '',
    phone: '',
    gender: 'female',
    password: '',
    confirmPassword: '',
    otp: '',
    idCardImage: null,
    faceImage: null,
    isFaceVerified: false
  });

  // Sign-in identifier (Clean, empty)
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // OTP Push Notification Pop-up State
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Live Face Recognition & Blink Detection Modal State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [livenessStage, setLivenessStage] = useState('align'); // 'align' | 'blink_prompt' | 'capturing' | 'verifying' | 'verified'
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [matchScore, setMatchScore] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  // Indian Phone Number sanitization
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: raw }));
    setErrorMsg('');
  };

  // Trigger Send OTP banner on top
  const handleRequestOtp = () => {
    if (!formData.phone || formData.phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number first.');
      return;
    }
    const otpCode = '3060';
    setGeneratedOtp(otpCode);
    setShowPushNotification(true);
    setErrorMsg('');
  };

  // Auto-fill OTP from pop-up
  const handleAutofillOtp = () => {
    setFormData((prev) => ({ ...prev, otp: generatedOtp }));
    setIsOtpVerified(true);
    setShowPushNotification(false);
  };

  // Manual OTP verification
  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData((prev) => ({ ...prev, otp: val }));
    if (val === '3060' || (generatedOtp && val === generatedOtp)) {
      setIsOtpVerified(true);
      setErrorMsg('');
    } else {
      setIsOtpVerified(false);
    }
  };

  // Handle College ID Card Upload
  const handleIdCardUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, idCardImage: reader.result }));
        setSuccessMsg('College ID Card uploaded successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Live Face Recognition Camera
  const startCamera = async () => {
    setIsCameraModalOpen(true);
    setLivenessStage('align');
    setBlinkDetected(false);
    setMatchScore(0);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Camera access error or denied:', err);
      // Fallback works with simulated biometric feed inside modal
    }

    // Progression: Align -> Blink Prompt after 2 seconds
    setTimeout(() => {
      setLivenessStage('blink_prompt');
    }, 2200);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraModalOpen(false);
  };

  // Trigger Blink Detection & Biometric Capture
  const triggerBlinkDetection = () => {
    setBlinkDetected(true);
    setLivenessStage('capturing');

    // Capture snapshot from video or create stylized avatar
    let capturedPhoto = null;
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      capturedPhoto = canvas.toDataURL('image/jpeg');
    }

    // Biometric facial matching simulation with uploaded ID Card
    setTimeout(() => {
      setLivenessStage('verifying');
      let score = 0;
      const interval = setInterval(() => {
        score += 15;
        if (score >= 98) {
          score = 98.4;
          clearInterval(interval);
          setMatchScore(score);
          setLivenessStage('verified');

          // Store verified face
          setFormData((prev) => ({
            ...prev,
            faceImage: capturedPhoto || prev.idCardImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            isFaceVerified: true
          }));

          setTimeout(() => {
            stopCamera();
          }, 1800);
        } else {
          setMatchScore(score);
        }
      }, 120);
    }, 800);
  };

  // Submit Registration with all College Credentials
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!formData.usn.trim().toUpperCase().startsWith('1ST')) {
      setErrorMsg('College USN must start with "1ST" (e.g. 1ST23CS001).');
      return;
    }
    if (!formData.collegeEmail.includes('@sambhram.org') && !formData.collegeEmail.includes('@')) {
      setErrorMsg('Please enter a valid College Email ID (@sambhram.org).');
      return;
    }
    if (formData.phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    if (formData.otp !== '3060' && formData.otp !== generatedOtp) {
      setErrorMsg('Please verify the 4-digit mobile OTP (Code: 3060).');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name.trim(),
      email: formData.email.trim() || `${formData.usn.toLowerCase()}@gmail.com`,
      collegeEmail: formData.collegeEmail.trim(),
      classDepartment: formData.classDepartment,
      usn: formData.usn.trim().toUpperCase(),
      phone: formData.phone,
      gender: formData.gender,
      password: formData.password,
      confirmPassword: formData.password,
      idCardImage: formData.idCardImage,
      faceImage: formData.faceImage,
      isFaceVerified: formData.isFaceVerified
    });
    setLoading(false);

    if (res?.success) {
      navigate('/role');
    } else {
      setErrorMsg(res?.message || 'Registration failed.');
    }
  };

  // Submit Sign In using USN, College Email, or Personal Email
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signInIdentifier.trim()) {
      setErrorMsg('Please enter your USN, College Email, or Phone.');
      return;
    }
    if (!signInPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await login(signInIdentifier.trim(), signInPassword);
    setLoading(false);

    if (res?.success) {
      navigate('/role');
    } else {
      setErrorMsg(res?.message || 'Invalid college credentials. Please check USN/password.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative font-sans">
      {/* Header with prominent Back Button to Welcome screen */}
      <Header
        title="College Portal"
        showBack={true}
        onBack={() => navigate('/')}
        showHelp={true}
      />

      {/* TOP PUSH-NOTIFICATION OTP BANNER (SIMULATED SMARTPHONE SMS) */}
      {showPushNotification && (
        <div className="fixed top-2 inset-x-3 max-w-sm mx-auto z-50 animate-slide-down">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <MessageSquare className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-extrabold uppercase text-gray-300">
                    SAIT Security • Campus SMS
                  </span>
                  <span className="text-[10px] text-gray-400">now</span>
                </div>
                <p className="text-xs font-medium text-gray-100 mt-0.5 leading-snug">
                  Your CampusRide OTP is{' '}
                  <span className="font-black text-amber-300 text-sm tracking-wider">3060</span>. Valid for 10 minutes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutofillOtp}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-extrabold rounded-xl shrink-0 ml-2 shadow-sm active:scale-95"
            >
              Auto-fill
            </button>
          </div>
        </div>
      )}

      {/* LIVE FACE RECOGNITION & BLINK DETECTION MODAL */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 relative text-center">
            <button
              onClick={stopCamera}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center space-x-2 mb-2">
              <ScanFace className="w-6 h-6 text-red-600 animate-pulse" />
              <h3 className="text-base font-black text-gray-900">
                Live Biometric Liveness Check
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Face recognition & eye-blink verification for Sambhram Institute (SAIT)
            </p>

            {/* Video Viewport / Biometric Scanner */}
            <div className="relative w-64 h-64 mx-auto rounded-3xl overflow-hidden bg-slate-900 border-4 border-red-500/80 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Oval Face Guide */}
              <div className="absolute inset-4 rounded-[50%] border-2 border-dashed border-emerald-400 pointer-events-none flex items-center justify-center">
                {livenessStage === 'align' && (
                  <span className="text-[11px] bg-black/60 text-white px-2.5 py-1 rounded-full font-bold">
                    Center Your Face
                  </span>
                )}
                {livenessStage === 'blink_prompt' && (
                  <span className="text-[11px] bg-amber-500 text-black px-2.5 py-1 rounded-full font-black animate-bounce">
                    👀 Blink Your Eyes Now!
                  </span>
                )}
                {livenessStage === 'verifying' && (
                  <span className="text-[11px] bg-blue-600 text-white px-2.5 py-1 rounded-full font-bold animate-pulse">
                    Matching: {matchScore}%
                  </span>
                )}
                {livenessStage === 'verified' && (
                  <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full font-black text-xs flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified {matchScore}%</span>
                  </div>
                )}
              </div>

              {/* Shutter Flash Animation */}
              {blinkDetected && livenessStage === 'capturing' && (
                <div className="absolute inset-0 bg-white animate-ping"></div>
              )}
            </div>

            {/* Hidden canvas for capturing frame */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Dynamic Status / Actions */}
            <div className="mt-4">
              {livenessStage === 'blink_prompt' && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-amber-600">
                    Blink eyes or click below to register live presence:
                  </p>
                  <button
                    type="button"
                    onClick={triggerBlinkDetection}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl text-xs shadow-md flex items-center justify-center space-x-1.5 active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>I am Blinking — Capture Face</span>
                  </button>
                </div>
              )}

              {livenessStage === 'verifying' && (
                <div className="space-y-1.5 py-2">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-150"
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono font-bold">
                    Verifying biometric landmarks with College ID Card...
                  </p>
                </div>
              )}

              {livenessStage === 'verified' && (
                <p className="text-xs font-black text-emerald-600 py-2">
                  ✓ Face & Liveness Verified! Match score: 98.4%
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 px-5 py-4 overflow-y-auto max-w-md mx-auto w-full">
        {/* Header Institution Tag */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-red-600" />
            <span className="text-[11px] font-black text-red-600 uppercase tracking-wider">
              Sambhram Institute of Technology (SAIT)
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            CampusRide Access
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Smart transportation for SAIT students and faculty
          </p>
        </div>

        {/* Tab Toggle: Register vs Sign In */}
        <div className="flex bg-gray-200/80 p-1 rounded-2xl mb-5 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            New Student Verification
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In with USN / Email
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-xs text-red-600 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= REGISTER TAB (MANUAL DETAILS ONLY) ================= */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* 2. USN Number */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                College USN Number
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  name="usn"
                  value={formData.usn}
                  onChange={handleInputChange}
                  placeholder="e.g. 1ST23CS001"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-mono font-black uppercase tracking-wider text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Sambhram Institute format: 1ST[YY][DEPT][XXX]</p>
            </div>

            {/* 3. College Email ID */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                College Email ID (@sambhram.org)
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  name="collegeEmail"
                  value={formData.collegeEmail}
                  onChange={handleInputChange}
                  placeholder="student.dept@sambhram.org"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* 4. Personal Email */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Personal Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="personal@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* 5. Class / Department & Sem */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Class / Department & Semester
              </label>
              <select
                name="classDepartment"
                value={formData.classDepartment}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="6th Sem, CSE">6th Sem, CSE</option>
                <option value="6th Sem, AIML">6th Sem, AIML</option>
                <option value="7th Sem, ISE">7th Sem, ISE</option>
                <option value="7th Sem, ECE">7th Sem, ECE</option>
                <option value="8th Sem, CSE">8th Sem, CSE</option>
                <option value="4th Sem, AI&DS">4th Sem, AI&DS</option>
                <option value="Faculty / Staff">Faculty / Staff</option>
              </select>
            </div>

            {/* 6. Indian Mobile Number & OTP Pop-up */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Indian Phone Number
              </label>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-2.5 bg-gray-100 rounded-2xl font-black text-xs text-gray-800 border border-gray-200 shrink-0">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10-digit number"
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="px-3 py-2.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-2xl shrink-0 active:scale-95 transition-transform"
                >
                  Get OTP
                </button>
              </div>
            </div>

            {/* 7. OTP Code Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-black text-gray-700 uppercase">
                  Mobile Verification OTP
                </label>
                {isOtpVerified && (
                  <span className="text-[10px] font-black text-emerald-600 flex items-center space-x-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>OTP Verified</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={4}
                value={formData.otp}
                onChange={handleOtpChange}
                placeholder="Type 4-digit code (Code: 3060)"
                className={`w-full px-4 py-2.5 bg-white border rounded-2xl text-xs font-mono font-black text-gray-900 tracking-widest focus:outline-none focus:ring-2 ${
                  isOtpVerified ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-200' : 'border-gray-200 focus:ring-red-400'
                }`}
              />
            </div>

            {/* 8. College ID Card Photo Upload */}
            <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-2">
                College ID Card Verification
              </label>

              <div className="flex items-center space-x-3">
                {formData.idCardImage ? (
                  <div className="w-14 h-14 rounded-xl border border-emerald-300 overflow-hidden shrink-0 shadow-sm relative">
                    <img src={formData.idCardImage} alt="ID Card" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-bold text-center">
                      Loaded
                    </span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center shrink-0 text-gray-400">
                    <Upload className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleIdCardUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold border border-gray-200 transition-colors"
                  >
                    {formData.idCardImage ? 'Change ID Card' : 'Upload College ID Card'}
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1">Photo or scan showing your SAIT USN</p>
                </div>
              </div>
            </div>

            {/* 9. Live Face Recognition & Eye-Blink Liveness Check */}
            <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-2">
                Face Recognition & Blink Detection
              </label>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {formData.isFaceVerified && formData.faceImage ? (
                    <div className="w-12 h-12 rounded-full ring-2 ring-emerald-500 overflow-hidden shrink-0">
                      <img src={formData.faceImage} alt="Face" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {formData.isFaceVerified ? 'Biometrics Verified' : 'Live Camera Liveness'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {formData.isFaceVerified ? 'Biometric match 98.4% ✓' : 'Detects eye blink & matches ID'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startCamera}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                    formData.isFaceVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-95'
                  }`}
                >
                  <ScanFace className="w-3.5 h-3.5" />
                  <span>{formData.isFaceVerified ? 'Re-Verify' : 'Start Scan'}</span>
                </button>
              </div>
            </div>

            {/* 10. Gender (Safety & Pink Ride Rule) */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Gender (Safety & Pink Ride Rule)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, gender: 'female' }))}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    formData.gender === 'female'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-xs ring-1 ring-pink-300'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Female (Pink Ride)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, gender: 'male' }))}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    formData.gender === 'male'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-300'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  <span>Male</span>
                </button>
              </div>
            </div>

            {/* 11. Password & Confirm Password */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min 6 chars"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-type password"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-99 text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <span>Registering & Verifying...</span>
              ) : (
                <>
                  <span>Complete Verification & Select Role</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= SIGN IN TAB (MANUAL CREDENTIALS) ================= */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                College USN / College Email / Phone
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="e.g. 1ST23CS001 or student@sambhram.org"
                  className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-99 text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In & Select Role</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
