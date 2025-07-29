import express from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import postRoutes from './post.routes.js';
import commentRoutes from './comment.routes.js';
import chatRoutes from './chat.routes.js';
import groupRoutes from './group.routes.js';
import notificationRoutes from './notification.routes.js';
import uploadRoutes from './upload.routes.js';

const router = express.Router();

// Auth
router.use('/auth', authRoutes);

// Users (profile, follow system)
router.use('/users', userRoutes);

// Posts (feed, like, explore)
router.use('/posts', postRoutes);

// Comments
router.use('/comments', commentRoutes);

// 1-to-1 Chat
router.use('/chat', chatRoutes);

// Group Chat
router.use('/groups', groupRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

// Uploads (image/video)
router.use('/upload', uploadRoutes);

// Health check
router.get('/health', (req, res) => {
  res.sendSuccess('App is running!');
});










export default router;
