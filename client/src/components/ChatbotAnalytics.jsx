import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HiChartBarSquare, 
  HiGlobeAlt, 
  HiUsers, 
  HiChatBubbleLeftRight,
  HiClock,
  HiExclamationTriangle,
  HiCalendarDays,
  HiChevronDown
} from 'react-icons/hi2';

export default function ChatbotAnalytics() {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const timePeriods = [
    { key: 'week', label: 'This Week', icon: '📅' },
    { key: 'month', label: 'This Month', icon: '🗓️' },
    { key: 'year', label: 'This Year', icon: '📆' },
    { key: 'all', label: 'All Time', icon: '⏰' }
  ];

  const fetchAnalytics = async (period = selectedPeriod) => {
    // Double-check admin status
    if (!currentUser?.isAdmin) {
      setError('Admin access required - Redirecting...');
      setTimeout(() => navigate('/'), 2000); // Redirect to home after 2 seconds
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chatbot/analytics?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 403) {
        setError('Access denied - Admin privileges required');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  // Redirect non-admin users immediately
  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      navigate('/');
      return;
    }
    if (currentUser?.isAdmin) {
      fetchAnalytics();
    }
  }, [selectedPeriod, currentUser, navigate]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setShowDropdown(false);
  };

  const getSelectedPeriodInfo = () => {
    return timePeriods.find(p => p.key === selectedPeriod) || timePeriods[0];
  };

  // Show loading while checking user status
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
          theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
        }`}></div>
        <span className={`ml-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Checking permissions...
        </span>
      </div>
    );
  }

  // Admin-only access - redirect if not admin
  if (!currentUser.isAdmin) {
    return (
      <div className={`p-8 text-center rounded-lg border ${
        theme === 'dark' 
          ? 'bg-red-900/20 border-red-700' 
          : 'bg-red-50 border-red-200'
      }`}>
        <HiExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className={`text-xl font-semibold mb-2 ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`}>
          Access Denied
        </h3>
        <p className={`mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Chatbot Analytics requires administrator privileges.
        </p>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}>
          Redirecting to home page...
        </p>
      </div>
    );
  }

  const stats = analytics?.stats;
  const selectedInfo = getSelectedPeriodInfo();

  return (
    <div className={`p-6 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-900/50 border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <HiChartBarSquare className={`text-2xl ${
            theme === 'dark' ? 'text-[#9DC88D]' : 'text-[#4D774E]'
          }`} />
          <div>
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Chatbot Analytics
            </h2>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Monitor chatbot usage and performance
            </p>
          </div>
        </div>
        
        {/* Time Period Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-900/50 border-gray-800 text-white hover:bg-gray-900/70'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          >
            <span className="text-lg">{selectedInfo.icon}</span>
            <span className="font-medium">{selectedInfo.label}</span>
            <HiChevronDown className={`text-lg transition-transform duration-200 ${
              showDropdown ? 'rotate-180' : ''
            }`} />
          </button>

          {showDropdown && (
            <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg z-50 ${
              theme === 'dark'
                ? 'bg-gray-900/90 border-gray-800 backdrop-blur-sm'
                : 'bg-white border-gray-200'
            }`}>
              {timePeriods.map((period) => (
                <button
                  key={period.key}
                  onClick={() => handlePeriodChange(period.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                    selectedPeriod === period.key
                      ? theme === 'dark'
                        ? 'bg-gray-800/70 text-blue-400'
                        : 'bg-blue-50 text-blue-700'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800/50'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{period.icon}</span>
                  <span className="font-medium">{period.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          <span className={`ml-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading analytics...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-red-900/20 border-red-700 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <div className="flex items-center gap-2">
            <HiExclamationTriangle className="text-xl" />
            <span>Error: {error}</span>
          </div>
        </div>
      )}

      {/* Analytics Data */}
      {stats && !loading && !error && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-900/50 border-gray-800' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <HiChatBubbleLeftRight className="text-2xl text-blue-500" />
                <div>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stats.totalInteractions}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Total Chats
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-900/50 border-gray-800' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <HiUsers className="text-2xl text-green-500" />
                <div>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stats.uniqueUsers}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Unique Users
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-900/50 border-gray-800' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <HiClock className="text-2xl text-purple-500" />
                <div>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stats.sessionsStarted}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Sessions
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-900/50 border-gray-800' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <HiExclamationTriangle className="text-2xl text-red-500" />
                <div>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stats.rateLimitHits}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Rate Limits
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Language Breakdown */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-gray-900/50 border-gray-800' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <HiGlobeAlt className={`text-xl ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <h3 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Language Usage
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className={`text-2xl font-bold text-red-500`}>
                  {stats.languageBreakdown.tr || 0}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  🇹🇷 Turkish
                </p>
              </div>
              
              <div className="text-center">
                <p className={`text-2xl font-bold text-blue-500`}>
                  {stats.languageBreakdown.en || 0}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  🇺🇸 English
                </p>
              </div>
              
              <div className="text-center">
                <p className={`text-2xl font-bold text-gray-500`}>
                  {stats.languageBreakdown.other || 0}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  🌍 Other
                </p>
              </div>
            </div>
          </div>

          {/* Token Usage */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-gray-900/50 border-gray-800' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              💰 OpenAI Token Usage
            </h3>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Total Tokens: <span className="font-bold text-green-500">{stats.totalTokensUsed}</span>
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Estimated cost: ~${(stats.totalTokensUsed * 0.00015 / 1000).toFixed(4)} USD
            </p>
          </div>

          {/* Period Info */}
          <div className={`text-center text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Analytics for: {selectedInfo.label}
            {analytics.dateRange && (
              <span className="block mt-1">
                ({analytics.dateRange.start} to {analytics.dateRange.end})
              </span>
            )}
          </div>
        </div>
      )}

      {/* No Data State */}
      {analytics && !stats && !loading && !error && (
        <div className="text-center py-8">
          <HiChartBarSquare className={`w-16 h-16 mx-auto mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No analytics data available for {selectedInfo.label.toLowerCase()}
          </p>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
} 