import express from 'express';

const router = express.Router();

// Example: router.use('/users', userRoutes);
// Add your feature routes here

// Basic test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
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
