import express from 'express';
import { addComment, deleteComment, getCommentsByPost } from '../controllers/comment.controller.js';
const router = express.Router();

router.post('/posts/:id/comments', addComment);
router.get('/posts/:id/comments', getCommentsByPost);
router.delete('/:commentId', deleteComment);

export default router;
