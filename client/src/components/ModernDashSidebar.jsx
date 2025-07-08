import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signOutSuccess } from '../redux/user/userSlice';
import { 
  HiOutlineChartBarSquare,
  HiOutlineUsers,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChatBubbleLeftEllipsis
} from 'react-icons/hi2';
import { debug } from '../utils/debug';

export default function ModernDashSidebar({ currentTab, isOpen, onClose }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const theme = useSelector((state) => state.theme.theme);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signOutSuccess());
      } else {
        debug.error(data.message);
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const navigationItems = [
    ...(currentUser && currentUser.isAdmin ? [{
      key: 'dash',
      icon: HiOutlineChartBarSquare,
      label: 'Overview',
      href: '/dashboard?tab=dash'
    }, {
      key: 'users',
      icon: HiOutlineUsers,
      label: 'Users',
      href: '/dashboard?tab=users'
    }, {
      key: 'chatbot',
      icon: HiOutlineChatBubbleLeftEllipsis,
      label: 'Chatbot Analytics',
      href: '/dashboard?tab=chatbot'
    }] : []),
    {
      key: 'profile',
      icon: HiOutlineUser,
      label: 'Profile',
      href: '/dashboard?tab=profile',
      badge: currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : (currentUser?.isAdmin ? 'Admin' : 'User')
    },
    ...((currentUser?.isAdmin || currentUser?.role === "writer") ? [{
      key: 'posts',
      icon: HiOutlineDocumentText,
      label: 'Posts',
      href: '/dashboard?tab=posts'
    }, {
      key: 'comments',
      icon: HiOutlineChatBubbleBottomCenterText,
      label: 'Comments',
      href: '/dashboard?tab=comments'
    }] : [])
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 z-50 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:mt-20 md:h-[calc(100vh-5rem)] ${
        theme === 'dark' 
          ? 'bg-gray-950 border-gray-800' 
          : 'bg-white border-gray-200'
      } border-r`}>
        
        {/* Sidebar Content */}
        <div className="flex flex-col h-full p-4">
          {/* User Info Section */}
          <div className={`p-4 rounded-xl mb-6 border transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-900 border-gray-800' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700">
                <img
                  src={currentUser?.photo || '/default-avatar.png'}
                  alt={currentUser?.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {currentUser?.username}
                </h3>
                <p className={`text-xs font-mono ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  @{currentUser?.username}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key || (!currentTab && item.key === 'dash');
              
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-white text-black shadow-lg'
                        : 'bg-gray-900 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`text-xl ${
                    isActive 
                      ? 'opacity-100' 
                      : 'opacity-70 group-hover:opacity-100'
                  }`} />
                  <span className={`font-medium ${
                    isActive 
                      ? 'opacity-100' 
                      : 'opacity-90 group-hover:opacity-100'
                  }`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`ml-auto px-2 py-1 text-xs font-mono rounded-full ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-gray-700 text-gray-200'
                        : theme === 'dark'
                          ? 'bg-gray-800 text-gray-400'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="pt-4 border-t border-gray-800 dark:border-gray-700">
            <button
              onClick={handleSignout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                theme === 'dark'
                  ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                  : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <HiOutlineArrowRightOnRectangle className="text-xl opacity-70 group-hover:opacity-100" />
              <span className="font-medium opacity-90 group-hover:opacity-100">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 