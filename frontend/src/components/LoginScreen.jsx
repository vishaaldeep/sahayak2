import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, User, MapPin, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [step, setStep] = useState('phone'); // phone, otp, role, onboarding
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [roleType, setRoleType] = useState('');
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    location: '',
    gender: '',
    language: 'en',
    aadhaar: '',
    selfie: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement OTP sending API call
      // const response = await sendOTP(phoneNumber);
      console.log('OTP sent to:', phoneNumber);
      setStep('otp');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement OTP verification API call
      // const response = await verifyOTP(phoneNumber, otp);
      console.log('OTP verified for:', phoneNumber);
      setStep('role');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (role) => {
    setRoleType(role);
    // Check if user exists, if not go to onboarding
    // For now, assume new user goes to onboarding
    setStep('onboarding');
  };

  const handleOnboardingSubmit = async () => {
    if (!onboardingData.name || !onboardingData.location) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement user creation API call
      // const response = await createUser({ phoneNumber, roleType, ...onboardingData, referralCode });
      console.log('User created:', { phoneNumber, roleType, ...onboardingData, referralCode });
      
      // Simulate login success
      const mockUserData = {
        user: {
          phoneNumber,
          roleType,
          ...onboardingData
        }
      };
      onLogin(mockUserData);
      navigate(roleType === 'job provider' ? '/welcome/post-job' : '/welcome');
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMissedCall = async () => {
    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement missed call authentication
      console.log('Missed call authentication for:', phoneNumber);
      setStep('role');
    } catch (error) {
      setError('Missed call authentication failed. Please try OTP.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOnboardingData(prev => ({
            ...prev,
            location: `${latitude}, ${longitude}`
          }));
        },
        (error) => {
          setError('Unable to get location. Please enter manually.');
        }
      );
    }
  };

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Sahaayak</h2>
        <p className="text-gray-600">Your AI-Powered Work Assistant</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+91</span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter your mobile number"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              maxLength={10}
            />
          </div>
        </div>
        
        {referralCode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code (Optional)</label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <button
          onClick={handleSendOTP}
          disabled={loading || phoneNumber.length !== 10}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? 'Sending...' : (
            <>
              <MessageCircle className="w-5 h-5" />
              Send OTP
            </>
          )}
        </button>
        
        <button
          onClick={handleMissedCall}
          disabled={loading || phoneNumber.length !== 10}
          className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? 'Processing...' : 'Login with Missed Call'}
        </button>
        
        <div className="text-center">
          <button
            onClick={() => navigate('/welcome')}
            className="text-blue-500 hover:underline text-sm"
          >
            Continue as Guest
          </button>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => setReferralCode('')}
            className="text-gray-500 hover:underline text-sm"
          >
            {referralCode ? 'Remove Referral Code' : 'Have a Referral Code?'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderOTPStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h2>
        <p className="text-gray-600">Enter the 6-digit code sent to +91 {phoneNumber}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <button
          onClick={handleVerifyOTP}
          disabled={loading || otp.length !== 6}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        
        <div className="text-center space-y-2">
          <button
            onClick={() => setStep('phone')}
            className="text-blue-500 hover:underline text-sm"
          >
            Change Mobile Number
          </button>
          <div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="text-gray-500 hover:underline text-sm"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoleStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Role</h2>
        <p className="text-gray-600">How would you like to use Sahaayak?</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => handleRoleSelection('job seeker')}
          className="w-full p-4 border-2 border-gray-200 hover:border-blue-500 rounded-lg transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Job Seeker</h3>
              <p className="text-sm text-gray-600">Find and apply for jobs</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => handleRoleSelection('job provider')}
          className="w-full p-4 border-2 border-gray-200 hover:border-blue-500 rounded-lg transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Job Provider</h3>
              <p className="text-sm text-gray-600">Post jobs and hire workers</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderOnboardingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">Help us personalize your experience</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            value={onboardingData.name}
            onChange={(e) => setOnboardingData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={onboardingData.location}
              onChange={(e) => setOnboardingData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter your location"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={getCurrentLocation}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <MapPin className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={onboardingData.gender}
            onChange={(e) => setOnboardingData(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
          <select
            value={onboardingData.language}
            onChange={(e) => setOnboardingData(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="bn">Bengali</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number (Optional)</label>
          <input
            type="text"
            value={onboardingData.aadhaar}
            onChange={(e) => setOnboardingData(prev => ({ ...prev, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
            placeholder="Enter 12-digit Aadhaar"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={12}
          />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <button
          onClick={handleOnboardingSubmit}
          disabled={loading || !onboardingData.name || !onboardingData.location}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? 'Creating Account...' : (
            <>
              Complete Setup
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {step === 'phone' && renderPhoneStep()}
        {step === 'otp' && renderOTPStep()}
        {step === 'role' && renderRoleStep()}
        {step === 'onboarding' && renderOnboardingStep()}
      </div>
    </div>
  );
};

export default LoginScreen;
