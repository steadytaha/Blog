import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { debug } from '../utils/debug.js';

export default function AdminRoute({ children }) {
  const { currentUser } = useSelector((state) => state.user);

  // Show loading while checking authentication
  if (currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Checking permissions...</span>
      </div>
    );
  }

  // Redirect if not admin
  if (!currentUser || !currentUser.isAdmin) {
    debug.warn('Non-admin user attempted to access admin route');
    return <Navigate to="/" replace />;
  }

  return children;
} 