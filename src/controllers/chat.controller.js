import Chat from "../models/Chat.js";

// Chat Controller
export const getChatUsers = (req, res) => {
  // Implement get chat users logic
  res.send('Chat users');
};

export const getChatMessages = (req, res) => {
  // Implement get chat messages logic
  res.send('Chat messages');
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
      .populate('members', 'name avatar isOnline') // for 1-to-1 display
      .populate('admins', '_id')
      .populate({
        path: 'latestMessage',
        populate: { path: 'sender', select: 'name avatar' }
      })
      .sort({ updatedAt: -1 });
    res.sendSuccess(chats)
  } catch (err) {
    res.sendError('get list failed',500);
  }
};
