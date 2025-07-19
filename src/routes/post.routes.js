import express from 'express';
import { createPost, deletePost, getAllPosts, getExplorePosts, getFeedPosts, getPostById, likePost, unlikePost } from '../controllers/post.controller.js';
const router = express.Router();

router.post('/', createPost);
router.get('/', getAllPosts);
router.get('/feed', getFeedPosts);
router.get('/explore', getExplorePosts);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);

export default router;
