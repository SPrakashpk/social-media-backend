import dotenv from 'dotenv';
dotenv.config();
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
  'video/x-matroska', 'video/x-ms-wmv', 'video/vc1',
  'video/mpeg', 'video/x-mpeg', 'video/x-mpeg2'
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

// const s3Client = new S3Client({
//       region: process.env.AWS_S3_BUCKET,
//       credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//       },
//       bucketEndpoint:false
//     });
const s3Client = new S3Client();

const upload  = multer({
  storage: multerS3({
    s3:s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const filename = `posts/${Date.now()}_${file.originalname}`;
      cb(null, filename);
    },
  }),
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});

const postMediaUpload = upload.array('media', 5); // max 5 files

export default postMediaUpload;
