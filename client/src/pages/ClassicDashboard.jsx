import React, { useState } from 'react'
import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom'
import DashSidebar from '../components/DashSidebar.jsx';
import DashProfile from '../components/DashProfile.jsx';
import DashPosts from '../components/DashPosts.jsx';
import DashUsers from '../components/DashUsers.jsx';
import DashComments from '../components/DashComments.jsx';
import DashboardComp from '../components/DashboardComp.jsx';
import { BsToggle2On } from 'react-icons/bs';

export default function ClassicDashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  // Preserve current tab when switching to modern version
  const getModernDashboardUrl = () => {
    const currentTab = tab || 'dash';
    return `/modern-dashboard?tab=${currentTab}`;
  };

  return (
    <div className='min-h-screen flex flex-col md:flex-row relative'>
      {/* Switch to Modern Dashboard Toggle */}
      <div className="fixed top-20 right-8 z-50">
        <Link 
          to={getModernDashboardUrl()}
          className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg transition-all duration-300 group"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
            Switch to Modern
          </span>
          <BsToggle2On className="text-blue-600 dark:text-blue-400 text-xl" />
        </Link>
      </div>

      <div className='md:w-56'>
        {/* Sidebar */}
        <DashSidebar />
      </div>
      {/* Main */}
      {tab === 'profile' && <DashProfile />}
      {/* Posts */}
      {tab === 'posts' && <DashPosts />}
      {/* Users */}
      {tab === 'users' && <DashUsers />}
      {/* Comments */}
      {tab === 'comments' && <DashComments />}
      {/* Dashboard */}
      {tab === 'dash' && <DashboardComp />}
    </div>
  )
} 