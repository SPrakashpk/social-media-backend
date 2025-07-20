import express from 'express';
import { addComment, deleteComment, getCommentsByPost } from '../controllers/comment.controller.js';
import { validate } from '../middlewares/validate.js';
import { commentValidationSchema } from '../validation/post.schema.js';
const router = express.Router();

router.post('/addComment',validate(commentValidationSchema), addComment);
router.get('/posts/:id/comments', getCommentsByPost);
// router.delete('/:commentId', deleteComment);

export default router;
