import express from 'express';
import { createPrivateChat, getChatList, getChatMessages, getChatUsers, sendMessage } from '../controllers/chat.controller.js';
const router = express.Router();

router.get('/users', getChatUsers);
router.post('/createPrivateChat', createPrivateChat);
router.get('/getChatList', getChatList);
router.get('/getChatMessages',getChatMessages)

export default router;
