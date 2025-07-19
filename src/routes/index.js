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






// S3 download test route
import s3 from '../utils/s3.js';

router.get('/s3-test-download', async (req, res) => {
  const bucket = req.query.bucket || process.env.AWS_S3_BUCKET;
  const key = req.query.key || 'test.txt'; // Change default key as needed
  if (!bucket || !key) {
    return res.status(400).json({ error: 'Missing bucket or key parameter' });
  }
  try {
    const params = { Bucket: bucket, Key: key };
    const data = await s3.getObject(params).promise();
    res.set('Content-Type', data.ContentType || 'application/octet-stream');
    res.send(data.Body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
