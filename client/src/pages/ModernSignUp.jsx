import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineArrowRight
} from 'react-icons/hi2';

import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import app from '../firebase';
import ModernUserPanel from '../components/ModernUserPanel.jsx';

export default function ModernSignUp() {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    validChars: false
  });
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth(app);

  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      validChars: /^[a-zA-Z\d@$!%*?&]*$/.test(password)
    };
    setPasswordValidation(validation);
    return validation;
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const trimmedValue = value.trim();
    setFormData({...formData, [id]: trimmedValue});
    
    // Validate password in real-time
    if (id === 'password') {
      validatePassword(trimmedValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage('All fields are required');
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        return setErrorMessage(data.message);
      }
      setLoading(false);
      if (res.ok) {
        navigate('/signin');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      const idToken = await resultsFromGoogle.user.getIdToken();
      const res = await fetch('/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: idToken
        })
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate('/');
      } else {
        setErrorMessage(data.message || 'Could not sign in with Google');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Modern User Panel */}
      <ModernUserPanel />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 animate-pulse">
          <HiOutlineSparkles className={`text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-500">
          <HiOutlineUser className={`text-lg ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <div className="absolute bottom-32 left-16 animate-pulse delay-1000">
          <HiOutlineEnvelope className={`text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse delay-700">
          <HiOutlineLockClosed className={`text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
              theme === 'dark' 
                ? 'from-white via-gray-300 to-gray-500' 
                : 'from-gray-900 via-gray-700 to-gray-500'
            }`}>
              SIGN UP
            </h1>
            <p className={`text-lg md:text-xl font-light max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Join Little's Blog community and start sharing your thoughts with the world.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding */}
            <div className={`rounded-3xl border backdrop-blur-sm p-8 md:p-12 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
            }`}>
              <div className="flex items-center justify-center mb-8">
                <div className={`p-4 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-emerald-600/20 to-teal-600/20' 
                    : 'bg-gradient-to-br from-emerald-100 to-teal-100'
                }`}>
                  <HiOutlineUser className={`text-4xl ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                </div>
              </div>

              <Link to="/" className="block text-center mb-8">
                <h2 className={`text-3xl md:text-4xl font-black mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  LITTLE'S
                </h2>
                <h3 className={`text-xl md:text-2xl font-black tracking-wider ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  BLOG
                </h3>
              </Link>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-600'
                  }`}></div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Share your thoughts and ideas
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-600'
                  }`}></div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Connect with like-minded people
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-600'
                  }`}></div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Learn from the community
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className={`rounded-3xl border backdrop-blur-sm p-8 md:p-12 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
            }`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Username
                  </label>
                  <div className="relative">
                    <HiOutlineUser className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-lg ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      id="username"
                      placeholder="johndoe"
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineEnvelope className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-lg ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="email"
                      id="email"
                      placeholder="john@example.com"
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-lg ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-lg transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className={`mt-3 p-3 rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gray-800/30 border-gray-700/50 text-gray-400' 
                      : 'bg-gray-50/50 border-gray-200/50 text-gray-600'
                  }`}>
                    <p className="text-xs font-medium mb-2">Password must contain:</p>
                    <ul className="text-xs space-y-1">
                      <li className="flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${
                          passwordValidation.length ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className={passwordValidation.length ? 'text-green-500' : ''}>
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${
                          passwordValidation.uppercase ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className={passwordValidation.uppercase ? 'text-green-500' : ''}>
                          One uppercase letter (A-Z)
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${
                          passwordValidation.lowercase ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className={passwordValidation.lowercase ? 'text-green-500' : ''}>
                          One lowercase letter (a-z)
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${
                          passwordValidation.number ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className={passwordValidation.number ? 'text-green-500' : ''}>
                          One number (0-9)
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${
                          passwordValidation.validChars ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        <span className={passwordValidation.validChars ? 'text-green-500' : ''}>
                          Only letters, numbers, and @$!%*?& symbols
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className={`p-4 rounded-2xl border ${
                    theme === 'dark' 
                      ? 'bg-red-900/20 border-red-800 text-red-400' 
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                    <p className="text-sm font-medium">{errorMessage}</p>
                  </div>
                )}

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={!isPasswordValid() || loading}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 transform flex items-center justify-center gap-3 ${
                    (!isPasswordValid() || loading)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105 hover:shadow-xl'
                  } ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>CREATING ACCOUNT...</span>
                    </>
                  ) : !isPasswordValid() ? (
                    <>
                      <span>COMPLETE PASSWORD REQUIREMENTS</span>
                    </>
                  ) : (
                    <>
                      <span>CREATE ACCOUNT</span>
                      <HiOutlineArrowRight className="text-xl" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className={`absolute inset-0 flex items-center ${
                    theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-full border-t ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                    }`}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-4 font-medium ${
                      theme === 'dark' 
                        ? 'bg-gray-900 text-gray-400' 
                        : 'bg-white text-gray-500'
                    }`}>
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign Up Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className={`w-full py-4 px-6 rounded-2xl border-2 font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white hover:bg-white/5' 
                      : 'border-gray-400 text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-900/5'
                  }`}
                >
                  <AiFillGoogleCircle className="text-2xl text-red-500" />
                  <span>CONTINUE WITH GOOGLE</span>
                </button>

                {/* Sign In Link */}
                <div className="text-center pt-4">
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Already have an account?{' '}
                    <Link 
                      to="/signin" 
                      className={`font-semibold transition-colors ${
                        theme === 'dark' 
                          ? 'text-emerald-400 hover:text-emerald-300' 
                          : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-900/5'
              }`}
            >
              <span>← Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 