import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  HiOutlineExclamationCircle, 
  HiOutlineTrash, 
  HiOutlinePencil,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineNoSymbol
} from 'react-icons/hi2';
import { HiOutlineStar } from 'react-icons/hi';

export default function ModernDashUsers() {
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/users?startIndex=0&limit=10`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
          setTotalUsers(data.totalUsers || data.users.length);
          setShowMore(data.users.length === 10);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const getTotalUsersCount = async () => {
      try {
        const response = await fetch('/api/user/users?countOnly=true');
        const data = await response.json();
        if (response.ok && data.totalUsers) {
          setTotalUsers(data.totalUsers);
        }
      } catch (error) {
        console.error('Error fetching total users count:', error);
      }
    };

    if (currentUser.isAdmin) {
      getUsers();
      getTotalUsersCount();
    }
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(`/api/user/users?startIndex=${startIndex}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setUsers((prevUsers) => [...prevUsers, ...data.users]);
        setShowMore(data.users.length === 10);
      }
    } catch (error) {
      console.error('Error fetching more users:', error);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/user/delete/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(users.filter(user => user._id !== userId));
        setTotalUsers(prev => prev - 1);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdateUser = async (role) => {
    setShowEditModal(false);
    try {
      let updateData = {};

      if (role === 'admin') {
        updateData = { isAdmin: true };
      } else if (role === 'writer') {
        updateData = { role: 'writer' };
      }

      const res = await fetch(`/api/user/role/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(user => (user._id === userId ? updatedUser : user)));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getRoleIcon = (user) => {
    if (user.isAdmin) {
      return <HiOutlineStar className="text-yellow-500 text-xl" />;
    } else if (user.role === 'writer') {
      return <HiOutlineDocumentText className="text-blue-500 text-xl" />;
    } else {
      return <HiOutlineNoSymbol className="text-red-500 text-xl" />;
    }
  };

  const getRoleText = (user) => {
    if (user.isAdmin) return 'Admin';
    if (user.role === 'writer') return 'Writer';
    return 'User';
  };

  if (!currentUser.isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HiOutlineUsers className={`mx-auto text-6xl mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Access Denied
          </h3>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            You need admin privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          User Management
        </h1>
        <div className={`px-4 py-2 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Total Users: {totalUsers}
          </span>
        </div>
      </div>

      {users.length > 0 ? (
        <div className={`rounded-2xl border overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Table Header */}
          <div className={`grid grid-cols-7 gap-4 p-4 border-b font-medium text-sm ${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700 text-gray-300' 
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <div>Date Created</div>
            <div>Avatar</div>
            <div>Username</div>
            <div>Email</div>
            <div>Role</div>
            <div>Edit</div>
            <div>Delete</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <div key={user._id} className={`grid grid-cols-7 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <div className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                
                <div>
                  <img 
                    src={user.photo} 
                    alt={user.username} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
                
                <div className="font-medium">
                  {user.username}
                </div>
                
                <div className="text-sm truncate">
                  {user.email}
                </div>
                
                <div className="flex items-center gap-2">
                  {getRoleIcon(user)}
                  <span className="text-sm font-medium">
                    {getRoleText(user)}
                  </span>
                </div>
                
                <div>
                  <button
                    onClick={() => { setShowEditModal(true); setUserId(user._id); }}
                    className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <HiOutlinePencil className="text-sm" />
                    Edit
                  </button>
                </div>
                
                <div>
                  <button
                    onClick={() => { setShowModal(true); setUserId(user._id); }}
                    className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <HiOutlineTrash className="text-sm" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show More Button */}
          {showMore && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handleShowMore}
                className="w-full py-2 px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium rounded-lg transition-colors"
              >
                Show More Users
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-2xl border p-12 text-center ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <HiOutlineUsers className={`mx-auto text-6xl mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No Users Found
          </h3>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            There are no users to display at the moment.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'
          }`}>
            <div className="text-center">
              <HiOutlineExclamationCircle className="text-red-500 text-6xl mx-auto mb-4" />
              <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Are you sure?
              </h3>
              <p className={`text-sm mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                This action cannot be undone. The user will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 py-2 px-4 font-medium rounded-lg transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'
          }`}>
            <div className="text-center">
              <HiOutlinePencil className="text-blue-500 text-6xl mx-auto mb-4" />
              <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Change User Role
              </h3>
              <p className={`text-sm mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Select the new role for this user.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleUpdateUser('admin')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                                      <HiOutlineStar className="text-lg" />
                  Make Admin
                </button>
                <button
                  onClick={() => handleUpdateUser('writer')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  <HiOutlineDocumentText className="text-lg" />
                  Make Writer
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`w-full py-3 px-4 font-medium rounded-lg transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 