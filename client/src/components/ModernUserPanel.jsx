import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signOutSuccess } from '../redux/user/userSlice';
import { 
  HiOutlineUser, 
  HiOutlineCog6Tooth, 
  HiOutlineArrowRightOnRectangle,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSparkles
} from 'react-icons/hi2';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { debug } from '../utils/debug';

export default function ModernUserPanel() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signOutSuccess());
        setIsOpen(false);
      } else {
        debug.error(data.message);
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const handlePanelToggle = () => {
    setIsOpen(!isOpen);
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.modern-user-panel')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!currentUser) {
    return (
      <div className="fixed top-8 right-8 z-50">
        <div className="flex items-center gap-4">
          {/* Theme Toggle for Non-authenticated Users */}
          <button
            onClick={handleThemeToggle}
            className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-300 ${
              isAnimating ? 'animate-spin' : ''
            } ${
              theme === 'dark' 
                ? 'border-gray-700 hover:border-white text-gray-400 hover:text-white' 
                : 'border-gray-300 hover:border-gray-900 text-gray-600 hover:text-gray-900'
            }`}
          >
            {theme === 'light' ? (
              <HiOutlineMoon className="text-lg" />
            ) : (
              <HiOutlineSun className="text-lg" />
            )}
          </button>
          
          {/* Sign In Button */}
          <Link
            to="/modern-signin"
            className={`flex items-center gap-3 px-6 py-3 border rounded-full transition-all duration-300 group ${
              theme === 'dark' 
                ? 'bg-gray-900 hover:bg-gray-800 border-gray-700' 
                : 'bg-white hover:bg-gray-50 border-gray-300 shadow-lg'
            }`}
          >
            <span className={`text-sm font-light transition-colors ${
              theme === 'dark' 
                ? 'text-gray-300 group-hover:text-white' 
                : 'text-gray-600 group-hover:text-gray-900'
            }`}>
              Sign In
            </span>
            <HiOutlineUser className={`text-lg transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 group-hover:text-white' 
                : 'text-gray-500 group-hover:text-gray-900'
            }`} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-8 right-8 z-50 modern-user-panel">
      <div className="relative">
        {/* User Avatar Button */}
        <button
          onClick={handlePanelToggle}
          className={`w-14 h-14 rounded-full border-2 transition-all duration-300 group flex items-center justify-center ${
            theme === 'dark' 
              ? 'border-gray-700 hover:border-white bg-gray-900 hover:bg-gray-800' 
              : 'border-gray-300 hover:border-gray-900 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <HiOutlineUser className={`text-2xl transition-colors duration-300 ${
            theme === 'dark' 
              ? 'text-gray-400 group-hover:text-white' 
              : 'text-gray-600 group-hover:text-gray-900'
          }`} />
        </button>

        {/* Expanded Panel */}
        <div
          className={`absolute top-16 right-0 w-80 backdrop-blur-md border rounded-2xl p-6 transform transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-black bg-opacity-90 border-gray-800' 
              : 'bg-white bg-opacity-95 border-gray-200 shadow-xl'
          } ${
            isOpen 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          {/* User Info Header */}
          <div className={`flex items-center gap-4 mb-6 pb-4 border-b ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
            }`}>
              <img
                src={currentUser.photo || '/default-avatar.png'}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {currentUser.username}
              </h3>
              <p className={`text-sm font-mono ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                @{currentUser.username}
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="mb-4">
            <button
              onClick={handleThemeToggle}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 group ${
                isAnimating ? 'animate-pulse' : ''
              } ${
                theme === 'dark' 
                  ? 'bg-gray-900 hover:bg-gray-800' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <HiOutlineMoon className={`text-xl transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 group-hover:text-white' 
                      : 'text-gray-600 group-hover:text-gray-900'
                  }`} />
                ) : (
                  <HiOutlineSun className={`text-xl transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-400 group-hover:text-white' 
                      : 'text-gray-600 group-hover:text-gray-900'
                  }`} />
                )}
                <span className={`font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 group-hover:text-white' 
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all duration-300 shadow-sm ${
                    theme === 'dark' 
                      ? 'translate-x-5 bg-white' 
                      : 'translate-x-0.5 bg-white'
                  }`}></div>
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 mb-4">
            <Link
              to="/modern-dashboard?tab=profile"
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${
                theme === 'dark' 
                  ? 'hover:bg-gray-900' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <HiOutlineCog6Tooth className={`text-xl transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 group-hover:text-white' 
                  : 'text-gray-600 group-hover:text-gray-900'
              }`} />
              <span className={`transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-300 group-hover:text-white' 
                  : 'text-gray-700 group-hover:text-gray-900'
              }`}>Settings</span>
            </Link>

            {(currentUser.isAdmin || currentUser.role === "writer") && (
              <Link
                to="/modern-create-post"
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-900' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <HiOutlinePencilAlt className={`text-xl transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-400 group-hover:text-white' 
                    : 'text-gray-600 group-hover:text-gray-900'
                }`} />
                <span className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 group-hover:text-white' 
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>Create Post</span>
              </Link>
            )}

            {currentUser.isAdmin && (
              <Link
                to="/modern-dashboard"
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-900' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <HiOutlineSparkles className={`text-xl transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-400 group-hover:text-white' 
                    : 'text-gray-600 group-hover:text-gray-900'
                }`} />
                <span className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 group-hover:text-white' 
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignout}
            className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg border transition-all duration-300 group ${
              theme === 'dark' 
                ? 'bg-red-900 bg-opacity-50 hover:bg-red-800 hover:bg-opacity-70 border-red-800' 
                : 'bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300'
            }`}
          >
            <HiOutlineArrowRightOnRectangle className={`text-xl transition-colors ${
              theme === 'dark' 
                ? 'text-red-400 group-hover:text-red-300' 
                : 'text-red-600 group-hover:text-red-700'
            }`} />
            <span className={`font-medium transition-colors ${
              theme === 'dark' 
                ? 'text-red-300 group-hover:text-red-200' 
                : 'text-red-700 group-hover:text-red-800'
            }`}>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
} 