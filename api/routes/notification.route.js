import express from 'express';
import { verifyUser } from '../utils/verifyUser.js';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  getUnreadCount,
  deleteNotification,
  deleteAllNotifications,
} from '../controllers/notification.controller.js';

const router = express.Router();

// GET /notifications - Fetch user's notifications with pagination
router.get('/', verifyUser, getNotifications);

// PUT /notifications/:id/read - Mark specific notification as read
router.put('/:id/read', verifyUser, markNotificationRead);

// PUT /notifications/read-all - Mark all notifications as read
router.put('/read-all', verifyUser, markAllNotificationsRead);

// GET /notifications/unread-count - Get unread notification count
router.get('/unread-count', verifyUser, getUnreadCount);

// DELETE /notifications/delete-all - Delete all notifications for a user
router.delete('/delete-all', verifyUser, deleteAllNotifications);

// DELETE /notifications/:id - Delete specific notification
router.delete('/:id', verifyUser, deleteNotification);

export default router; 