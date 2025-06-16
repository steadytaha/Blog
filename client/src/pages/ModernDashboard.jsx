import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import ModernDashSidebar from '../components/ModernDashSidebar.jsx';
import ModernDashProfile from '../components/ModernDashProfile.jsx';
import ModernDashPosts from '../components/ModernDashPosts.jsx';
import ModernDashUsers from '../components/ModernDashUsers.jsx';
import ModernDashComments from '../components/ModernDashComments.jsx';
import ModernDashboardComp from '../components/ModernDashboardComp.jsx';
import { HiOutlineSparkles, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

export default function ModernDashboard() {
  const location = useLocation();
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const [tab, setTab] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    } else {
      setTab('dash'); // Default to dashboard overview
    }
  }, [location.search]);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getTabTitle = () => {
    switch(tab) {
      case 'profile': return 'Profile Settings';
      case 'posts': return 'Content Management';
      case 'users': return 'User Management';
      case 'comments': return 'Comment Moderation';
      case 'dash': return 'Dashboard Overview';
      default: return 'Dashboard';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-500 ${
        theme === 'dark' 
          ? 'bg-black/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
              </div>
            </button>
            
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <HiOutlineSparkles className={`text-2xl transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700'
                  }`} />
                </div>
                <div>
                  <h1 className={`text-xl font-black tracking-wider transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white group-hover:text-gray-300' : 'text-gray-900 group-hover:text-gray-700'
                  }`}>
                    LITTLE'S
                  </h1>
                  <p className={`text-xs font-mono -mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    CONTROL PANEL
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Page Title */}
          <div className="hidden md:block">
            <h2 className={`text-2xl font-bold tracking-wide ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {getTabTitle()}
            </h2>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <button
              onClick={handleThemeToggle}
              className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-300 ${
                isAnimating ? 'animate-spin' : ''
              } ${
                theme === 'dark' 
                  ? 'border-gray-700 hover:border-white text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800' 
                  : 'border-gray-300 hover:border-gray-900 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50'
              }`}
            >
              {theme === 'light' ? (
                <HiOutlineMoon className="text-lg" />
              ) : (
                <HiOutlineSun className="text-lg" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <ModernDashSidebar 
          currentTab={tab} 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64">
          <div className="p-6">
            {/* Mobile Page Title */}
            <div className="md:hidden mb-6">
              <h2 className={`text-2xl font-bold tracking-wide ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {getTabTitle()}
              </h2>
            </div>

            {/* Tab Content */}
            {tab === 'profile' && <ModernDashProfile />}
            {tab === 'posts' && <ModernDashPosts />}
            {tab === 'users' && <ModernDashUsers />}
            {tab === 'comments' && <ModernDashComments />}
            {tab === 'dash' && <ModernDashboardComp />}
          </div>
        </div>
      </div>
    </div>
  );
} 