import Chat from "../models/Chat.js";
import Message from '../models/Message.js';


// Chat Controller
export const getChatUsers = (req, res) => {
  // Implement get chat users logic
  res.send('Chat users');
};


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


export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId) {
      return res.sendError('Missing sender or receiver ID', 400);
    }

    // 1. Check if chat exists between sender and receiver
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
      isGroupChat: false
    });

    // 2. If chat doesn't exist, create it
    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
        isGroupChat: false
      });
    }

    // 3. If message text exists, save message
    if (message && message.trim() !== '') {
      await Message.create({
        chatId: chat._id,
        senderId,
        text: message
      });
    }

    res.sendSuccess({ chatId: chat._id }, 'Message sent or chat created');
  } catch (err) {
    console.error('Send message error:', err);
    res.sendError('Internal Server Error', 500, err);
  }
};

export const createPrivateChat = async (req, res) => {
  const { userId, targetUserId } = req.body;

  if (!userId || !targetUserId) return res.sendError('userid required', 400);

  let chat = await Chat.findOne({
    isGroup: false,
    members: { $all: [userId, targetUserId], $size: 2 }
  });

  if (!chat) {
    chat = await Chat.create({
      isGroup: false,
      members: [userId, targetUserId]
    });
  } else {
    chat.updatedAt = new Date();
    await chat.save();
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
          model: 'User', 
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


