import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  HiOutlineSparkles,
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCalendarDays,
  HiOutlineTag,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineHeart,
  HiChevronDown,
  HiOutlineCheckCircle
} from 'react-icons/hi2';

import ModernUserPanel from '../components/ModernUserPanel.jsx';
import ModernPostCard from '../components/ModernPostCard.jsx';
import Portal from '../components/Portal.jsx';

export default function ModernSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized',
  });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [sortDropdownPosition, setSortDropdownPosition] = useState(null);
  const [categoryDropdownPosition, setCategoryDropdownPosition] = useState(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const location = useLocation();
  const navigate = useNavigate();
  const sortButtonRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const isInitialMount = useRef(true);

  const categories = [
    'All Categories', 'Art', 'Books', 'Business', 'Education', 'Entertainment',
    'Fashion', 'Food', 'Gaming', 'General', 'Health', 'Lifestyle', 'Movies',
    'Music', 'Politics', 'Science', 'Sports', 'Technology', 'Travel', 'Other'
  ];

  const sortOptions = [
    { value: 'desc', label: 'Latest First' },
    { value: 'asc', label: 'Oldest First' }
  ];

  // Handle escape key and click outside to close dropdowns
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowSortDropdown(false);
        setShowCategoryDropdown(false);
      }
    };
    
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest('.sort-dropdown') && !e.target.closest('.sort-dropdown-menu')) {
        setShowSortDropdown(false);
      }
      if (showCategoryDropdown && !e.target.closest('.category-dropdown') && !e.target.closest('.category-dropdown-menu')) {
        setShowCategoryDropdown(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown, showCategoryDropdown]);

  useEffect(() => {
    const updatePosition = () => {
      if (showSortDropdown && sortButtonRef.current) {
        const rect = sortButtonRef.current.getBoundingClientRect();
        setSortDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
      if (showCategoryDropdown && categoryButtonRef.current) {
        const rect = categoryButtonRef.current.getBoundingClientRect();
        setCategoryDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (showSortDropdown || showCategoryDropdown) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      updatePosition(); // Initial position update
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSortDropdown, showCategoryDropdown]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const urlParams = new URLSearchParams();
    if (sidebarData.searchTerm) {
      urlParams.set('searchTerm', sidebarData.searchTerm);
    }
    urlParams.set('sort', sidebarData.sort);
    if (sidebarData.category && sidebarData.category !== 'All Categories') {
      urlParams.set('category', sidebarData.category);
    }
            navigate(`/search?${urlParams.toString()}`);
  }, [sidebarData.sort, sidebarData.category]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    const sortFromUrl = urlParams.get('sort') || 'desc';
    const categoryFromUrl = urlParams.get('category') || '';
    setSidebarData({
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl,
      category: categoryFromUrl,
    });

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/post/posts?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setTotalPosts(data.totalPosts || data.posts.length);
        setLoading(false);
        if (data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    if (sidebarData.searchTerm) urlParams.set('searchTerm', sidebarData.searchTerm);
    if (sidebarData.sort) urlParams.set('sort', sidebarData.sort);
    if (sidebarData.category && sidebarData.category !== 'All Categories') {
      urlParams.set('category', sidebarData.category);
    }
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/post/posts?${searchQuery}`);
    if (!res.ok) {
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setPosts([...posts, ...data.posts]);
      setTotalPosts(data.totalPosts || totalPosts);
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };

  const handleSortDropdownToggle = () => {
    if (!showSortDropdown && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setSortDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
    setShowSortDropdown(!showSortDropdown);
  };

  const handleCategoryDropdownToggle = () => {
    if (!showCategoryDropdown && categoryButtonRef.current) {
      const rect = categoryButtonRef.current.getBoundingClientRect();
      setCategoryDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
    setShowCategoryDropdown(!showCategoryDropdown);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <ModernUserPanel />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 animate-pulse">
          <HiOutlineSparkles className={`text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-500">
          <HiOutlineMagnifyingGlass className={`text-lg ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r bg-clip-text text-transparent ${
            theme === 'dark' 
              ? 'from-white via-gray-300 to-gray-500' 
              : 'from-gray-900 via-gray-700 to-gray-500'
          }`}>
            EXPLORE
          </h1>
          <p className={`text-lg md:text-xl font-light max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Discover amazing content from our community of writers and creators.
          </p>
        </div>

        {/* Search and Filters */}
        <div className={`rounded-3xl border backdrop-blur-sm p-8 mb-12 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
            : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <HiOutlineMagnifyingGlass className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-xl ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                id="searchTerm"
                placeholder="Search for posts, topics, or keywords..."
                value={sidebarData.searchTerm}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
            </div>

            {/* Filters Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white hover:bg-white/5' 
                    : 'border-gray-400 text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-900/5'
                }`}
              >
                <HiOutlineAdjustmentsHorizontal className="text-lg" />
                <span>Filters</span>
              </button>

              <button
                type="submit"
                className={`px-8 py-3 font-bold tracking-wide rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                <span>SEARCH</span>
                <HiOutlineArrowRight className="text-lg" />
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
                {/* Sort */}
                <div className="sort-dropdown relative">
                  <label className={`block text-sm font-semibold mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Sort By
                  </label>
                  <div className="relative">
                    <button
                      ref={sortButtonRef}
                      type="button"
                      onClick={handleSortDropdownToggle}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 flex items-center justify-between ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20 hover:bg-gray-700' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 hover:bg-gray-50'
                      }`}
                    >
                      <span>{sortOptions.find(option => option.value === sidebarData.sort)?.label || 'Latest First'}</span>
                      <HiChevronDown className={`text-lg transition-transform duration-300 ${
                        showSortDropdown ? 'transform rotate-180' : ''
                      } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div className="category-dropdown relative">
                  <label className={`block text-sm font-semibold mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Category
                  </label>
                  <div className="relative">
                    <button
                      ref={categoryButtonRef}
                      type="button"
                      onClick={handleCategoryDropdownToggle}
                      className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 flex items-center justify-between ${
                        theme === 'dark' 
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20 hover:bg-gray-700' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <HiOutlineTag className={`text-lg ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span>{sidebarData.category || 'All Categories'}</span>
                      </div>
                      <HiChevronDown className={`text-lg transition-transform duration-300 ${
                        showCategoryDropdown ? 'transform rotate-180' : ''
                      } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {sidebarData.searchTerm ? `Results for "${sidebarData.searchTerm}"` : 'All Posts'}
          </h2>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} found
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                <span className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Loading posts...
                </span>
              </div>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className={`text-center py-20 rounded-3xl border backdrop-blur-sm ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
            }`}>
              <div className="flex items-center justify-center mb-6">
                <div className={`p-4 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-600/20 to-gray-500/20' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  <HiOutlineMagnifyingGlass className={`text-4xl ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                No posts found
              </h3>
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <ModernPostCard key={post._id} post={post} />
                ))}
              </div>

              {showMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={handleShowMore}
                    className={`px-8 py-4 border-2 font-bold text-lg tracking-wide rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      theme === 'dark' 
                        ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white hover:bg-white/5' 
                        : 'border-gray-400 text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-900/5'
                    }`}
                  >
                    LOAD MORE POSTS
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-16">
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

      {showSortDropdown && sortDropdownPosition && (
        <Portal>
          <div
            className={`sort-dropdown-menu fixed rounded-2xl border backdrop-blur-sm shadow-xl ${
              theme === 'dark' 
                ? 'bg-gray-800/95 border-gray-600' 
                : 'bg-white/95 border-gray-200'
            }`}
            style={{
              top: `${sortDropdownPosition.top}px`,
              left: `${sortDropdownPosition.left}px`,
              width: `${sortDropdownPosition.width}px`,
              zIndex: 10000
            }}
          >
            <div className="p-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSidebarData({ ...sidebarData, sort: option.value });
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between group ${
                    sidebarData.sort === option.value
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700/50'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                  {sidebarData.sort === option.value && (
                    <HiOutlineCheckCircle className={`text-lg ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Portal>
      )}

      {showCategoryDropdown && categoryDropdownPosition && (
        <Portal>
          <div
            className={`category-dropdown-menu fixed rounded-2xl border backdrop-blur-sm shadow-xl max-h-64 overflow-y-auto ${
              theme === 'dark' 
                ? 'bg-gray-800/95 border-gray-600' 
                : 'bg-white/95 border-gray-200'
            }`}
            style={{
              top: `${categoryDropdownPosition.top}px`,
              left: `${categoryDropdownPosition.left}px`,
              width: `${categoryDropdownPosition.width}px`,
              zIndex: 10000
            }}
          >
            <div className="p-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSidebarData({ ...sidebarData, category: category });
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between group ${
                    (sidebarData.category || 'All Categories') === category
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700/50'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{category}</span>
                  {(sidebarData.category || 'All Categories') === category && (
                    <HiOutlineCheckCircle className={`text-lg ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
} 