import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineChatBubbleLeftRight,
  HiOutlineRocketLaunch,
  HiOutlineAcademicCap,
  HiOutlineGlobeAlt,
  HiOutlineUsers,
  HiOutlineCommandLine
} from 'react-icons/hi2';

import ModernUserPanel from '../components/ModernUserPanel.jsx';

export default function ModernAbout() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);

  const features = [
    {
      icon: HiOutlineCommandLine,
      title: "Technology & Development",
      description: "Deep dives into web development, software engineering, and the latest tech trends."
    },
    {
      icon: HiOutlineAcademicCap,
      title: "Learning & Tutorials",
      description: "Step-by-step guides and tutorials to help you master new skills and technologies."
    },
    {
      icon: HiOutlineGlobeAlt,
      title: "Lifestyle & Sports",
      description: "Personal insights on lifestyle, sports, and everything that makes life interesting."
    },
    {
      icon: HiOutlineUsers,
      title: "Community Driven",
      description: "Engage with fellow readers through comments, discussions, and shared experiences."
    }
  ];

  const stats = [
    { number: "100+", label: "Articles Published" },
    { number: "1K+", label: "Community Members" },
    { number: "50+", label: "Topics Covered" },
    { number: "24/7", label: "Learning Support" }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Modern User Panel */}
      <ModernUserPanel />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 animate-pulse">
          <HiOutlineSparkles className={`text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-500">
          <HiOutlineCommandLine className={`text-lg ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <div className="absolute bottom-32 left-16 animate-pulse delay-1000">
          <HiOutlineHeart className={`text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse delay-700">
          <HiOutlineRocketLaunch className={`text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <h1 className={`text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
              theme === 'dark' 
                ? 'from-white via-gray-300 to-gray-500' 
                : 'from-gray-900 via-gray-700 to-gray-500'
            }`}>
              ABOUT
            </h1>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-wider mb-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              LITTLE'S BLOG
            </h2>
          </div>

          <div className={`max-w-4xl mx-auto rounded-3xl border backdrop-blur-sm p-8 md:p-12 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
              : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
          }`}>
            <div className="flex items-center justify-center mb-8">
              <div className={`p-4 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20' 
                  : 'bg-gradient-to-br from-blue-100 to-purple-100'
              }`}>
                <HiOutlineSparkles className={`text-4xl ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </div>

            <p className={`text-xl md:text-2xl font-light leading-relaxed mb-8 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Welcome to Little's Blog! This platform was created by{' '}
              <span className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Taha Efe Gümüş
              </span>{' '}
              as a personal project to share thoughts, ideas, and knowledge with the world.
            </p>

            <p className={`text-lg leading-relaxed ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Efe is a passionate developer who loves to write about technology, coding, and everything in between. 
              This blog serves as both a learning platform and a community hub for developers and tech enthusiasts.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
                    : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
                }`}
              >
                <div className={`text-3xl md:text-4xl font-black mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.number}
                </div>
                <div className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h3 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            What You'll Find Here
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
                    : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl flex-shrink-0 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20' 
                      : 'bg-gradient-to-br from-blue-100 to-purple-100'
                  }`}>
                    <feature.icon className={`text-2xl ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`text-xl font-bold mb-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className={`leading-relaxed ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Section */}
        <div className={`rounded-3xl border backdrop-blur-sm p-8 md:p-12 text-center ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
            : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-center mb-8">
            <div className={`p-4 rounded-2xl ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-emerald-600/20 to-teal-600/20' 
                : 'bg-gradient-to-br from-emerald-100 to-teal-100'
            }`}>
              <HiOutlineChatBubbleLeftRight className={`text-4xl ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
          </div>

          <h3 className={`text-3xl md:text-4xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Join Our Community
          </h3>

          <p className={`text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            On this blog, you'll find weekly articles on development, software engineering, sports, lifestyle, and more. 
            We encourage you to leave comments, engage with other readers, and be part of our growing community of learners.
          </p>

          <p className={`text-base leading-relaxed mb-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            You can like other people's comments, reply to them, and share your own insights. 
            We believe that a community of learners can help each other grow and improve.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/search"
              className={`px-8 py-4 font-bold text-lg tracking-wide rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              EXPLORE POSTS
            </Link>
            <Link
              to="/signin"
              className={`px-8 py-4 border-2 font-bold text-lg tracking-wide rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                theme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white hover:bg-white/5' 
                  : 'border-gray-400 text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-900/5'
              }`}
            >
              JOIN COMMUNITY
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-20 mb-20">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-900/5'
            }`}
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 