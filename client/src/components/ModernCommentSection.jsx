import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiOutlineChatBubbleLeft,
  HiOutlineHeart,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiOutlinePaperAirplane,
  HiOutlineUser
} from 'react-icons/hi2';
import { debug } from '../utils/debug';

export default function ModernCommentSection({ postId }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const theme = useSelector((state) => state.theme.theme);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200) {
      return;
    }
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComment('');
        setCommentError(null);
        const newComment = {
          ...data,
          userId: {
            _id: currentUser._id,
            username: currentUser.username,
            photo: currentUser.photo
          }
        };
        setComments([newComment, ...comments]);
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/comment/getPostComments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          
          // Fetch user data for each comment
          const commentsWithUsers = await Promise.all(
            data.map(async (comment) => {
              try {
                const userRes = await fetch(`/user/${comment.userId}`);
                if (userRes.ok) {
                  const userData = await userRes.json();
                  return {
                    ...comment,
                    userId: userData
                  };
                }
                return comment;
              } catch (error) {
                debug.log('Error fetching user data:', error);
                return comment;
              }
            })
          );
          
          setComments(commentsWithUsers);
        }
      } catch (error) {
        debug.error(error.message);
      }
    };
    getComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/signin');
        return;
      }
      const res = await fetch(`/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : comment
          )
        );
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const handleEdit = async (commentId, editedContent) => {
    try {
      const res = await fetch(`/comment/editComment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });
      if (res.ok) {
        setComments(
          comments.map((c) =>
            c._id === commentId ? { ...c, content: editedContent } : c
          )
        );
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const handleDelete = async (commentId) => {
    setShowDeleteModal(false);
    try {
      if (!currentUser) {
        navigate('/signin');
        return;
      }
      const res = await fetch(`/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments(comments.filter((comment) => comment._id !== commentId));
      }
    } catch (error) {
      debug.error(error.message);
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <HiOutlineChatBubbleLeft className={`text-2xl ${
          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
        }`} />
        <h3 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Comments
        </h3>
        {comments.length > 0 && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            theme === 'dark' 
              ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {comments.length}
          </span>
        )}
      </div>

      {/* User Status */}
      {currentUser ? (
        null
      ) : (
        <div className={`p-6 rounded-2xl border text-center mb-6 ${
          theme === 'dark' 
            ? 'bg-gray-900/50 border-gray-700/50' 
            : 'bg-gray-50/50 border-gray-200/50'
        }`}>
          <HiOutlineUser className={`text-3xl mx-auto mb-3 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <p className={`mb-3 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Join the conversation
          </p>
          <Link
                          to="/signin"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Sign In to Comment
          </Link>
        </div>
      )}

      {/* Comment Form */}
      {currentUser && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className={`p-4 rounded-2xl border backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gray-900/50 border-gray-700/50' 
              : 'bg-white/50 border-gray-200/50'
          }`}>
            <textarea
              placeholder="Share your thoughts..."
              rows="4"
              maxLength="200"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`w-full p-4 rounded-xl border resize-none transition-all duration-300 focus:outline-none focus:ring-2 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            <div className="flex items-center justify-between mt-4">
              <span className={`text-sm ${
                comment.length > 180 
                  ? 'text-red-500' 
                  : theme === 'dark' 
                    ? 'text-gray-400' 
                    : 'text-gray-600'
              }`}>
                {200 - comment.length} characters remaining
              </span>
              <button
                type="submit"
                disabled={!comment.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <HiOutlinePaperAirplane className="text-lg" />
                <span>Post Comment</span>
              </button>
            </div>
            {commentError && (
              <div className={`mt-4 p-3 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-red-900/20 border-red-800/50 text-red-400' 
                  : 'bg-red-100 border-red-200 text-red-700'
              }`}>
                {commentError}
              </div>
            )}
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl border ${
          theme === 'dark' 
            ? 'bg-gray-900/30 border-gray-700/50' 
            : 'bg-gray-50/30 border-gray-200/50'
        }`}>
          <HiOutlineChatBubbleLeft className={`text-4xl mx-auto mb-4 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <p className={`text-lg font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No comments yet
          </p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((commentItem) => (
            <div
              key={commentItem._id}
              className={`p-6 rounded-2xl border backdrop-blur-sm ${
                theme === 'dark' 
                  ? 'bg-gray-900/50 border-gray-700/50' 
                  : 'bg-white/50 border-gray-200/50'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'
                }`}>
                  {commentItem.userId?.photo ? (
                    <img
                      src={commentItem.userId.photo}
                      alt={commentItem.userId?.username || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <HiOutlineUser className={`text-lg ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {commentItem.userId?.username || commentItem.username || 'Anonymous User'}
                    </h4>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(commentItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Comment Content */}
                  {editingComment === commentItem._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className={`w-full p-3 rounded-xl border resize-none transition-all duration-300 focus:outline-none focus:ring-2 ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        rows="3"
                        maxLength="200"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(commentItem._id, editContent)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            theme === 'dark' 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            theme === 'dark' 
                              ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {commentItem.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Comment Actions */}
              {editingComment !== commentItem._id && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleLike(commentItem._id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                      commentItem.likes?.includes(currentUser?._id)
                        ? theme === 'dark' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-600 text-white'
                        : theme === 'dark' 
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    <HiOutlineHeart className="text-lg" />
                    <span className="text-sm font-medium">
                      {commentItem.numberOfLikes || 0}
                    </span>
                  </button>

                  {currentUser && 
                    (currentUser._id === commentItem.userId?._id || currentUser.isAdmin) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(commentItem)}
                        className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                          theme === 'dark' 
                            ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        <HiOutlinePencil className="text-lg" />
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setCommentToDelete(commentItem._id);
                        }}
                        className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                          theme === 'dark' 
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <HiOutlineTrash className="text-lg" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 p-6 rounded-3xl border backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gray-900/95 border-gray-700/50' 
              : 'bg-white/95 border-gray-200/50'
          }`}>
            <div className="text-center">
              <HiOutlineExclamationTriangle className={`text-5xl mx-auto mb-4 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} />
              <h3 className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Delete Comment
              </h3>
              <p className={`mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleDelete(commentToDelete)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
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