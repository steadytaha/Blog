import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess, signInFailure, signInStart } from '../redux/user/userSlice.js';
import { 
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import { BsToggle2Off } from 'react-icons/bs';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import app from '../firebase';
import ModernUserPanel from '../components/ModernUserPanel.jsx';

export default function ModernSignIn() {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error: errorMessage } = useSelector(state => state.user);
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value.trim()});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill in all fields'));
    }
    try {
      dispatch(signInStart());
      const res = await fetch('/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate('/');
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      const res = await fetch('/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          photo: resultsFromGoogle.user.photoURL 
        })
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate('/');
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
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
      
      {/* Switch to Classic Version Toggle */}
      {currentUser && currentUser.isAdmin && (
        <div className="absolute top-8 left-8 z-20">
          <Link 
            to="/signin" 
            className={`flex items-center gap-3 px-6 py-3 border rounded-full transition-all duration-300 group ${
              theme === 'dark' 
                ? 'bg-gray-900 hover:bg-gray-800 border-gray-700' 
                : 'bg-white hover:bg-gray-50 border-gray-300 shadow-lg'
            }`}
          >
            <span className={`text-sm font-light group-hover:opacity-100 transition-opacity duration-300 ${
              theme === 'dark' 
                ? 'text-gray-300 group-hover:text-white' 
                : 'text-gray-600 group-hover:text-gray-900'
            }`}>
              Switch to Classic
            </span>
            <BsToggle2Off className={`text-xl transition-colors duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 group-hover:text-white' 
                : 'text-gray-500 group-hover:text-gray-900'
            }`} />
          </Link>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 animate-pulse">
          <HiOutlineSparkles className={`text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-500">
          <HiOutlineLockClosed className={`text-lg ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <div className="absolute bottom-32 left-16 animate-pulse delay-1000">
          <HiOutlineEnvelope className={`text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse delay-700">
          <HiOutlineSparkles className={`text-sm ${
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
              SIGN IN
            </h1>
            <p className={`text-lg md:text-xl font-light max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Welcome back to Little's Blog. Sign in to access your account and continue your journey.
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
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20' 
                    : 'bg-gradient-to-br from-blue-100 to-purple-100'
                }`}>
                  <HiOutlineSparkles className={`text-4xl ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
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

              <p className={`text-center leading-relaxed ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Join our community of developers, writers, and tech enthusiasts. 
                Share your thoughts, learn from others, and be part of something amazing.
              </p>
            </div>

            {/* Right Side - Form */}
            <div className={`rounded-3xl border backdrop-blur-sm p-8 md:p-12 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
            }`}>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="user@example.com"
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
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
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
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

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                    loading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-xl'
                  } ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>SIGNING IN...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN</span>
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

                {/* Google Sign In Button */}
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

                {/* Sign Up Link */}
                <div className="text-center pt-4">
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Don't have an account?{' '}
                    <Link 
                      to="/modern-signup" 
                      className={`font-semibold transition-colors ${
                        theme === 'dark' 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      Sign up here
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