import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineArrowTrendingUp,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlineChatBubbleLeftRight,
  HiOutlineTrophy,
  HiOutlineStar
} from 'react-icons/hi2';
import { debug } from '../utils/debug';

export default function ModernDashboardComp() {
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const [monthlyData, setMonthlyData] = useState({
    users: [],
    posts: [],
    comments: []
  });
  const [userLeaderboard, setUserLeaderboard] = useState([]);

  useEffect(() => {
    if (currentUser.isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchComments();
    }
  }, [currentUser]);

  useEffect(() => {
    if (totalUsers > 0 && totalPosts > 0 && totalComments > 0) {
      generateMonthlyData();
    }
  }, [totalUsers, totalPosts, totalComments]);

  useEffect(() => {
    if (users.length > 0) {
      calculateUserLeaderboard();
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/user/users?limit=5');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotalUsers(data.totalUsers);
        setLastMonthUsers(data.lastMonthUsers);
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/post/posts?limit=5');
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
        setTotalPosts(data.totalPosts);
        setLastMonthPosts(data.lastMonthPosts);
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comment/getcomments?limit=5');
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments);
        setTotalComments(data.totalComments);
        setLastMonthComments(data.lastMonthComments);
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const generateMonthlyData = () => {
    const generateMonthlyData = (base, variance) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((month, index) => ({
        month,
        value: Math.floor(base + Math.random() * variance + (index * 2))
      }));
    };

    setMonthlyData({
      users: generateMonthlyData(totalUsers * 0.8, 15),
      posts: generateMonthlyData(totalPosts * 0.7, 25),
      comments: generateMonthlyData(totalComments * 0.6, 35)
    });
  };

  const calculateUserLeaderboard = async () => {
    try {
      // Fetch all posts and comments to calculate likes
      const [postsRes, commentsRes] = await Promise.all([
        fetch('/api/post/posts'),
        fetch('/api/comment/getcomments')
      ]);
      
      const postsData = await postsRes.json();
      const commentsData = await commentsRes.json();
      
      if (postsRes.ok && commentsRes.ok) {
        const allPosts = postsData.posts || [];
        const allComments = commentsData.comments || [];
        
        // Calculate likes per user
        const userLikes = {};
        
        // Group comments by post and calculate likes for each user's posts
        allPosts.forEach(post => {
          if (!userLikes[post.userId]) {
            userLikes[post.userId] = {
              userId: post.userId,
              username: users.find(u => u._id === post.userId)?.username || 'Unknown User',
              photo: users.find(u => u._id === post.userId)?.photo || '/default-avatar.png',
              totalLikes: 0,
              postCount: 0
            };
          }
          
          userLikes[post.userId].postCount++;
          
          // Count likes from comments on this user's posts
          const postComments = allComments.filter(comment => comment.postId === post._id);
          const postLikes = postComments.reduce((sum, comment) => sum + (comment.numberOfLikes || 0), 0);
          userLikes[post.userId].totalLikes += postLikes;
        });
        
        // Convert to array and sort by total likes
        const leaderboard = Object.values(userLikes)
          .filter(user => user.totalLikes > 0)
          .sort((a, b) => b.totalLikes - a.totalLikes)
          .slice(0, 5);
        
        setUserLeaderboard(leaderboard);
      }
    } catch (error) {
      debug.error('Error calculating leaderboard:', error);
      // Keep empty leaderboard on error
      setUserLeaderboard([]);
    }
  };

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: HiOutlineUsers,
      color: 'blue',
      growth: lastMonthUsers
    },
    {
      title: 'Total Posts',
      value: totalPosts,
      icon: HiOutlineDocumentText,
      color: 'emerald',
      growth: lastMonthPosts
    },
    {
      title: 'Total Comments',
      value: totalComments,
      icon: HiOutlineChatBubbleLeftRight,
      color: 'purple',
      growth: lastMonthComments
    }
  ];

  // Simple Line Chart Component
  const MiniChart = ({ data, color, type = 'line' }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    return (
      <div className="h-16 w-full">
        <svg viewBox="0 0 120 40" className="w-full h-full">
          {type === 'area' ? (
            <>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 ${40 - ((data[0].value - minValue) / range) * 30} ${data.map((d, i) => 
                  `L ${(i / (data.length - 1)) * 120} ${40 - ((d.value - minValue) / range) * 30}`
                ).join(' ')} L 120 40 L 0 40 Z`}
                fill={`url(#gradient-${color})`}
              />
              <polyline
                points={data.map((d, i) => 
                  `${(i / (data.length - 1)) * 120},${40 - ((d.value - minValue) / range) * 30}`
                ).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="2"
              />
            </>
          ) : (
            <polyline
              points={data.map((d, i) => 
                `${(i / (data.length - 1)) * 120},${40 - ((d.value - minValue) / range) * 30}`
              ).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
                theme === 'dark' 
                  ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <Link
                  to={
                    stat.title === 'Total Users' ? '/dashboard?tab=users' :
                    stat.title === 'Total Posts' ? '/dashboard?tab=posts' :
                    '/dashboard?tab=comments'
                  }
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group ${
                    stat.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                    stat.color === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600' :
                    'bg-purple-500 hover:bg-purple-600'
                  }`}
                  title={`View all ${stat.title.toLowerCase()}`}
                >
                  <Icon className="text-white text-xl group-hover:scale-110 transition-transform duration-300" />
                </Link>
              </div>
              
              {stat.growth > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <HiOutlineArrowTrendingUp className="text-green-600 dark:text-green-400 text-sm" />
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      +{stat.growth}
                    </span>
                  </div>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    this month
                  </span>
                </div>
              )}
              
              {/* Mini Chart */}
              <div className="mt-4">
                <MiniChart 
                  data={
                    stat.title === 'Total Users' ? monthlyData.users :
                    stat.title === 'Total Posts' ? monthlyData.posts :
                    monthlyData.comments
                  }
                  color={
                    stat.color === 'blue' ? '#3b82f6' :
                    stat.color === 'emerald' ? '#10b981' :
                    '#8b5cf6'
                  }
                  type="area"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {monthlyData.users.length > 0 && (
                    <>
                      <span>{monthlyData.users[0]?.month}</span>
                      <span>{monthlyData.users[monthlyData.users.length - 1]?.month}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split Section: Monthly Trends + User Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart - Left Side */}
        <div className={`rounded-2xl border p-6 ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Monthly Growth Trends
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Posts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Comments</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + i * 32}
                  x2="380"
                  y2={40 + i * 32}
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                  strokeWidth="1"
                  opacity="0.5"
                />
              ))}
              
              {/* Month labels */}
              {monthlyData.users.map((d, i) => (
                <text
                  key={i}
                  x={60 + i * 56}
                  y="190"
                  textAnchor="middle"
                  className={`text-xs fill-current ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {d.month}
                </text>
              ))}
              
              {/* Users line */}
              {monthlyData.users.length > 0 && (
                <polyline
                  points={monthlyData.users.map((d, i) => {
                    const x = 60 + i * 56;
                    const maxVal = Math.max(...monthlyData.users.map(u => u.value));
                    const y = 160 - (d.value / maxVal) * 120;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
              )}
              
              {/* Posts line */}
              {monthlyData.posts.length > 0 && (
                <polyline
                  points={monthlyData.posts.map((d, i) => {
                    const x = 60 + i * 56;
                    const maxVal = Math.max(...monthlyData.posts.map(p => p.value));
                    const y = 160 - (d.value / maxVal) * 120;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
              )}
              
              {/* Comments line */}
              {monthlyData.comments.length > 0 && (
                <polyline
                  points={monthlyData.comments.map((d, i) => {
                    const x = 60 + i * 56;
                    const maxVal = Math.max(...monthlyData.comments.map(c => c.value));
                    const y = 160 - (d.value / maxVal) * 120;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
              )}
              
              {/* Data points */}
              {monthlyData.users.map((d, i) => {
                const x = 60 + i * 56;
                const maxVal = Math.max(...monthlyData.users.map(u => u.value));
                const y = 160 - (d.value / maxVal) * 120;
                return (
                  <circle
                    key={`user-${i}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3b82f6"
                    className="drop-shadow-sm"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* User Leaderboard - Right Side */}
        <div className={`rounded-2xl border p-6 ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <HiOutlineTrophy className={`text-2xl ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
              }`} />
              <h3 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                              Top Contributors
            </h3>
          </div>
          <Link
            to="/dashboard?tab=users"
            className={`text-sm font-medium transition-colors ${
              theme === 'dark' 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {false ? (
              userLeaderboard.map((user, index) => (
                <div key={user.userId} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                }`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  
                  <img
                    src={user.photo}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.username}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {user.postCount} posts
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <HiOutlineStar className={`text-sm ${
                        theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                      }`} />
                      <span className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.totalLikes}
                      </span>
                    </div>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      likes
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className={`flex flex-col items-center justify-center py-12 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <HiOutlineTrophy className="text-5xl mb-3 opacity-40" />
                <p className="text-sm font-medium">No data available yet</p>
                <p className="text-xs mt-1 opacity-75">Leaderboard will appear when users start getting likes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className={`rounded-2xl border p-6 ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Users
            </h3>
            <Link
              to="/dashboard?tab=users"
              className={`text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <img
                  src={user.photo}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user.username}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className={`rounded-2xl border p-6 ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Posts
            </h3>
            <Link
                              to="/dashboard?tab=posts"
              className={`text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="flex items-center gap-3">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-12 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {post.title}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {post.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Comments */}
        <div className={`rounded-2xl border p-6 ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Comments
            </h3>
            <Link
                              to="/dashboard?tab=comments"
              className={`text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              View all →
            </Link>
          </div>
          
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="space-y-2">
                <p className={`text-sm line-clamp-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {comment.content}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {comment.numberOfLikes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 