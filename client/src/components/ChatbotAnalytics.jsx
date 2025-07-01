import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadialBarChart, RadialBar
} from 'recharts';
import { format, subDays, parseISO, isValid } from 'date-fns';
import { 
  HiChartBarSquare, 
  HiGlobeAlt, 
  HiUsers, 
  HiChatBubbleLeftRight,
  HiClock,
  HiExclamationTriangle,
  HiCalendarDays,
  HiChevronDown,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiArrowPath,
  HiMiniCurrencyDollar,
  HiHeart
} from 'react-icons/hi2';

// Chart colors for modern dashboard theming
const CHART_COLORS = {
  primary: '#3B82F6',    // Blue
  secondary: '#8B5CF6',  // Purple
  accent: '#06B6D4',     // Cyan
  warning: '#F59E0B',    // Amber
  danger: '#EF4444',     // Red
  info: '#0EA5E9',       // Sky blue
  purple: '#A855F7',     // Violet
  pink: '#EC4899',       // Pink
  orange: '#F97316',     // Orange
  indigo: '#6366F1',     // Indigo
  // Theme-specific accent colors
  accentLight: '#4D774E', // Dark green for light theme
  accentDark: '#9DC88D'   // Light green for dark theme
};

const COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent, CHART_COLORS.warning, CHART_COLORS.danger];

// Portal Dropdown Component
const DropdownPortal = ({ children, isOpen, targetRef, theme, onClose }) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && targetRef.current) {
      const updatePosition = () => {
        const rect = targetRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8, // 8px gap
          right: window.innerWidth - rect.right,
        });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, targetRef]);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        // Check if click is outside both the button and dropdown
        const dropdown = document.getElementById('period-dropdown');
        if (dropdown && !dropdown.contains(event.target) && 
            targetRef.current && !targetRef.current.contains(event.target)) {
          onClose();
        }
      };

      // Use mousedown to capture the event before click
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, targetRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      id="period-dropdown"
      className={`fixed z-50 w-56 rounded-xl border shadow-2xl ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      }`}
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

