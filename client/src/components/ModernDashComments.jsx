import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  HiOutlineExclamationCircle, 
  HiOutlineTrash,
  HiOutlineChatBubbleLeftRight,
  HiOutlineHeart,
  HiOutlineCalendarDays,
  HiOutlineUser,
  HiOutlineDocumentText
} from 'react-icons/hi2';
import { debug } from '../utils/debug';

export default function ModernDashComments() {
  const theme = useSelector((state) => state.theme.theme);
  const currentUser = useSelector((state) => state.user.currentUser);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        if (currentUser.isAdmin) {
          const res = await fetch('/api/comment/getComments');
          const data = await res.json();
          if (res.ok) {
            setComments(data.comments);
            setTotalComments(data.totalComments || data.comments.length);
            if (data.comments.length < 9) {
              setShowMore(false);
            }
          }
        } else if (currentUser.role === 'writer') {
          const postsRes = await fetch(`/post/posts?author=${currentUser._id}`);
          const postData = await postsRes.json();
          if (postsRes.ok) {
            const commentsPromises = postData.posts.map((post) =>
              fetch(`/comment/getPostComments/${post._id}`).then((res) => res.json())
            );
            const commentsData = await Promise.all(commentsPromises);
            const allComments = commentsData.flatMap((data) => data);
            setComments(allComments);
            setTotalComments(allComments.length);
            if (allComments.length < 9) {
              setShowMore(false);
            }
          }
        }
      } catch (error) {
        debug.error(error.message);
      }
      setLoading(false);
    };

    if (currentUser.isAdmin || currentUser.role === 'writer') {
      fetchComments();
    }
  }, [currentUser.isAdmin, currentUser.role, currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = comments.length;
    try {
      const res = await fetch(
        `/comment/getComments?startIndex=${startIndex}`
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, ...data.comments]);
        if (data.comments.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/comment/deleteComment/${commentIdToDelete}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentIdToDelete)
        );
        setShowModal(false);
      } else {
        debug.error(data.message);
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  if (!currentUser.isAdmin && currentUser.role !== "writer") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HiOutlineChatBubbleLeftRight className={`mx-auto text-6xl mb-4 ${
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
            You need admin or writer privileges to manage comments.
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
              Comment Center
            </h1>
            <p className={`text-lg font-light ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Moderate community discussions
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-mono ${
            theme === 'dark' 
              ? 'bg-gray-800 text-gray-300 border border-gray-700' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {totalComments} Comments
          </div>
        </div>
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-6">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className={`rounded-3xl border backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.01] ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-700/50 hover:border-gray-600/50' 
                    : 'bg-gradient-to-br from-white/90 to-gray-50/80 border-gray-200/50 hover:border-gray-300/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Comment Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <HiOutlineCalendarDays className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(comment.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineHeart className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          theme === 'dark' 
                            ? 'bg-gray-800 text-gray-300' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {comment.numberOfLikes} likes
                        </span>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className={`p-4 rounded-2xl mb-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border border-gray-700/50' 
                        : 'bg-gray-50/50 border border-gray-200/50'
                    }`}>
                      <p className={`text-base leading-relaxed ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {comment.content}
                      </p>
                    </div>

                    {/* Comment Meta */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <HiOutlineUser className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          User ID: {comment.userId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineDocumentText className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Post ID: {comment.postId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="ml-6">
                    <button
                      onClick={() => {
                        setShowModal(true);
                        setCommentIdToDelete(comment._id);
                      }}
                      className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 ${
                        theme === 'dark'
                          ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                          : 'bg-red-100 hover:bg-red-200 text-red-600'
                      }`}
                      title="Delete Comment"
                    >
                      <HiOutlineTrash className="text-lg" />
                    </button>
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
                Load More Comments
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
          <HiOutlineChatBubbleLeftRight className={`mx-auto text-6xl mb-4 ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No Comments Yet
          </h3>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Comments from your posts will appear here for moderation.
          </p>
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
                Delete Comment?
              </h3>
              <p className={`text-sm mb-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                This action cannot be undone. The comment will be permanently removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteComment(commentIdToDelete)}
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