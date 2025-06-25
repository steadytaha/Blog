import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { BsToggle2Off, BsToggle2On } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ModernUserPanel from '../components/ModernUserPanel.jsx';
import GlobeAnimation from '../components/GlobeAnimation.jsx';
import ChatbotPanel from '../components/ChatbotPanel.jsx';

export default function ModernHome() {
  const [posts, setPosts] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/post/getposts');
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const FADE_IN_ANIMATION_VARIANTS = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen overflow-hidden modern-scrollbar transition-colors duration-500 relative ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
        }}
      />
      
      {/* Modern User Panel */}
      <ModernUserPanel />
      
      {/* New Globe Animation Background */}
      <GlobeAnimation />

      {/* Switch to Classic Version Toggle */}
      {currentUser && currentUser.isAdmin && (
        <div className="absolute top-8 left-8 z-20">
          <Link 
            to="/classic" 
            className={`flex items-center gap-3 px-6 py-3 border rounded-full transition-all duration-300 group ${
              theme === 'dark' 
                ? 'bg-gray-900 hover:bg-gray-800 border-gray-700' 
                : 'bg-white hover:bg-gray-50 border-gray-300 shadow-lg'
            }`}
          >
            <span className={`text-sm font-light group-hover:opacity-100 transition-opacity duration-300 ${
              theme === 'dark' 
                ? 'text-gray-300 group-hover:text-white' 
                : 'text-gray-600 group-hover:text-gray-900'
            }`}>
              Switch to Classic
            </span>
            <BsToggle2Off className={`text-xl transition-colors duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 group-hover:text-white' 
                : 'text-gray-500 group-hover:text-gray-900'
            }`} />
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4">
        <motion.div 
          className="text-center z-10"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.2 }}
        >
          <motion.h1 
            variants={FADE_IN_ANIMATION_VARIANTS}
            className={`modern-title text-7xl sm:text-9xl md:text-[150px] font-black tracking-tighter mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
            theme === 'dark' 
              ? 'from-white via-gray-300 to-gray-500' 
              : 'from-gray-900 via-gray-700 to-gray-500'
          }`}>
            LITTLE'S
          </motion.h1>
          <motion.h2 
            variants={FADE_IN_ANIMATION_VARIANTS}
            className={`modern-title text-4xl sm:text-5xl md:text-7xl font-black tracking-wider mb-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            BLOG
          </motion.h2>
          <motion.p 
            variants={FADE_IN_ANIMATION_VARIANTS}
            className={`text-xl max-w-3xl mx-auto mb-16 font-light leading-relaxed ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Exploring the intersection of technology, design, and human experience
            through minimal storytelling and bold perspectives.
          </motion.p>
          <motion.div 
            variants={FADE_IN_ANIMATION_VARIANTS}
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8"
          >
            <Link
              to="/modern-search"
              className={`px-6 sm:px-8 py-3 sm:py-4 font-bold text-base sm:text-lg tracking-wide transition-all duration-300 transform hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              EXPLORE POSTS
            </Link>
            <Link
              to="/modern-about"
              className={`px-6 sm:px-8 py-3 sm:py-4 border font-bold text-base sm:text-lg tracking-wide transition-all duration-300 ${
                theme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white' 
                  : 'border-gray-400 text-gray-700 hover:border-gray-900 hover:text-gray-900'
              }`}
            >
              ABOUT
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Recent Posts Section */}
      {posts && posts.length > 0 && (
        <section className="relative py-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h3 className={`text-5xl font-black tracking-wider mb-4 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                RECENT POSTS
              </h3>
              <div className={`w-24 h-px mx-auto ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
            </div>
            
            {/* Spherical Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {posts.slice(0, 6).map((post) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group relative transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:scale-[1.02]"
                >
                  <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black'
                      : 'bg-gradient-to-br from-gray-100 to-white'
                  }`}></div>
                  <div className={`relative p-8 border rounded-lg backdrop-blur-sm group-hover:border-gray-500 transition-all duration-300 h-full ${
                    theme === 'dark'
                      ? 'border-gray-800 bg-gray-900/50 group-hover:border-gray-600'
                      : 'border-gray-200 bg-white/50 group-hover:border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
                      <span className="text-gray-500 text-sm font-mono uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                    <h4 className={`text-xl font-bold mb-3 line-clamp-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {post.title}
                    </h4>
                    <p className={`text-sm line-clamp-3 mb-6 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                    <Link
                      to={`/modern-post/${post.slug}`}
                      className={`inline-flex items-center font-mono text-sm transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'text-white group-hover:text-gray-300'
                          : 'text-black group-hover:text-gray-600'
                      }`}
                    >
                      READ MORE →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-20">
              <Link
                to="/modern-search"
                className={`inline-flex items-center gap-4 px-12 py-4 border font-bold text-lg tracking-wide transition-all duration-300 ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                VIEW ALL POSTS
                <HiOutlineSparkles className="text-xl" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={`relative py-20 border-t ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <div className={`text-2xl font-black tracking-wider mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
              }`}>
                LITTLE'S BLOG
              </div>
              <p className="text-gray-600 text-sm">
                Minimal. Modern. Meaningful.
              </p>
            </div>
            
            {/* Orbital Social Links */}
            <div className="relative">
              <div className="flex items-center justify-center gap-6">
                <Link
                  to="/modern-about"
                  className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-300 ${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-500 hover:text-white hover:border-white'
                      : 'border-gray-300 text-gray-500 hover:text-black hover:border-black'
                  }`}
                >
                  <span className="text-sm font-mono">AB</span>
                </Link>
                <Link
                  to="/modern-projects"
                  className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-300 ${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-500 hover:text-white hover:border-white'
                      : 'border-gray-300 text-gray-500 hover:text-black hover:border-black'
                  }`}
                >
                  <span className="text-sm font-mono">PR</span>
                </Link>
                <Link
                  to="/modern-search"
                  className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-300 ${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-500 hover:text-white hover:border-white'
                      : 'border-gray-300 text-gray-500 hover:text-black hover:border-black'
                  }`}
                >
                  <span className="text-sm font-mono">SE</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className={`text-center mt-12 pt-8 border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <p className="text-gray-600 text-sm font-mono">
              © 2024 Little's Blog. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <ChatbotPanel />
    </div>
  );
} 