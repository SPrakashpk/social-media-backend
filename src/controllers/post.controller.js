// Update post (only owner)
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    // Ownership is enforced by isPostOwner middleware
    const updated = await Post.findByIdAndUpdate(
      postId,
      { $set: { text } },
      { new: true }
    );
    if (!updated) return res.sendError('Post not found', 404);
    res.sendSuccess(updated, 'Post updated successfully');
  } catch (err) {
    console.error('Update post error:', err);
    res.sendError('Server error', 500);
  }
};
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Post from '../models/Post.js';
import User from '../models/User.js';


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
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '_id username name avatar'
      })
      // Optional: Populate only if you want comment details
      // .populate({
      //   path: 'comments',
      //   populate: {
      //     path: 'userId',
      //     select: '_id username name avatar'
      //   },
      //   options: { sort: { createdAt: -1 } }
      // })

    const postsWithSignedMedia = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject()

        if (postObj.media?.length > 0) {
          const signedMedia = await Promise.all(
            postObj.media.map(async (mediaItem) => {
              try {
                const command = new GetObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET,
                  Key: mediaItem.key
                })

                const signedUrl = await getSignedUrl(s3Client, command, {
                  expiresIn: 60 * 60 // 1 hour
                })

                return {
                  ...mediaItem,
                  signedUrl
                }
              } catch (err) {
                console.error(`Failed to sign media: ${mediaItem.key}`, err)
                return mediaItem // fallback to original
              }
            })
          )

          postObj.media = signedMedia
        }

        return postObj
      })
    )

    res.sendSuccess(postsWithSignedMedia, 'Posts fetched successfully')
  } catch (error) {
    console.error('Get all posts error:', error)
    res.sendError('Something went wrong')
  }
}


export const getFeedPosts = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.query.id;
    const currentUser = await User.findById(currentUserId).select('following');
    const followingIds = currentUser.following;

    // Include current user's own posts as well
    const userIdsToFetch = [...followingIds.map(id => id.toString()), currentUserId.toString()];

    const posts = await Post.find({ userId: { $in: userIdsToFetch } })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '_id name avatar',
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: '_id name avatar',
        },
        options: { sort: { createdAt: -1 } },
      });

    const postsWithSignedMedia = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();

        if (postObj.media?.length > 0) {
          const signedMedia = await Promise.all(
            postObj.media.map(async (mediaItem) => {
              try {
                const command = new GetObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET,
                  Key: mediaItem.key,
                });
                const signedUrl = await getSignedUrl(s3Client, command, {
                  expiresIn: 3600,
                });
                return {
                  _id: mediaItem._id,
                  key: mediaItem.key,
                  type: mediaItem.type,
                  url: mediaItem.url,
                  signedUrl,
                };
              } catch (err) {
                console.error(`Failed to sign media key: ${mediaItem.key}`, err);
                return mediaItem;
              }
            })
          );
          postObj.media = signedMedia;
        }

        return postObj;
      })
    );

    res.sendSuccess(postsWithSignedMedia, 'Feed posts fetched');
  } catch (err) {
    console.error('getFeedPosts error:', err);
    res.sendError('Something went wrong fetching feed');
  }
};



export const getExplorePosts = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.query.id;
    const currentUser = await User.findById(currentUserId).select('following');
    const followingIds = currentUser.following;

    const posts = await Post.find({
      userId: { $nin: [...followingIds, currentUserId] },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: '_id name avatar',
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: '_id name avatar',
        },
        options: { sort: { createdAt: -1 } },
      });

    const postsWithSignedMedia = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();

        if (postObj.media?.length > 0) {
          const signedMedia = await Promise.all(
            postObj.media.map(async (mediaItem) => {
              try {
                const command = new GetObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET,
                  Key: mediaItem.key,
                });
                const signedUrl = await getSignedUrl(s3Client, command, {
                  expiresIn: 3600,
                });
                return {
                  _id: mediaItem._id,
                  key: mediaItem.key,
                  type: mediaItem.type,
                  url: mediaItem.url,
                  signedUrl,
                };
              } catch (err) {
                console.error(`Failed to sign media key: ${mediaItem.key}`, err);
                return mediaItem;
              }
            })
          );
          postObj.media = signedMedia;
        }

        return postObj;
      })
    );

    res.sendSuccess(postsWithSignedMedia, 'Explore posts fetched');
  } catch (err) {
    console.error('getExplorePosts error:', err);
    res.sendError('Something went wrong fetching explore');
  }
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
    /*
      Ownership is enforced by isPostOwner middleware
    */
    const postId = req.params.id;
    Post.findByIdAndDelete(postId)
      .then((deleted) => {
        if (!deleted) return res.sendError('Post not found', 404);
        res.sendSuccess(null, 'Post deleted successfully');
      })
      .catch((err) => {
        console.error('Delete post error:', err);
        res.sendError('Server error', 500);
      });
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
