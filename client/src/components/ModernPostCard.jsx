import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineArrowRight
} from 'react-icons/hi2';

export default function ModernPostCard({ post }) {
  const theme = useSelector((state) => state.theme.theme);
  
  const readingTime = Math.ceil(post.content.length / 1000);
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className={`group relative overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50 hover:border-gray-600/70' 
        : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50 hover:border-gray-300/70'
    }`}>
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <Link to={`/post/${post.slug}`}>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Link
            to={`/search?category=${post.category}`}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 ${
              theme === 'dark' 
                ? 'bg-blue-900/80 text-blue-300 border border-blue-800/50' 
                : 'bg-blue-100/90 text-blue-700 border border-blue-200/50'
            }`}
          >
            <HiOutlineTag className="text-xs" />
            {post.category}
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <HiOutlineCalendarDays className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {formattedDate}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <HiOutlineClock className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {readingTime} min read
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/post/${post.slug}`}>
          <h3 className={`text-lg font-bold mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-blue-600 ${
            theme === 'dark' ? 'text-white group-hover:text-blue-400' : 'text-gray-900'
          }`}>
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <div className={`text-sm mb-4 line-clamp-3 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...' 
            }} 
          />
        </div>

        {/* Read More Button */}
        <Link
                      to={`/post/${post.slug}`}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 group/btn ${
            theme === 'dark' 
              ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-800/50' 
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'
          }`}
        >
          <span>Read Article</span>
          <HiOutlineArrowRight className="text-sm transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Link>
      </div>

      {/* Hover Overlay Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-blue-600/5 to-purple-600/5' 
          : 'bg-gradient-to-br from-blue-100/20 to-purple-100/20'
      }`}></div>
    </div>
  );
} 