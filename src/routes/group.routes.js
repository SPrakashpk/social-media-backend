import express from 'express';

import {
  createGroup,
  listGroups,
  getGroupMessages,
  sendGroupMessage,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
  leaveGroup
} from '../controllers/group.controller.js';

const router = express.Router();

router.post('/', createGroup);
router.get('/', listGroups);
router.get('/:groupId', getGroupMessages);
router.post('/:groupId/message', sendGroupMessage);
router.post('/:groupId/members', addGroupMember);
router.delete('/:groupId/members/:id', removeGroupMember);
router.post('/:groupId/role', updateMemberRole);
router.post('/:groupId/leave', leaveGroup);

export default router;
