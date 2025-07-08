import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ModernUserPanel from '../components/ModernUserPanel';
import ModernCommentSection from '../components/ModernCommentSection';
import ModernPostCard from '../components/ModernPostCard';
import { 
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineArrowLeft,
  HiOutlineShare,
  HiOutlineHeart,
  HiOutlineBookmark,
  HiOutlineSparkles,
  HiOutlineUserPlus,
  HiOutlineCheck,
  HiOutlineClipboard,
  HiOutlineXMark
} from 'react-icons/hi2';

import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { debug } from '../utils/debug';
import { updateSuccess } from '../redux/user/userSlice';

export default function ModernPostPage() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [post, setPost] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 10);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');
  const [sharePlatform, setSharePlatform] = useState('');
  const shareMenuRef = useRef(null);

  useEffect(() => {
    if (post && currentUser) {
      setIsLiked(post.likes.includes(currentUser._id));
      setIsSaved(currentUser.savedPosts.includes(post._id));
      setLikeCount(post.numberOfLikes);
    }
  }, [post, currentUser]);

  useEffect(() => {
    if (creator && currentUser) {
      setIsFollowing(currentUser.following.includes(creator._id));
    }
  }, [creator, currentUser]);

  const fetchPostData = useCallback(async () => {
    try {
      setLoading(true);
      const postRes = await fetch(`/api/post/posts?slug=${postId}`);
      
      if (!postRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const postData = await postRes.json();
      
      if (postData.posts.length > 0) {
        setPost(postData.posts[0]);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostData();
    
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrolled / maxHeight) * 100;
      setReadingProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [postId, fetchPostData]);

  // Set share URL and title when post data is loaded
  useEffect(() => {
    if (post) {
      setShareUrl(window.location.href);
      setShareTitle(post.title);
    }
  }, [post]);

  useEffect(() => {
    const fetchCreator = async () => {
      if (!post) return;
      try {
        const res = await fetch(`/user/${post.author}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setCreator(data);
      } catch (error) {
        debug.error(error.message);
      }
    };
    fetchCreator();
  }, [post]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const handleLike = async () => {
    if (!currentUser) {
      // Handle not logged in case
      return;
    }
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const res = await fetch(`/api/post/posts/${post._id}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to like post');
      }
    } catch (error) {
      debug.error('Like error:', error);
      // Revert optimistic update
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      return;
    }
    
    try {
      const res = await fetch(`/api/post/posts/${post._id}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
      });
      if (!res.ok) {
        throw new Error('Failed to save post');
      }
      const data = await res.json();
      dispatch(updateSuccess(data.user));
    } catch (error) {
      debug.error('Save error:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !creator) {
      return;
    }
    
    try {
      const res = await fetch(`/api/user/users/${creator._id}/follow`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
      });
      if (!res.ok) {
        throw new Error('Failed to follow user');
      }
      const data = await res.json();
      dispatch(updateSuccess(data));
    } catch (error) {
      debug.error('Follow error:', error);
    }
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(shareTitle);
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${title}%20${url}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Link copied to clipboard!');
        });
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-black' : 'bg-gray-50'
      }`}>
        <ModernUserPanel />
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20' 
              : 'bg-gradient-to-br from-blue-100 to-purple-100'
          }`}>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
          <p className={`text-lg font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  const readingTime = post ? Math.ceil(post.content.length / 1000) : 0;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <ModernUserPanel />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-40">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 animate-pulse">
          <HiOutlineSparkles className={`text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-500">
          <HiOutlineSparkles className={`text-lg ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
        <div className="absolute bottom-32 left-16 animate-pulse delay-1000">
          <HiOutlineSparkles className={`text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse delay-700">
          <HiOutlineSparkles className={`text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/search"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-900/5'
            }`}
          >
            <HiOutlineArrowLeft className="text-lg" />
            <span>Back to Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <article className="article-content">
          <header className="mb-12">
            {/* Category Badge */}
            {post?.category && (
              <div className="mb-6">
                <Link
                  to={`/search?category=${post.category}`}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50 hover:bg-blue-900/50' 
                      : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                  }`}
                >
                  <HiOutlineTag className="text-sm" />
                  {post.category}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-8 leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {post?.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <HiOutlineCalendarDays className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {post && new Date(post.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineClock className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {readingTime} min read
                </span>
              </div>
            </div>

            {/* Author Information */}
            {creator && creator.username && (
              <div className={`flex items-center gap-4 p-6 rounded-3xl border backdrop-blur-sm mb-8 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
                  : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
              }`}>
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                }`}>
                  <img
                    src={creator.photo || '/default-avatar.png'}
                    alt={creator.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {creator.username}
                  </h3>
                  <p className={`text-sm font-medium ${
                    creator.isAdmin 
                      ? 'text-red-500' 
                      : creator.role === 'writer' 
                        ? 'text-blue-500' 
                        : 'text-green-500'
                  }`}>
                    {creator.role === 'writer' ? 'Writer' : creator.isAdmin ? 'Admin' : 'Author'}
                  </p>
                </div>
                <button 
                  onClick={handleFollow}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 active:brightness-125 ${
                    isFollowing
                      ? theme === 'dark' 
                        ? 'bg-green-600 hover:bg-green-700 text-white border border-green-500' 
                        : 'bg-green-600 hover:bg-green-700 text-white border border-green-500'
                      : theme === 'dark' 
                        ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-800/50' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-200'
                  }`}
                >
                  {isFollowing ? (
                    <HiOutlineCheck className="text-lg" />
                  ) : (
                    <HiOutlineUserPlus className="text-lg" />
                  )}
                  <span className="font-medium">{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              </div>
            )}
          </header>

          {/* Featured Image */}
          {post?.image && (
            <div className="mb-12">
              <div className="rounded-3xl overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className={`prose prose-lg max-w-none mb-12 ${
            theme === 'dark' 
              ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400 prose-blockquote:text-gray-300 prose-code:text-gray-300' 
              : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 prose-blockquote:text-gray-700 prose-code:text-gray-700'
          }`}>
            <div dangerouslySetInnerHTML={{ __html: post?.content }} />
          </div>
        </article>

        {/* Article Actions */}
        <div className={`flex items-center justify-between p-6 rounded-3xl border backdrop-blur-sm mb-12 relative ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
            : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
        }`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 active:brightness-125 ${
                isLiked
                  ? theme === 'dark' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                    : 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                  : theme === 'dark' 
                    ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' 
                    : 'bg-red-100 hover:bg-red-200 text-red-600'
              }`}
            >
              <HiOutlineHeart className="text-lg" />
              <span className="font-medium">{likeCount}</span>
            </button>
            <div className="relative share-menu-container">
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 active:brightness-125 ${
                  theme === 'dark' 
                    ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400' 
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                }`}
              >
                <HiOutlineShare className="text-lg" />
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 active:brightness-125 ${
              isSaved
                ? theme === 'dark' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' 
                  : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : theme === 'dark' 
                  ? 'bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400' 
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600'
            }`}
          >
            <HiOutlineBookmark className="text-lg" />
            <span className="font-medium">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className={`rounded-3xl border backdrop-blur-sm p-8 mb-12 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
            : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
        }`}>
          <ModernCommentSection postId={post?._id} />
        </div>

        {/* Share Modal */}
        {showShareMenu && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Blurred Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowShareMenu(false)}
            ></div>
            
            {/* Modal Content */}
            <div className={`relative w-full max-w-md mx-4 p-6 rounded-3xl border backdrop-blur-xl shadow-2xl ${
              theme === 'dark' 
                ? 'bg-gray-900/95 border-gray-700/50' 
                : 'bg-white/95 border-gray-200/50'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Share Article
                </h3>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className={`p-2 rounded-full transition-all duration-300 active:brightness-125 ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-800/50 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <HiOutlineXMark className="text-xl" />
                </button>
              </div>

              {/* Copy Link Section */}
              <div className={`p-4 rounded-2xl mb-6 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border border-gray-700/30' 
                  : 'bg-gray-50 border border-gray-200/50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`flex-1 px-3 py-2 rounded-lg text-sm font-mono truncate ${
                    theme === 'dark' 
                      ? 'bg-gray-900/50 text-gray-300' 
                      : 'bg-white text-gray-600'
                  }`}>
                    {shareUrl}
                  </div>
                  <button
                    onClick={() => handleShare('copy')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 active:brightness-125 ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <HiOutlineClipboard className="text-lg" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Platform Icons */}
              <div className="space-y-3">
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Share on social media
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 active:brightness-125 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 hover:bg-gray-800/70 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FaTwitter className="text-2xl text-blue-400" />
                    <span className="font-medium">Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('facebook')}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 active:brightness-125 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 hover:bg-gray-800/70 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FaFacebook className="text-2xl text-blue-600" />
                    <span className="font-medium">Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('linkedin')}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 active:brightness-125 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 hover:bg-gray-800/70 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FaLinkedin className="text-2xl text-blue-700" />
                    <span className="font-medium">LinkedIn</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 active:brightness-125 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 hover:bg-gray-800/70 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FaWhatsapp className="text-2xl text-green-500" />
                    <span className="font-medium">WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}