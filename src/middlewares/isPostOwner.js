// Middleware to check if the current user is the owner of the post
import Post from '../models/Post.js';

const isPostOwner = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user?._id || req.user?.id;
    const post = await Post.findById(postId);
    if (!post) return res.sendError('Post not found', 404);
    if (post.userId.toString() !== userId.toString()) {
      return res.sendError('You are not authorized to modify this post', 403);
    }
    next();
  } catch (err) {
    console.error('isPostOwner middleware error:', err);
    res.sendError('Server error', 500);
  }
};

export default isPostOwner;
