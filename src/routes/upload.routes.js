import express from 'express';
import multer from 'multer';
import { uploadImage, uploadVideo } from '../controllers/upload.controller.js';
const router = express.Router();

const upload = multer({ dest: 'tmp/' }); // Configure as needed

router.post('/image', upload.single('file'), uploadImage);
router.post('/video', upload.single('file'), uploadVideo);

export default router;
