import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HiOutlineExclamationCircle, 
  HiOutlineTrash, 
  HiOutlinePencil,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineCalendarDays,
  HiOutlineTag,
  HiOutlinePlus
} from 'react-icons/hi2';

export default function ModernDashPosts() {
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [userPosts, setUserPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postId, setPostId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      if(currentUser.isAdmin) {
        try {
          const response = await fetch(`/post/posts?startIndex=0&limit=10`);
          const data = await response.json();
          if (response.ok) {
            setUserPosts(data.posts);
            setTotalPosts(data.totalPosts || data.posts.length);
            setShowMore(data.posts.length === 10);
          }
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      } else if (currentUser.role === "writer") {
        try {
          const response = await fetch(`/post/posts?author=${currentUser._id}`);
          const data = await response.json();
          if (response.ok) {
            setUserPosts(data.posts);
            setTotalPosts(data.totalPosts || data.posts.length);
            setShowMore(data.posts.length === 10);
          }
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      }
      setLoading(false);
    };

    if (currentUser.isAdmin || currentUser.role === "writer") {
      getPosts();
    }
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const res = await fetch(`/post/posts?startIndex=${startIndex}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setUserPosts((prevPosts) => [...prevPosts, ...data.posts]);
        setShowMore(data.posts.length === 10);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/post/delete/${postId}/${currentUser._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUserPosts(userPosts.filter(post => post._id !== postId));
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (!currentUser.isAdmin && currentUser.role !== "writer") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HiOutlineDocumentText className={`mx-auto text-6xl mb-4 ${
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
            You need admin or writer privileges to manage posts.
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className={`rounded-3xl border p-8 backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
          : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-4xl font-black tracking-tight mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Content Studio
            </h1>
            <p className={`text-lg font-light ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your published content
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-mono ${
              theme === 'dark' 
                ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {totalPosts} Posts
            </div>
            <Link
              to="/create-post"
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <HiOutlinePlus className="text-lg" />
              New Post
            </Link>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {userPosts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            {userPosts.map((post) => (
              <div
                key={post._id}
                className={`rounded-3xl border backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50 hover:border-gray-600/50' 
                    : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50 hover:border-gray-300/50'
                }`}
              >
                <div className="flex items-start gap-6">
                  {/* Post Image */}
                  <div className="flex-shrink-0">
                    <Link to={`/post/${post.slug}`}>
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-32 h-20 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105"
                      />
                    </Link>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link 
                          to={`/post/${post.slug}`}
                          className={`text-xl font-bold hover:text-blue-600 transition-colors duration-300 line-clamp-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <HiOutlineCalendarDays className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {new Date(post.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HiOutlineTag className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              theme === 'dark' 
                                ? 'bg-gray-800 text-gray-300' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          to={`/post/${post.slug}`}
                          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                            theme === 'dark'
                              ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                          }`}
                          title="View Post"
                        >
                          <HiOutlineEye className="text-lg" />
                        </Link>
                        <Link
                          to={`/post/edit/${post._id}`}
                          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                            theme === 'dark'
                              ? 'bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600'
                          }`}
                          title="Edit Post"
                        >
                          <HiOutlinePencil className="text-lg" />
                        </Link>
                        <button
                          onClick={() => { setShowModal(true); setPostId(post._id); }}
                          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                            theme === 'dark'
                              ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                              : 'bg-red-100 hover:bg-red-200 text-red-600'
                          }`}
                          title="Delete Post"
                        >
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show More Button */}
          {showMore && (
            <div className="text-center">
              <button
                onClick={handleShowMore}
                className={`px-8 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                Load More Posts
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-3xl border backdrop-blur-sm p-12 text-center ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50' 
            : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50'
        }`}>
          <HiOutlineDocumentText className={`mx-auto text-6xl mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No Posts Yet
          </h3>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Start creating amazing content for your audience.
          </p>
          <Link
            to="/create-post"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <HiOutlinePlus className="text-lg" />
            Create Your First Post
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-3xl p-8 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
          }`}>
            <div className="text-center">
              <HiOutlineExclamationCircle className="text-red-500 text-6xl mx-auto mb-6" />
              <h3 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Delete Post?
              </h3>
              <p className={`text-sm mb-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                This action cannot be undone. The post will be permanently removed from your blog.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeletePost}
                  className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 py-3 px-6 font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 ${
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