// Modern Dashboard Card Component
const DashboardCard = ({ title, value, change, icon: Icon, color, theme, trend, subtitle, children, className = "", size = "md" }) => {
  const getThemeColor = () => {
    return theme === 'dark' ? CHART_COLORS.accentDark : CHART_COLORS.accentLight;
  };

  const getColorClasses = (colorName) => {
    switch(colorName) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'orange': return 'from-orange-500 to-orange-600';
      case 'red': return 'from-red-500 to-red-600';
      case 'accent': return theme === 'dark' ? 'from-green-400 to-green-500' : 'from-green-600 to-green-700';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const cardSize = size === 'lg' ? 'col-span-2' : size === 'xl' ? 'col-span-3' : '';

  return (
    <div className={`${cardSize} ${className} rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
      theme === 'dark' 
        ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' 
        : 'bg-white border-gray-100 hover:border-gray-200'
    }`}>
      {children ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h3>
            {Icon && (
              <div className={`p-2 rounded-lg bg-gradient-to-br ${getColorClasses(color)}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          {children}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-xl ${
              color === 'accent' 
                ? `bg-gradient-to-br ${getColorClasses('accent')}` 
                : `bg-gradient-to-br ${getColorClasses(color)}`
            }`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {change && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend === 'up' 
                  ? theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                  : trend === 'down' 
                    ? theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
                    : theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}>
                {trend === 'up' ? <HiArrowTrendingUp className="w-3 h-3" /> : 
                  trend === 'down' ? <HiArrowTrendingDown className="w-3 h-3" /> : null}
                {change}
              </div>
            )}
          </div>
          <div>
            <p className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {value}
            </p>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {title}
            </p>
            {subtitle && (
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Chart Container Component
const ChartContainer = ({ title, children, theme, actions }) => (
  <div className={`p-6 rounded-xl border backdrop-blur-sm ${
    theme === 'dark' 
      ? 'bg-gray-900/50 border-gray-800' 
      : 'bg-white/80 border-gray-200'
  }`}>
    <div className="flex items-center justify-between mb-6">
      <h3 className={`text-lg font-semibold ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
    {children}
  </div>
);

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg border shadow-lg ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChatbotAnalytics() {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownButtonRef = useRef(null);

  const timePeriods = [
    { key: 'week', label: 'This Week', icon: '📅' },
    { key: 'month', label: 'This Month', icon: '🗓️' },
    { key: 'year', label: 'This Year', icon: '📆' },
    { key: 'all', label: 'All Time', icon: '⏰' }
  ];

  const fetchAnalytics = async (period = selectedPeriod) => {
    if (!currentUser?.isAdmin) {
      setError('Admin access required - Redirecting...');
      setTimeout(() => navigate('/'), 2000);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      navigate('/');
      return;
    }
    if (currentUser?.isAdmin) {
      fetchAnalytics(selectedPeriod);
    }
  }, [selectedPeriod, currentUser, navigate]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setShowDropdown(false);
  };

  const getSelectedPeriodInfo = () => {
    return timePeriods.find(p => p.key === selectedPeriod) || timePeriods[0];
  };

  // Process data for charts
  const processChartData = () => {
    if (!analytics?.stats) return {};

    const stats = analytics.stats;
    
    // User type data for pie chart
    const userTypeData = [
      { name: 'Authenticated', value: stats.uniqueAuthenticatedUsers || 0, color: CHART_COLORS.primary }, // Blue
      { name: 'Guest', value: stats.uniqueGuestUsers || 0, color: '#6B7280' } // Grey
    ];

    // Daily traffic data for area chart
    const dailyTrafficData = Object.entries(stats.dailyBreakdown || {}).map(([date, dailyStats]) => {
      const parsedDate = parseISO(date);
      return {
        date: isValid(parsedDate) ? format(parsedDate, 'MMM d') : 'Unknown',
        value: dailyStats.interactions || 0 // Correctly access the interactions count
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      userTypeData,
      dailyTrafficData
    };
  };

  // Show loading while checking user status
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
        }`}></div>
        <span className={`ml-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Checking permissions...
        </span>
      </div>
    );
  }

  // Admin-only access
  if (!currentUser.isAdmin) {
    return (
      <div className={`p-8 text-center rounded-xl border ${
        theme === 'dark' 
          ? 'bg-red-900/20 border-red-700' 
          : 'bg-red-50 border-red-200'
      }`}>
        <HiExclamationTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h3 className={`text-2xl font-bold mb-4 ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`}>
          Access Denied
        </h3>
        <p className={`mb-4 text-lg ${
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
  const chartData = processChartData();

  return (
    <div className={`min-h-screen p-6 ${
      theme === 'dark' ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-green-400 to-green-500' 
              : 'bg-gradient-to-br from-green-600 to-green-700'
          }`}>
            <HiChartBarSquare className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Analytics
            </h1>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              AI Assistant Performance
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <HiArrowPath className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {/* Time Period Selector */}
          <div className="relative" ref={dropdownButtonRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-3 px-6 py-2 rounded-xl text-sm transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm'
              }`}
              style={{
                backgroundColor: theme === 'dark' ? CHART_COLORS.accentDark + '20' : CHART_COLORS.accentLight + '10',
                borderColor: theme === 'dark' ? CHART_COLORS.accentDark + '40' : CHART_COLORS.accentLight + '30'
              }}
            >
              <span className="text-lg">{selectedInfo.icon}</span>
              <span className="font-medium">{selectedInfo.label}</span>
              <HiChevronDown className={`text-lg transition-transform duration-200 ${
                showDropdown ? 'rotate-180' : ''
              }`} />
            </button>

            <DropdownPortal 
              isOpen={showDropdown} 
              targetRef={dropdownButtonRef}
              theme={theme}
              onClose={() => setShowDropdown(false)}
            >
              {timePeriods.map((period) => (
                <button
                  key={period.key}
                  onClick={() => handlePeriodChange(period.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                    selectedPeriod === period.key
                      ? theme === 'dark'
                        ? 'bg-gray-700 text-green-400'
                        : 'bg-green-50 text-green-700'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{period.icon}</span>
                  <span className="font-medium">{period.label}</span>
                </button>
              ))}
            </DropdownPortal>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
          }`}></div>
          <span className={`ml-4 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading analytics...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`p-6 rounded-xl border ${
          theme === 'dark' 
            ? 'bg-red-900/20 border-red-700 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <div className="flex items-center gap-3">
            <HiExclamationTriangle className="text-2xl" />
            <span className="text-lg font-medium">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Analytics Dashboard */}
      {stats && !loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Main Analytics Card - Large */}
            <DashboardCard
              title="Chatbot Traffic"
              value={stats.totalInteractions?.toLocaleString() || '0'}
              change="+12%"
              trend="up"
              icon={HiChatBubbleLeftRight}
              color="accent"
              theme={theme}
              size="lg"
              className="md:col-span-2"
            >
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData.dailyTrafficData}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme === 'dark' ? CHART_COLORS.accentDark : CHART_COLORS.accentLight} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme === 'dark' ? CHART_COLORS.accentDark : CHART_COLORS.accentLight} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      content={<CustomTooltip theme={theme} />} 
                      cursor={{ stroke: CHART_COLORS.accent, strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <XAxis dataKey="date" stroke={theme === 'dark' ? '#555' : '#aaa'} fontSize={12} tickLine={false} axisLine={false} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={theme === 'dark' ? CHART_COLORS.accentDark : CHART_COLORS.accentLight}
                      fillOpacity={1}
                      fill="url(#colorTraffic)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>

            {/* Active Users Pie Chart */}
            <DashboardCard
              title="Active Users"
              icon={HiUsers}
              color="blue"
              theme={theme}
              size="lg"
              className="md:col-span-2"
            >
              <div className="flex items-center justify-around mt-4">
                <div className="text-center">
                  <p className={`text-4xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stats.uniqueUsers?.toLocaleString() || '0'}
                  </p>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Total Unique Users
                  </p>
                </div>
                <div className="w-64 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.userTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="value"
                        paddingAngle={5}
                      >
                        {chartData.userTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke={theme === 'dark' ? '#000' : '#f9fafb'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip theme={theme} />} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Additional Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Language Usage */}
            <DashboardCard
              title="🌍 Language Usage"
              icon={HiGlobeAlt}
              color="purple"
              theme={theme}
            >
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>🇹🇷 Turkish</span>
                  <span className="font-bold" style={{ color: CHART_COLORS.danger }}>
                    {stats.languageBreakdown?.tr || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>🇺🇸 English</span>
                  <span className="font-bold" style={{ color: CHART_COLORS.primary }}>
                    {stats.languageBreakdown?.en || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>🌍 Other</span>
                  <span className="font-bold" style={{ color: CHART_COLORS.purple }}>
                    {stats.languageBreakdown?.other || 0}
                  </span>
                </div>
              </div>
            </DashboardCard>

            {/* Token Usage */}
            <DashboardCard
              title="💰 AI Tokens"
              icon={HiMiniCurrencyDollar}
              color="accent"
              theme={theme}
            >
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Tokens</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalTokensUsed?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Estimated Cost</span>
                  <span className="font-bold" style={{ color: theme === 'dark' ? CHART_COLORS.accentDark : CHART_COLORS.accentLight }}>
                    ${(stats.totalTokensUsed * 0.00015 / 1000).toFixed(4)}
                  </span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 ${theme === 'dark' ? 'bg-gray-700' : ''}`}>
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${Math.min((stats.totalTokensUsed / 10000) * 100, 100)}%`,
                      background: `linear-gradient(to right, ${CHART_COLORS.warning}, ${CHART_COLORS.danger})`
                    }}
                  ></div>
                </div>
              </div>
            </DashboardCard>

            {/* System Health */}
            <DashboardCard
              title="❤️ System Health"
              icon={HiHeart}
              color="red"
              theme={theme}
            >
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Uptime</span>
                  <span className="font-bold" style={{ color: theme === 'dark' ? CHART_COLORS.accentDark : CHART_COLORS.accentLight }}>99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Response Time</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.averageResponseTime ? `${stats.averageResponseTime.toFixed(1)}ms` : '1.2s'}
                  </span>
                </div>
                <div className={`text-xs p-2 rounded text-center ${
                  theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'
                }`}>
                  🟢 All systems operational
                </div>
              </div>
            </DashboardCard>
          </div>
        </>
      )}

      {/* No Data State */}
      {analytics && !stats && !loading && !error && (
        <div className="text-center py-16">
          <HiChartBarSquare className={`w-24 h-24 mx-auto mb-6 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No Analytics Data Available
          </h3>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No analytics data available for {selectedInfo.label.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}