import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import ModernAbout from './pages/ModernAbout'
import ModernDashboard from './pages/ModernDashboard'
import ModernHome from './pages/ModernHome'
import ModernProjects from './pages/ModernProjects'
import ModernSignIn from './pages/ModernSignIn'
import ModernSignUp from './pages/ModernSignUp'
import ModernSearch from './pages/ModernSearch'
import ModernCreatePost from './pages/ModernCreatePost'
import UpdatePost from './pages/UpdatePost'
import ModernPostPage from './pages/ModernPostPage'
import PrivateRoute from './components/PrivateRoute'
import AdminPrivateRoute from './components/AdminPrivateRoute'
import SmoothScrollbar from './components/SmoothScrollbar';
import ReloadPrompt from './components/ReloadPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { getOfflinePosts, clearOfflinePosts } from './utils/offlineStore';
import { setOnline, setOffline } from './redux/network/networkSlice';

async function syncOfflinePosts() {
  const offlinePosts = await getOfflinePosts();
  if (offlinePosts.length === 0) {
    return;
  }

  console.log(`Syncing ${offlinePosts.length} offline posts...`);

  try {
    const response = await fetch('/post/create-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ posts: offlinePosts }),
    });

    if (response.ok) {
      console.log('Offline posts synced successfully');
      await clearOfflinePosts();
    } else {
      console.error('Failed to sync offline posts:', await response.text());
    }
  } catch (error) {
    console.error('Error syncing offline posts:', error);
  }
}

function AppContent() {
  return (
    <SmoothScrollbar>
      <Routes>
        <Route path="/" element={<ModernHome />} />
        <Route path="/about" element={<ModernAbout />} />
        <Route path="/signin" element={<ModernSignIn />} />
        <Route path="/signup" element={<ModernSignUp />} />
        <Route path="/search" element={<ModernSearch />} />
        <Route element={<PrivateRoute/>}>
          <Route path="/dashboard" element={<ModernDashboard />} />
        </Route>
        <Route element={<AdminPrivateRoute/>}>
          <Route path="/create-post" element={<ModernCreatePost />} />
          <Route path="/post/edit/:postId" element={<UpdatePost />} />
        </Route>
        <Route path="/projects" element={<ModernProjects />} />
        <Route path="/post/:postId" element={<ModernPostPage />} />
      </Routes>
    </SmoothScrollbar>
  );
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Sync posts on initial load
    syncOfflinePosts();

    // Add event listener for when app comes back online
    window.addEventListener('online', syncOfflinePosts);

    const handleOnline = () => dispatch(setOnline());
    const handleOffline = () => dispatch(setOffline());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', syncOfflinePosts);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return (
    <Router>
      <AppContent />
      <ReloadPrompt />
      <OfflineIndicator />
    </Router>
  )
}
