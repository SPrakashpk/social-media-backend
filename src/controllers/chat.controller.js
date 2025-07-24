import Chat from "../models/Chat.js";

// Chat Controller
export const getChatUsers = (req, res) => {
  // Implement get chat users logic
  res.send('Chat users');
};

import Message from '../models/Message.js';

export const getChatMessages = async (req, res) => {
  const { chatId } = req.query;

  if (!chatId) return res.sendError('Chat ID is required', 400);

  try {
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 }) // oldest to newest
      .populate({
        path: 'sender',
        model: 'User',
        select: 'name avatar isOnline'
      });

    res.sendSuccess(messages);
  } catch (err) {
    console.error(err);
    res.sendError('Failed to fetch messages', 500);
  }
};


export const sendMessage = (req, res) => {
  // Implement send message logic
  res.send('Message sent');
};

export const createPrivateChat = async (req, res) => {
  const { userId1, userId2 } = req.body;
 
  if (!userId1 || !userId2) return res.sendError('userid required', 400);
 
  let chat = await Chat.findOne({
    isGroup: false,
    members: { $all: [userId1, userId2], $size: 2 }
  });
 
  if (!chat) {
    chat = await Chat.create({
      isGroup: false,
      members: [userId1, userId2]
    });
  }
 
  res.sendSuccess(chat, 'chat created successfully');
  
};

export const getChatList = async (req, res) => {
  const userId = req.query.userId;

  try {
    const chats = await Chat.find({ members: userId })
      .populate('members', 'name avatar isOnline')
      .populate('admins', '_id')
      .populate({
        path: 'latestMessage',
        populate: {
          path: 'sender',
          model: 'User', // ✅ required when _id is string
          select: 'name avatar isOnline'
        }
      })
      .sort({ updatedAt: -1 })
      .lean();

    res.sendSuccess(chats);
  } catch (err) {
    console.error('Get chat list error:', err);
    res.sendError('Get chat list failed', 500);
  }
};


