import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import { errorHandler } from '../utils/error.js';

// Get user's notifications with pagination
export const getNotifications = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortDirection = -1; // Always show newest first

    const notifications = await Notification.find({ recipientId: req.user.id })
      .populate('senderId', 'username photo')
      .populate('postId', 'title slug')
      .populate('commentId', 'content')
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({ recipientId: req.user.id });
    const unreadCount = await Notification.countDocuments({ recipientId: req.user.id, read: false });

    res.status(200).json({
      notifications,
      totalNotifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// Mark specific notification as read
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(errorHandler(404, 'Notification not found'));
    }

    if (notification.recipientId.toString() !== req.user.id) {
      return next(errorHandler(403, 'You are not allowed to modify this notification'));
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    res.status(200).json(updatedNotification);
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read for the user
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Helper function to create a notification (used by other controllers)
export const createNotification = async (recipientId, senderId, type, postId, commentId = null, customMessage = null) => {
  try {
    // Don't create notification if user is notifying themselves
    if (recipientId.toString() === senderId.toString()) {
      return null;
    }

    // Get sender and post info for generating message
    const sender = await User.findById(senderId).select('username');
    const post = await Post.findById(postId).select('title');
    
    let message = customMessage;
    if (!message) {
      switch (type) {
        case 'new_comment':
          message = `${sender.username} commented on your post "${post.title}"`;
          break;
        case 'like_post':
          message = `${sender.username} liked your post "${post.title}"`;
          break;
        case 'like_comment':
          message = `${sender.username} liked your comment`;
          break;
        case 'mention':
          message = `${sender.username} mentioned you in a post`;
          break;
        default:
          message = `${sender.username} interacted with your content`;
      }
    }

    const notification = new Notification({
      recipientId,
      senderId,
      type,
      postId,
      commentId,
      message,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({ 
      recipientId: req.user.id, 
      read: false 
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(errorHandler(404, 'Notification not found'));
    }

    if (notification.recipientId.toString() !== req.user.id) {
      return next(
        errorHandler(403, 'You are not allowed to delete this notification')
      );
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Notification has been deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipientId: req.user.id });
    res.status(200).json({ message: 'All notifications have been deleted successfully.' });
  } catch (error) {
    next(error);
  }
}; 