import express from 'express';
import { followUser, getFollowers, getFollowing, getUserById, unfollowUser, updateUser } from '../controllers/user.controller.js';
const router = express.Router();

router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.post('/:id/follow', followUser);
router.delete('/:id/unfollow', unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router;
