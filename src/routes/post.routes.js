import express from 'express';
import { createPostWithMedia, deletePost, getAllPosts, getExplorePosts, getFeedPosts, getPostById, likePost, unlikePost } from '../controllers/post.controller.js';
import { validate } from '../middlewares/validate.js';
import { postValidationSchema } from '../validation/post.schema.js';

import multer from 'multer';
import postMediaUpload from '../config/multer-s3.js';

const upload = multer({ dest: 'uploads/' })

const router = express.Router();

router.post('/create',postMediaUpload, createPostWithMedia);
router.get('/', getAllPosts);
router.get('/feed', getFeedPosts);
router.get('/explore', getExplorePosts);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);
router.post('/like-post/:id', likePost);
router.delete('/:id/like', unlikePost);

export default router;
