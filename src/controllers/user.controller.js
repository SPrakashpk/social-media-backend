// Get recommended users (for explore page)
export const getRecommendedUsers = async (req, res) => {
  try {
    // Optionally exclude current user and users already followed
    const currentUserId = req.user?.id || req.query.currentUserId;
    let excludeIds = [];
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId).select('following');
      excludeIds = [currentUserId, ...(currentUser?.following || [])];
    }
    const users = await User.find(excludeIds.length ? { _id: { $nin: excludeIds } } : {})
      .select('_id username name avatar');
    res.sendSuccess(users, 'Recommended users fetched');
  } catch (err) {
    console.error('Get recommended users error:', err);
    res.sendError('Server error', 500);
  }
};
import User from "../models/User.js";

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../utils/s3Client.js';
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

export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user?.id || req.query.currentUserId; // Use safe fallback

    if (!targetUserId || !currentUserId) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!targetUser.followers.includes(currentUserId)) {
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);

      await targetUser.save();
      await currentUser.save();
    }

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('🔴 Follow error:', error); // full error object
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};


export const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.userId || req.user?._id?.toString();
    const targetUserId = req.params.id;

    if (!currentUserId) {
      return res.sendError("Unauthorized - No user ID in request", 401);
    }

    if (currentUserId === targetUserId) {
      return res.sendError("You can't unfollow yourself", 400);
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.sendError("One or both users not found", 404);
    }

    currentUser.following.pull(targetUser._id);
    targetUser.followers.pull(currentUser._id);

    await currentUser.save();
    await targetUser.save();

    return res.sendSuccess({}, "Unfollowed successfully");
  } catch (err) {
    console.error("Unfollow error:", err);
    res.sendError("Server error");
  }
};




export const getFollowers = (req, res) => {
  // req.params.id: user whose followers to fetch
  User.findById(req.params.id)
    .populate('followers', '_id name username avatar')
    .select('followers')
    .then(user => {
      if (!user) return res.sendError('User not found', 404);
      res.sendSuccess(user.followers, 'Followers fetched');
    })
    .catch(err => {
      console.error(err);
      res.sendError('Server error', 500);
    });
};

export const getFollowing = (req, res) => {
  // req.params.id: user whose following to fetch
  User.findById(req.params.id)
    .populate('following', '_id name username avatar')
    .select('following')
    .then(user => {
      if (!user) return res.sendError('User not found', 404);
      res.sendSuccess(user.following, 'Following fetched');
    })
    .catch(err => {
      console.error(err);
      res.sendError('Server error', 500);
    });
};



export const getUserProfileDetails = async (req, res) => {
  try {
    const userId = req.query.id;
    const currentUserId = req.user?.id || req.query.currentUserId;

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

    // Check if current user is following this user
    let isCurrentUserFollowing = false;
    if (currentUserId && user.followers && Array.isArray(user.followers)) {
      isCurrentUserFollowing = user.followers.map(f => f.toString()).includes(currentUserId.toString());
    }

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
      isCurrentUserFollowing,
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

    const user = await User.findById(req.user.id || req.body.userId);
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


