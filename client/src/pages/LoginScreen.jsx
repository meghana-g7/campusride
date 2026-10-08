import React, { useState } from 'react';
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
  Building2
} from 'lucide-react';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, register, demoLogin } = useAuth();

  // Mode: 'credentials' (Full college form) or 'quick' (Existing user quick sign-in)
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'signin'

  // Comprehensive College Credentials State as requested
  const [formData, setFormData] = useState({
    name: 'Meghana S',
    email: 'meghana@gmail.com',
    collegeEmail: 'meghana.cs@sambhram.org',
    classDepartment: '6th Sem, CSE',
    usn: '1ST23CS001',
    phone: '9876543210',
    gender: 'female',
    password: 'password123',
    otp: ''
  });

  // Sign-in identifier (Email, College Email, or USN)
  const [signInIdentifier, setSignInIdentifier] = useState('1ST23CS001');
  const [signInPassword, setSignInPassword] = useState('password123');

  // Push notification state
  const [showPushNotification, setShowPushNotification] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('3060');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-configured College Profiles for 1-Tap Review Demo
  const quickProfiles = [
    {
      label: 'Meghana (Passenger)',
      name: 'Meghana S',
      email: 'meghana@gmail.com',
      collegeEmail: 'meghana.cs@sambhram.org',
      classDepartment: '6th Sem, CSE',
      usn: '1ST23CS001',
      phone: '9876543210',
      gender: 'female',
      key: 'passenger',
      badge: 'Passenger'
    },
    {
      label: 'Ananya (Pink Ride Captain)',
      name: 'Ananya',
      email: 'ananya@gmail.com',
      collegeEmail: 'ananya.aiml@sambhram.org',
      classDepartment: '6th Sem, AIML',
      usn: '1ST23AI018',
      phone: '9876543212',
      gender: 'female',
      key: 'driver_pink',
      badge: 'Pink Ride'
    },
    {
      label: 'Ajay Kumar (Bike Captain)',
      name: 'Ajay Kumar',
      email: 'ajay@gmail.com',
      collegeEmail: 'ajay.cs@sambhram.org',
      classDepartment: '8th Sem, CSE',
      usn: '1ST23CS042',
      phone: '9876543211',
      gender: 'male',
      key: 'driver_bike',
      badge: 'Bike Driver'
    },
    {
      label: 'Kiran (Car Captain)',
      name: 'Kiran',
      email: 'kiran@gmail.com',
      collegeEmail: 'kiran.ece@sambhram.org',
      classDepartment: '7th Sem, ECE',
      usn: '1ST23EC055',
      phone: '9876543215',
      gender: 'male',
      key: 'driver_car',
      badge: 'Car Driver'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  // Trigger Send OTP banner on top
  const handleRequestOtp = () => {
    setGeneratedOtp('3060');
    setShowPushNotification(true);
  };

  // Auto-fill OTP
  const handleAutofillOtp = () => {
    setFormData((prev) => ({ ...prev, otp: generatedOtp }));
    setShowPushNotification(false);
  };

  // Submit Registration with all College Credentials
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.name.trim()) {
      setErrorMsg('User Name is required.');
      return;
    }
    if (!formData.usn.trim().toUpperCase().startsWith('1ST')) {
      setErrorMsg('USN must start with college code 1ST (e.g. 1ST23CS001).');
      return;
    }
    if (!formData.collegeEmail.includes('@sambhram.org') && !formData.collegeEmail.includes('@')) {
      setErrorMsg('Please enter a valid College Email ID (e.g. name@sambhram.org).');
      return;
    }
    if (formData.phone.replace(/\D/g, '').length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      collegeEmail: formData.collegeEmail,
      classDepartment: formData.classDepartment,
      usn: formData.usn.toUpperCase(),
      phone: formData.phone,
      gender: formData.gender,
      password: formData.password,
      confirmPassword: formData.password
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
    setLoading(true);

    const res = await login(signInIdentifier, signInPassword);
    setLoading(false);

    if (res?.success) {
      navigate('/role');
    } else {
      setErrorMsg(res?.message || 'Invalid college credentials.');
    }
  };

  // 1-Click Fast Profile Filler
  const handleSelectQuickProfile = async (p) => {
    setFormData({
      name: p.name,
      email: p.email,
      collegeEmail: p.collegeEmail,
      classDepartment: p.classDepartment,
      usn: p.usn,
      phone: p.phone,
      gender: p.gender,
      password: 'password123',
      otp: '3060'
    });
    setSignInIdentifier(p.usn);

    // Instant demo login
    setLoading(true);
    await demoLogin(p.key);
    setLoading(false);
    navigate('/role');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <Header title="" showBack={true} onBack={() => navigate('/')} showHelp={true} />

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
                  Your SAIT Verification OTP is{' '}
                  <span className="font-black text-amber-300 text-sm">{generatedOtp}</span>. Valid for 5 minutes.
                </p>
              </div>
            </div>

            <button
              onClick={handleAutofillOtp}
              className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-extrabold rounded-lg shrink-0 ml-2 shadow-sm"
            >
              Auto-fill
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {/* Header Branding */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full mb-1">
            <Building2 className="w-3.5 h-3.5 text-red-600" />
            <span className="text-[11px] font-black text-red-600 uppercase tracking-wider">
              Sambhram Institute of Technology (SAIT)
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            CampusRide Credentials
          </h2>
          <p className="text-xs text-gray-500">
            Official student & faculty mobility portal
          </p>
        </div>

        {/* 1-Tap Quick Fill Demo Cards */}
        <div className="mb-4 p-3 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              1-Click Review Profiles
            </span>
            <span className="text-[9px] font-extrabold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
              Demo Fast Pass
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickProfiles.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuickProfile(p)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all active:scale-98 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 truncate">{p.name}</span>
                  <span
                    className={`text-[8px] font-black px-1.5 py-0.2 rounded-full ${
                      p.badge === 'Pink Ride'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-[10px] font-mono text-gray-500 block">{p.usn}</span>
                  <span className="text-[9px] text-gray-400 block truncate">{p.classDepartment}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs: Full Registration Credentials vs Quick Sign In */}
        <div className="flex bg-gray-200/70 p-1 rounded-2xl mb-4 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Student Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'signin'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Quick USN Login
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM 1: COMPREHENSIVE COLLEGE REGISTRATION CREDENTIALS */}
        {activeTab === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            {/* 1. User Name */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                User Name (Full Name)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Meghana S"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* 2. USN Number */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                USN Number (College Unique ID)
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  name="usn"
                  value={formData.usn}
                  onChange={handleInputChange}
                  placeholder="1ST23CS001"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono font-black uppercase tracking-wider text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Format: 1ST[YY][DEPT][XXX]</p>
            </div>

            {/* 3. Email ID of the College */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Email ID of the College
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
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* 4. Personal Email ID */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Personal Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="personal@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* 5. Class / Department & Sem */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Class / Department & Semester
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="classDepartment"
                  value={formData.classDepartment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="6th Sem, CSE">6th Sem, CSE</option>
                  <option value="6th Sem, AIML">6th Sem, AIML</option>
                  <option value="7th Sem, ISE">7th Sem, ISE</option>
                  <option value="7th Sem, ECE">7th Sem, ECE</option>
                  <option value="8th Sem, CSE">8th Sem, CSE</option>
                  <option value="4th Sem, AI&DS">4th Sem, AI&DS</option>
                  <option value="Faculty / Staff">Faculty / Staff</option>
                </select>

                <input
                  type="text"
                  name="classDepartment"
                  value={formData.classDepartment}
                  onChange={handleInputChange}
                  placeholder="Or type custom class"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* 6. Phone Number (Indian mobile +91) */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Phone Number
              </label>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-2.5 bg-gray-100 rounded-2xl font-black text-xs text-gray-800 border border-gray-200">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black text-gray-900 tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="px-3 py-2.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-2xl shrink-0"
                >
                  Get OTP
                </button>
              </div>
            </div>

            {/* OTP Code input if requested */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Mobile Verification OTP
              </label>
              <input
                type="text"
                maxLength={4}
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 3060 from top popup"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono font-black text-gray-900 tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {/* 7. Gender (Crucial for Pink Ride) */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Gender (Safety & Pink Ride Rule)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, gender: 'female' }))}
                  className={`p-2 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                    formData.gender === 'female'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-xs'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Female (Pink Ride)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, gender: 'male' }))}
                  className={`p-2 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                    formData.gender === 'male'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>Male</span>
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-[#EA5858] hover:bg-[#dc4848] active:scale-98 text-white font-extrabold text-base rounded-full shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Verifying with SAIT...' : 'Verify Credentials & Proceed'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          /* FORM 2: QUICK SIGN IN FOR EXISTING USN / COLLEGE EMAIL */
          <form onSubmit={handleSignInSubmit} className="space-y-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                College USN or College Email ID
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="1ST23CS001 or student@sambhram.org"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#EA5858] hover:bg-[#dc4848] active:scale-98 text-white font-extrabold text-base rounded-full shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CampusRide'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        <div className="text-center py-4 text-xs text-gray-400 font-medium">
          Sambhram Institute of Technology (SAIT) • Adityanagar, Vidyaranyapura
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
