import express from 'express';
import { followUser, getFollowers, getFollowing, getUserById, getUserProfileDetails, removeAvatar, unfollowUser, updateUser, uploadAvatar } from '../controllers/user.controller.js';
import { uploadProfilePic } from '../config/multer-s3.js';
import protect from '../middlewares/protect.js';
const router = express.Router();

router.get('/profile-details', getUserProfileDetails)
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.post('/:id/follow', followUser);
router.delete('/:id/unfollow', unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

router.put('/me/upload-avatar',  uploadProfilePic, uploadAvatar)
router.put('/me/remove-avatar',  removeAvatar)



export default router;
