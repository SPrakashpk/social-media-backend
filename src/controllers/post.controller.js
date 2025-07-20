import { nanoid } from 'nanoid';
import User from '../models/User.js';
import Post from '../models/Post.js';
import postMediaUpload from '../config/multer-s3.js';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const createPostWithMedia = async (req, res) => {
    try {
        const { userId, text } = req.body;

        // Validate user
        const user = await User.findById(userId);
        if (!user) return res.sendError('User not found');

        // Create post
        const newPost = new Post({
            userId,
            text: text || '',
            media: []
        });

        if (req.files && req.files.length > 0) {
            newPost.media = req.files.map(file => ({
                url: file.location,
                key: file.key,
                type: file.mimetype.startsWith('image/') ? 'image' : 'video'
            }));
        }

        await newPost.save();

        res.sendSuccess('Post created with media', {
            postId: newPost._id,
            media: newPost.media
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.sendError('Something went wrong');
    }
};
export const getAllPosts = (req, res) => {
    // Implement get all posts logic
    res.send('All posts');
};

export const getFeedPosts = (req, res) => {
    // Implement get feed posts logic
    res.send('Feed posts');
};

export const getExplorePosts = (req, res) => {
    // Implement get explore posts logic
    res.send('Explore posts');
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate({
        path: 'userId',
        select: '_id username name avatar'
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: '_id username name avatar'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!post) return res.sendError('Post not found');

    const postObj = post.toObject();

    // Generate pre-signed URLs for media
    if (postObj.media?.length > 0) {
      const signedMedia = await Promise.all(
        postObj.media.map(async (mediaItem) => {
          try {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: mediaItem.key
            });

            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 }); // 1 hour

            return {
              ...mediaItem,
              signedUrl
            };
          } catch (err) {
            console.error(`Failed to generate signed URL for key: ${mediaItem.key}`, err);
            return mediaItem; // return original media if URL signing fails
          }
        })
      );

      postObj.media = signedMedia;
    }

    res.sendSuccess(postObj, 'Post fetched successfully');
  } catch (error) {
    console.error('Get post error:', error);
    res.sendError('Something went wrong');
  }
};

export const deletePost = (req, res) => {
    // Implement delete post logic
    res.send('Post deleted');
};

export const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id; // taken from JWT middleware

        // 1. Check if post exists
        const post = await Post.findById(postId);
        if (!post) return res.sendError('Post not found', 400);

        // 2. Toggle like
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.sendSuccess(`Post ${alreadyLiked ? 'unliked' : 'liked'} successfully`, {
            likesCount: post.likes.length,
            likedByUser: !alreadyLiked
        });

    } catch (error) {
        console.error('Like post error:', error);
        res.sendError('Something went wrong');
    }
};

export const unlikePost = (req, res) => {
    // Implement unlike post logic
    res.send('Post unliked');
};
