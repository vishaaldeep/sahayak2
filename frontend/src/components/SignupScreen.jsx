import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

const SignupScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Phone className="w-10 h-10 text-blue-600" />
          </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Sahaayak</h2>
        <p className="text-gray-600 mb-8">
          Your AI-Powered Work Assistant is ready to help you find opportunities or hire workers.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/login"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Continue with Mobile Number
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline font-medium">
              Login here
            </Link>
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;