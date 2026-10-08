import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { User, Phone, Mail, Award, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    usn: '1ST23CS',
    gender: 'female',
    role: 'passenger',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!formData.usn.startsWith('1ST')) {
      setError('Sambhram Institute USN must start with "1ST" (e.g. 1ST23CS000).');
      return;
    }

    setLoading(true);
    const res = await register(formData);
    setLoading(false);

    if (res?.success) {
      if (formData.role === 'driver') {
        navigate('/rider-verify');
      } else {
        navigate('/home');
      }
    } else {
      setError(res?.message || 'Registration failed.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="Create Account" showBack={true} onBack={() => navigate('/login')} showHelp={true} />

      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="mb-6">
          <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase tracking-wider">
            SIT Student / Faculty Onboarding
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-2">
            Join CampusRide
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified campus transit for Sambhram Institute of Technology
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Meghana S"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          {/* College USN */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              College Unique ID / USN
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                name="usn"
                value={formData.usn}
                onChange={handleChange}
                placeholder="1ST23CS000"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold uppercase tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Format: 1ST[YY][DEPT][XXX] (e.g. 1ST23CS045)</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                maxLength={10}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="meghana@sambhram.org"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Gender (For Pink Ride Eligibility)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center p-2.5 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${
                  formData.gender === 'female'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="sr-only"
                />
                👩 Female (Pink Ride Eligible)
              </label>
              <label
                className={`flex items-center justify-center p-2.5 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${
                  formData.gender === 'male'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="sr-only"
                />
                👨 Male
              </label>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Primary Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center p-2.5 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${
                  formData.role === 'passenger'
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="passenger"
                  checked={formData.role === 'passenger'}
                  onChange={handleChange}
                  className="sr-only"
                />
                PASSENGER (Book Rides)
              </label>
              <label
                className={`flex items-center justify-center p-2.5 rounded-2xl border text-xs font-bold cursor-pointer transition-all ${
                  formData.role === 'driver'
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="driver"
                  checked={formData.role === 'driver'}
                  onChange={handleChange}
                  className="sr-only"
                />
                RIDER / DRIVER (Offer Rides)
              </label>
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Confirm
              </label>
              <input
                type="password"
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#EA5858] hover:bg-[#dc4848] text-white font-extrabold text-base rounded-full shadow-lg shadow-red-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Creating Account...' : 'Register'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="text-center py-5">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
