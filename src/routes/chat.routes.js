import express from 'express';
import { getChatMessages, getChatUsers, sendMessage } from '../controllers/chat.controller.js';
const router = express.Router();

router.get('/users', getChatUsers);
router.get('/:userId', getChatMessages);
router.post('/:userId', sendMessage);

export default router;
