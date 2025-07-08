import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signOutSuccess } from '../redux/user/userSlice';
import { 
  HiOutlineUser, 
  HiOutlineCog6Tooth, 
  HiOutlineArrowRightOnRectangle,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineSparkles,
  HiOutlineBell,
  HiOutlineArrowPath,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlinePuzzlePiece
} from 'react-icons/hi2';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { debug } from '../utils/debug';
import SmoothScrollbar from './SmoothScrollbar';
import GamesPanel from './games/GamesPanel';

export default function ModernUserPanel() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const scrollbarRef = useRef(null);

  // --- Real Notification State ---
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    setIsLoadingNotifications(true);
    try {
              const res = await fetch('/api/notifications?limit=20');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setHasUnread(data.unreadCount > 0);
      } else {
        debug.error('Failed to fetch notifications');
      }
    } catch (error) {
      debug.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setHasUnread(false);
        setUnreadCount(0);
      } else {
        debug.error('Failed to mark notifications as read');
      }
    } catch (error) {
      debug.error('Error marking notifications as read:', error);
    }
  };

  // Mark specific notification as read
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        ));
        const newUnreadCount = notifications.filter(n => 
          !n.read && n._id !== notificationId
        ).length;
        setUnreadCount(newUnreadCount);
        setHasUnread(newUnreadCount > 0);
      }
    } catch (error) {
      debug.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;

    const deletedNotification = notifications.find(n => n._id === notificationId);
    const updatedNotifications = notifications.filter(n => n._id !== notificationId);
    
    // Optimistic UI update
    setNotifications(updatedNotifications);
    if (deletedNotification && !deletedNotification.read) {
      const newUnreadCount = unreadCount - 1;
      setUnreadCount(newUnreadCount);
      setHasUnread(newUnreadCount > 0);
    }

    try {
      const res = await fetch(`/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        debug.error('Failed to delete notification, reverting.');
        // Revert on failure
        setNotifications(originalNotifications);
        setUnreadCount(originalUnreadCount);
        setHasUnread(originalUnreadCount > 0);
      }
    } catch (error) {
      debug.error('Error deleting notification:', error);
      // Revert on error
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
      setHasUnread(originalUnreadCount > 0);
    }
  };

  const handleDeleteAllNotifications = async () => {
    setShowDeleteConfirm(false); // Close the confirmation dialog
    const originalNotifications = [...notifications];
    setNotifications([]);
    setUnreadCount(0);
    setHasUnread(false);

    try {
      const res = await fetch('/api/notifications/delete-all', {
        method: 'DELETE',
      });

      if (!res.ok) {
        debug.error('Failed to delete all notifications, reverting.');
        setNotifications(originalNotifications);
        const newUnreadCount = originalNotifications.filter(n => !n.read).length;
        setUnreadCount(newUnreadCount);
        setHasUnread(newUnreadCount > 0);
      }
    } catch (error) {
      debug.error('Error deleting all notifications:', error);
      setNotifications(originalNotifications);
      const newUnreadCount = originalNotifications.filter(n => !n.read).length;
      setUnreadCount(newUnreadCount);
      setHasUnread(newUnreadCount > 0);
    }
  };

  // Handle notification click to navigate to related post
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkNotificationRead(notification._id);
    }
    
    // Navigate to the post
    if (notification.postId?.slug) {
      setNotificationsOpen(false);
      scrollbarRef.current?.scrollTop(0);
      navigate(`/post/${notification.postId.slug}`);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      
      // Set up periodic refresh for notifications (every 30 seconds)
      const interval = setInterval(() => {
        if (currentUser) {
          fetchNotifications();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);
  // --- End Real Notification State ---

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
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
    if (isNotificationsOpen) setNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    const newState = !isNotificationsOpen;
    setNotificationsOpen(newState);
    if (isOpen) setIsOpen(false);
    
    // Refresh notifications when opening the panel
    if (newState && currentUser) {
      fetchNotifications();
    } else if (!newState) {
      scrollbarRef.current?.scrollTop(0);
    }
  };

  const handleGamesToggle = () => {
    setIsGamesOpen(!isGamesOpen);
    if (isOpen) setIsOpen(false);
    if (isNotificationsOpen) setNotificationsOpen(false);
  };

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.user-avatar-panel')) {
        setIsOpen(false);
      }
      if (isNotificationsOpen && !event.target.closest('.notifications-panel')) {
        setNotificationsOpen(false);
        scrollbarRef.current?.scrollTop(0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isNotificationsOpen]);

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
            to="/signin"
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
      <div className="flex items-center gap-4">
        {/* Notifications Bell Button */}
        <div className="relative notifications-panel">
          <button
            className={`w-14 h-14 rounded-full transition-all duration-300 group flex items-center justify-center relative`}
            onClick={handleNotificationsToggle}
          >
            <HiOutlineBell className={`text-2xl transition-colors duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 group-hover:text-white' 
                : 'text-gray-600 group-hover:text-gray-900'
            }`} />
            {/* Notification badge */}
            {hasUnread && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></div>
            )}
          </button>
          {/* Notifications Panel */}
          <div
            className={`absolute top-16 right-0 w-96 backdrop-blur-md border rounded-2xl p-4 transform transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-black bg-opacity-90 border-gray-800' 
                : 'bg-white bg-opacity-95 border-gray-200 shadow-xl'
            } ${
              isNotificationsOpen 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
            }`}
          >
            <div className={`text-lg font-semibold mb-2 pb-2 border-b flex items-center justify-between ${theme === 'dark' ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>
              <span>Notifications</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchNotifications}
                  disabled={isLoadingNotifications}
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                  } disabled:opacity-50`}
                  title="Refresh notifications"
                >
                  <HiOutlineArrowPath className={`w-4 h-4 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={notifications.length === 0}
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-red-900/40 text-gray-400 hover:text-red-400'
                      : 'hover:bg-red-100 text-gray-500 hover:text-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Delete all notifications"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-80" style={{ height: '320px' }}>
              {notifications.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <HiOutlineBell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-semibold mb-1">No notifications yet</p>
                    <p className="text-xs opacity-75">New notifications will appear here.</p>
                  </div>
                </div>
              ) : (
              <SmoothScrollbar height="100%" ref={scrollbarRef}>
                <div className="space-y-2 pr-2">
                  {notifications.map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`p-3 rounded-lg group transition-all duration-200 ${
                          !notification.read 
                            ? theme === 'dark' 
                              ? 'bg-blue-900/20 hover:bg-blue-900/30 border-l-4 border-blue-500' 
                              : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                            : theme === 'dark'
                              ? 'hover:bg-gray-800/50'
                              : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                            <p className={`text-sm leading-relaxed ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs mt-1 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-col items-center flex-shrink-0">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mb-1.5"></div>
                            )}
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification._id);
                              }}
                              className={`p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                                  theme === 'dark'
                                      ? 'hover:bg-red-900/40 text-gray-400 hover:text-red-400'
                                      : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
                              }`}
                              title="Delete notification"
                            >
                              <HiOutlineXMark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </SmoothScrollbar>
              )}
            </div>
            {hasUnread && notifications.length > 0 && (
              <div className={`mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <button 
                  onClick={handleMarkAllAsRead}
                  className={`w-full text-sm py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-blue-400 hover:text-blue-300' : 'hover:bg-gray-200 text-blue-600 hover:text-blue-700'}`}
                >
                  Mark all as read ({unreadCount})
                </button>
              </div>
            )}

            {/* Delete All Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Confirm Deletion</h3>
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Are you sure you want to delete all notifications? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAllNotifications}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Avatar Button */}
        <div className="relative user-avatar-panel">
          <button
            onClick={handlePanelToggle}
            className={`w-14 h-14 rounded-full transition-all duration-300 group flex items-center justify-center`}
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
              {(currentUser.isAdmin || currentUser.role === "writer") && (
                <Link
                  to="/create-post"
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

              <button
                onClick={handleGamesToggle}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-900' 
                    : 'hover:bg-gray-200'
                }`}
              >
                <HiOutlinePuzzlePiece className={`text-xl transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-400 group-hover:text-white' 
                    : 'text-gray-600 group-hover:text-gray-900'
                }`} />
                <span className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 group-hover:text-white' 
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>Games</span>
              </button>

              <Link
                to="/dashboard?tab=profile"
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

              {currentUser.isAdmin && (
                <Link
                  to="/dashboard"
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

      {/* Games Panel */}
      {isGamesOpen && (
        <GamesPanel onClose={() => setIsGamesOpen(false)} />
      )}
    </div>
  );
} 