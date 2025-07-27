import User from "../models/User.js";

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';
import Post from '../models/Post.js';

// User Controller
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user without password
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.sendError('User not found', 404);
    }

    res.sendSuccess(user, 'User fetched successfully');
  } catch (error) {
    console.error('Error fetching user:', error);
    res.sendError('Server error', 500);
  }
};

export const updateUser = (req, res) => {
  // Implement update user logic
  res.send('User updated');
};

export const followUser = (req, res) => {
  // Implement follow user logic
  res.send('User followed');
};

export const unfollowUser = (req, res) => {
  // Implement unfollow user logic
  res.send('User unfollowed');
};

export const getFollowers = (req, res) => {
  // Implement get followers logic
  res.send('Followers list');
};

export const getFollowing = (req, res) => {
  // Implement get following logic
  res.send('Following list');
};



export const getUserProfileDetails = async (req, res) => {
  try {
    const userId = req.query.id;

    const user = await User.findById(userId)
      .select('_id username name bio avatar followers following');

    if (!user) return res.sendError('User not found', 404);

    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select('_id text likes comments media createdAt');

    const postsWithMedia = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();

        if (postObj.media?.length > 0) {
          postObj.media = await Promise.all(
            postObj.media.map(async (mediaItem) => {
              try {
                const command = new GetObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET,
                  Key: mediaItem.key,
                });
                const signedUrl = await getSignedUrl(s3Client, command, {
                  expiresIn: 60 * 60,
                });

                return {
                  ...mediaItem,
                  signedUrl,
                };
              } catch (err) {
                console.error('S3 signed URL error:', err);
                return mediaItem;
              }
            })
          );
        }

        return postObj;
      })
    );

    res.sendSuccess({
      _id: user._id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      profilePic: user.profilePic,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postCount: posts.length,
      posts: postsWithMedia,
    }, 'User profile fetched successfully');

  } catch (error) {
    console.error('Get user profile error:', error);
    res.sendError('Something went wrong');
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.key) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Remove old avatar if exists and is not default
    if (user.profilePic && !user.profilePic.includes('pixabay.com')) {
      const oldKey = user.profilePic.split('.amazonaws.com/')[1];
      if (oldKey) {
        await s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: oldKey }).promise();
      }
    }

    const avatarUrl = req.file.location;
    user.profilePic = avatarUrl;
    await user.save();

    res.status(200).json({ success: true, message: 'Avatar updated', avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.profilePic) {
      return res.status(404).json({ success: false, message: 'No avatar to remove' });
    }

    if (!user.profilePic.includes('pixabay.com')) {
      const key = user.profilePic.split('.amazonaws.com/')[1];
      if (key) {
        await s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key }).promise();
      }
    }

    user.profilePic = '';
    await user.save();
    res.status(200).json({ success: true, message: 'Avatar removed' });
  } catch (err) {
    console.error('Error removing avatar:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


