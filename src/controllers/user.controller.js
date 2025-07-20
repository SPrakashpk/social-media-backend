import User from "../models/User.js";

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
