import express from 'express';
import {
    createPostWithMedia,
    deletePost,
    getAllPosts,
    getExplorePosts,
    getFeedPosts,
    getPostById,
    likePost,
    unlikePost,
    updatePost,
} from '../controllers/post.controller.js';

import isPostOwner from '../middlewares/isPostOwner.js';


import { uploadPostMedia } from '../config/multer-s3.js';



const router = express.Router(); 

router.post('/create', uploadPostMedia, createPostWithMedia);
router.get('/', getAllPosts);
router.get('/feed', getFeedPosts);
router.get('/explore', getExplorePosts);
router.get('/:id', getPostById);
router.put('/:id', isPostOwner, updatePost); // ✅ moved here
router.delete('/:id', isPostOwner, deletePost);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);

export default router;
