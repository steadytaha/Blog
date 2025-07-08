import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  updateStart, 
  updateSuccess, 
  updateFailure, 
  deleteUserStart, 
  deleteUserSuccess, 
  deleteUserFailure, 
  signOutSuccess 
} from '../redux/user/userSlice.js';
import { 
  HiOutlineExclamationCircle, 
  HiOutlineCamera, 
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineTrash,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import { HiOutlineMail } from 'react-icons/hi';
import app from '../firebase.js';
import { debug } from '../utils/debug.js';

export default function ModernDashProfile() {
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const error = useSelector((state) => state.user.error);
  const loading = useSelector((state) => state.user.loading);
  const dispatch = useDispatch();
  
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const filePickerRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploadError(null);
    if (!imageFile) return;

    setImageFileUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError('Could not upload image, file must be less than 2MB');
        setImageFileUploadProgress(0);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImageFileUrl(url);
          setFormData({ ...formData, photo: url });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes detected');
      return;
    }
    
    if (imageFileUploading) {
      setUpdateUserError('Please wait for image to upload');
      return;
    }
    
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess('Profile updated successfully');
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess());
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className={`rounded-3xl border p-8 backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
          : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-black tracking-tight mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Profile Studio
            </h1>
            <p className={`text-lg font-light ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Craft your digital identity
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-mono ${
            theme === 'dark' 
              ? 'bg-gray-800 text-gray-300 border border-gray-700' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {currentUser.isAdmin ? 'ADMIN' : currentUser.role ? currentUser.role.toUpperCase() : 'USER'}
          </div>
        </div>

        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center mb-12">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={filePickerRef}
            className="hidden"
          />
          <div className="relative mb-6">
            <div
              className="relative w-40 h-40 cursor-pointer group"
              onClick={() => filePickerRef.current.click()}
            >
              {imageFileUploadProgress > 0 && (
                <CircularProgressbar
                  value={imageFileUploadProgress}
                  text={`${imageFileUploadProgress}%`}
                  strokeWidth={3}
                  styles={{
                    path: {
                      stroke: `rgba(59, 130, 246, ${imageFileUploadProgress / 100})`,
                    },
                    root: {
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 10,
                    },
                  }}
                />
              )}
              <img
                src={imageFileUrl || currentUser.photo}
                alt="Profile"
                className={`w-40 h-40 rounded-3xl object-cover border-4 transition-all duration-500 shadow-2xl ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                } ${imageFileUploadProgress > 0 && imageFileUploadProgress < 100 ? 'opacity-60' : ''} group-hover:scale-105`}
              />
              <div className={`absolute inset-0 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                theme === 'dark' ? 'bg-black/60 backdrop-blur-sm' : 'bg-white/60 backdrop-blur-sm'
              }`}>
                <div className="text-center">
                  <HiOutlineCamera className={`text-3xl mb-2 mx-auto ${
                    theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`} />
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                    Change Photo
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {currentUser.username}
            </h2>
            <p className={`text-sm font-mono px-3 py-1 rounded-full inline-block ${
              theme === 'dark' 
                ? 'bg-gray-800 text-gray-400' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              @{currentUser.username}
            </p>
          </div>
          
          {imageFileUploadError && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{imageFileUploadError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Section */}
      <div className={`rounded-3xl border backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
          : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
      }`}>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Personal Information Section */}
          <div className="space-y-6">
            <h3 className={`text-xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Username
                </label>
                <HiOutlineUser className={`absolute left-4 top-11 text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-500 group-focus-within:text-blue-500'
                }`} />
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  defaultValue={currentUser.username}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                      : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-400`}
                />
              </div>

              <div className="relative group">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <HiOutlineMail className={`absolute left-4 top-11 text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-500 group-focus-within:text-blue-500'
                }`} />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  defaultValue={currentUser.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                      : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-400`}
                />
              </div>

              <div className="relative group">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  New Password
                </label>
                <HiOutlineLockClosed className={`absolute left-4 top-11 text-lg transition-colors ${
                  theme === 'dark' ? 'text-gray-400 group-focus-within:text-blue-400' : 'text-gray-500 group-focus-within:text-blue-500'
                }`} />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter new password"
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                      : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-400`}
                />
              </div>

              <div className="relative group">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nationality
                </label>
                <select
                  className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800' 
                      : 'bg-gray-50/50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-400`}
                >
                  <option value="">Select your nationality</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="de">Germany</option>
                  <option value="fr">France</option>
                  <option value="jp">Japan</option>
                  <option value="in">India</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Bio
              </label>
              <textarea
                placeholder="Tell us about yourself..."
                rows={4}
                className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300 resize-none ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                    : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                } focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-400`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                      : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-400`}
                />
              </div>

              <div className="relative group">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                      : 'bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-400`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading || imageFileUploading}
              className={`flex-1 py-4 px-8 font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                loading || imageFileUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500/20'
              }`}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>

            {(currentUser.isAdmin || currentUser.role === "writer") && (
              <Link
                to="/create-post"
                className={`flex-1 py-4 px-8 font-bold text-lg rounded-2xl text-center transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500/20'
                }`}
              >
                Create Post
              </Link>
            )}
          </div>

          {/* Success/Error Messages */}
          {updateUserSuccess && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">{updateUserSuccess}</p>
            </div>
          )}

          {updateUserError && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{updateUserError}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone */}
      <div className={`rounded-3xl border backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-800/30' 
          : 'bg-gradient-to-br from-red-50/80 to-red-100/60 border-red-200/50'
      }`}>
        <div className="p-8">
          <h3 className={`text-xl font-bold mb-4 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            Danger Zone
          </h3>
          <p className={`text-sm mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            These actions are irreversible. Please proceed with caution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowModal(true)}
              className={`flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-red-900/50 hover:bg-red-900/70 text-red-400 hover:text-red-300 border border-red-800/50'
                  : 'bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 border border-red-300'
              }`}
            >
              <HiOutlineTrash className="text-lg" />
              Delete Account
            </button>

            <button
              onClick={handleSignout}
              className={`flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 hover:bg-gray-800/70 text-gray-400 hover:text-gray-300 border border-gray-700/50'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 border border-gray-300'
              }`}
            >
              <HiOutlineArrowRightOnRectangle className="text-lg" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

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
                Are you sure you want to delete your account?
              </h3>
              <p className={`text-sm mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                This action cannot be undone. All your data will be permanently removed.
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
    </div>
  );
} 