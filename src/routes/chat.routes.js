import express from 'express';
import { createPrivateChat, getChatList, getChatMessages, getChatUsers, sendMessage } from '../controllers/chat.controller.js';
import { createGroup, getGroupMessages, listGroups } from '../controllers/group.controller.js';
const router = express.Router();

router.get('/users', getChatUsers);
router.post('/createPrivateChat', createPrivateChat);
router.get('/getChatList', getChatList);
router.get('/getChatMessages',getChatMessages);
router.post('/createGroup', createGroup);
router.get('/getGroupList', listGroups);
router.get('/getGroupMessages',getGroupMessages);

export default router;
