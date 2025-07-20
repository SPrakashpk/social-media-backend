// middlewares/validateMedia.js
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
const allowedVideoTypes = [
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
  'video/x-matroska', 'video/x-ms-wmv', 'video/vc1',
  'video/mpeg', 'video/x-mpeg', 'video/x-mpeg2'
];
const maxFileSizeMB = 20;

export const validateMedia = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  for (const file of req.files) {
    const { mimetype, size, originalname } = file;

    const isImage = allowedImageTypes.includes(mimetype);
    const isVideo = allowedVideoTypes.includes(mimetype);

    if (!isImage && !isVideo) {
      return res.sendError(`Unsupported file type: ${originalname}`, 400);
    }

    if (size > maxFileSizeMB * 1024 * 1024) {
      return res.sendError(`${originalname} exceeds max size of ${maxFileSizeMB}MB`, 400);
    }
  }

  next();
};
