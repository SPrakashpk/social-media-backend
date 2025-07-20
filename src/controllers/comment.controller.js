import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

// Comment Controller
export const addComment = async (req, res) => {
    try {
        const { postId, userId, text } = req.body;



        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.sendError('Post not found', 404);
        }

        // Create comment
        const newComment = new Comment({
            postId,
            userId,
            text,
        });

        await newComment.save();

        // Add comment to post.comments array
        post.comments.push(newComment._id);
        await post.save();

        return res.sendSuccess({
            comment: newComment,
        }, 'Comment added successfully');

    } catch (error) {
        console.error('Add comment error:', error);
        return res.sendError('Something went wrong', 505);

    }
};
export const getCommentsByPost = (req, res) => {
    // Implement get comments by post logic
    res.send('Comments for post');
};

export const deleteComment = (req, res) => {
    // Implement delete comment logic
    res.send('Comment deleted');
};
