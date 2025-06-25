import React from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import About from './pages/About'
import ModernAbout from './pages/ModernAbout'
import ClassicDashboard from './pages/ClassicDashboard'
import ModernDashboard from './pages/ModernDashboard'
import ModernHome from './pages/ModernHome'
import ClassicHome from './pages/ClassicHome'
import Projects from './pages/Projects'
import ModernProjects from './pages/ModernProjects'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ModernSignIn from './pages/ModernSignIn'
import ModernSignUp from './pages/ModernSignUp'
import ModernSearch from './pages/ModernSearch'
import CreatePost from './pages/CreatePost'
import ModernCreatePost from './pages/ModernCreatePost'
import UpdatePost from './pages/UpdatePost'
import PostPage from './pages/PostPage'
import ModernPostPage from './pages/ModernPostPage'
import Search from './pages/Search';
import Header from './components/Header'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import AdminPrivateRoute from './components/AdminPrivateRoute'
import SmoothScrollbar from './components/SmoothScrollbar';

function AppContent() {
  const location = useLocation();
  const isModernPage = location.pathname === '/' || 
                      location.pathname === '/modern-dashboard' || 
                      location.pathname === '/modern-about' ||
                      location.pathname === '/modern-projects' ||
                      location.pathname === '/modern-signin' ||
                      location.pathname === '/modern-signup' ||
                      location.pathname === '/modern-search' ||
                      location.pathname === '/modern-create-post' ||
                      location.pathname.startsWith('/modern-post/');

  return (
    <SmoothScrollbar>
      {!isModernPage && <Header />}
      <Routes>
        <Route path="/" element={<ModernHome />} />
        <Route path="/classic" element={<ClassicHome />} />
        <Route path="/about" element={<About />} />
        <Route path="/modern-about" element={<ModernAbout />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/modern-signin" element={<ModernSignIn />} />
        <Route path="/modern-signup" element={<ModernSignUp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/modern-search" element={<ModernSearch />} />
        <Route element={<PrivateRoute/>}>
          <Route path="/dashboard" element={<ClassicDashboard />} />
          <Route path="/modern-dashboard" element={<ModernDashboard />} />
        </Route>
        <Route element={<AdminPrivateRoute/>}>
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/modern-create-post" element={<ModernCreatePost />} />
          <Route path="/post/edit/:postId" element={<UpdatePost />} />
        </Route>
        <Route path="/projects" element={<ModernProjects />} />
        <Route path="/classic-projects" element={<Projects />} />
        <Route path="/modern-projects" element={<ModernProjects />} />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/modern-post/:postId" element={<ModernPostPage />} />
      </Routes>
      {!isModernPage && <Footer />}
    </SmoothScrollbar>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
