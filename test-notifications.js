import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './api/models/notification.model.js';
import User from './api/models/user.model.js';
import Post from './api/models/post.model.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    createTestNotifications();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

async function createTestNotifications() {
  try {
    // Get some users and posts to create test notifications
    const users = await User.find().limit(2);
    const posts = await Post.find().limit(2);

    if (users.length < 2 || posts.length < 1) {
      console.log('Need at least 2 users and 1 post to create test notifications');
      process.exit(0);
    }

    const [user1, user2] = users;
    const [post1] = posts;

    // Create test notifications
    const testNotifications = [
      {
        recipientId: user1._id,
        senderId: user2._id,
        type: 'new_comment',
        postId: post1._id,
        message: `${user2.username} commented on your post "${post1.title}"`,
        read: false
      },
      {
        recipientId: user1._id,
        senderId: user2._id,
        type: 'like_post',
        postId: post1._id,
        message: `${user2.username} liked your post "${post1.title}"`,
        read: false
      }
    ];

    // Delete existing test notifications to avoid duplicates
    await Notification.deleteMany({
      recipientId: user1._id,
      senderId: user2._id
    });

    // Insert new test notifications
    await Notification.insertMany(testNotifications);

    console.log(`Created ${testNotifications.length} test notifications for user: ${user1.username}`);
    console.log('Test notifications created successfully!');
    
    // Display created notifications
    const createdNotifications = await Notification.find({ recipientId: user1._id })
      .populate('senderId', 'username')
      .populate('postId', 'title')
      .sort({ createdAt: -1 });

    console.log('\nCreated notifications:');
    createdNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.message} (${notif.read ? 'Read' : 'Unread'})`);
    });

  } catch (error) {
    console.error('Error creating test notifications:', error);
  } finally {
    mongoose.connection.close();
  }
} 