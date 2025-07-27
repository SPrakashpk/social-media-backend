import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

// Allowed mimetypes
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
const allowedVideoTypes = [
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
  'video/x-matroska', 'video/x-ms-wmv', 'video/vc1', 'video/mpeg',
  'video/x-mpeg', 'video/x-mpeg2'
];
const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

// Validate MIME type
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// S3 client
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   // region: process.env.AWS_S3_BUCKET,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
//   bucketEndpoint: false,


// });
// S3 client
const s3Client = new S3Client({
  endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`, // ✅ Correct
  forcePathStyle: false,
});

// Multer storage
const storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    let prefix = 'others/';
    if (req.baseUrl.includes('/posts')) {
      prefix = 'posts/';
    } else if (req.baseUrl.includes('/users') && req.url.includes('upload-avatar')) {
      prefix = 'avatars/';
    }
    const filename = `${prefix}${Date.now()}_${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// Exported middlewares

export const uploadPostMedia = upload.array('media', 5); // max 5 media files
export const uploadProfilePic = upload.single('profilePic'); // single image for avatar
