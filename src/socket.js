import { Server } from "socket.io";
import Chat from "./models/Chat.js";
import User from "./models/User.js";
import Message from "./models/Message.js";

const users = {};       // socket.id → userId
const userSockets = {}; // userId → socket.id

const onlineUsers = new Map()

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // or specific origin
      //   methods: ['GET', 'POST'],
    },
  });

  initSocket(io);
};

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join user
    socket.on('user:join', async (userId) => {
      onlineUsers.set(userId, socket.id);
      // await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('user:online', userId);
    });


    // Send message with mention support
    socket.on('message:send', async ({ chatId, senderId, content, type }) => {
      // Parse mentions from content (e.g., @username)
      const mentionUsernames = (content.match(/@([a-zA-Z0-9_]+)/g) || []).map(m => m.slice(1));
      let mentions = [];
      if (mentionUsernames.length) {
        mentions = await User.find({ username: { $in: mentionUsernames } }, '_id');
        mentions = mentions.map(u => u._id);
      }

      // 1. Create the message
      const message = await Message.create({
        chat: chatId,
        sender: senderId,
        content,
        type,
        mention: mentions,
      });

      // 2. Update latest message in the chat
      await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

      // 3. Populate sender info for emission
      const populatedMessage = await Message.findById(message._id)
        .populate({
          path: 'sender',
          select: '_id name avatar',
        });

      // 4. Add isOnline manually from your tracking map
      const enrichedMessage = {
        ...populatedMessage.toObject(),
        sender: {
          ...populatedMessage.sender.toObject(),
          isOnline: onlineUsers.has(senderId),
        },
      };

      // 5. Notify all chat members
      const chat = await Chat.findById(chatId).populate('members');
      chat.members.forEach(member => {
        const socketId = onlineUsers.get(member._id.toString());
        if (socketId) {
          io.to(socketId).emit('message:receive', enrichedMessage);
        }
      });

      // 6. Notify mentioned users (if in chat)
      mentions.forEach(mentionedId => {
        if (chat.members.some(m => m._id.toString() === mentionedId.toString())) {
          const socketId = onlineUsers.get(mentionedId.toString());
          if (socketId) {
            io.to(socketId).emit('mention:notify', {
              chatId,
              messageId: message._id,
              from: senderId,
              content
            });
          }
        }
      });
    });


    // Typing indicator (per chat room)
    socket.on('typing:start', async ({ chatId, userId }) => {
      // Optionally track typing users in memory for performance
      await Chat.findByIdAndUpdate(chatId, { $addToSet: { typing: userId } });
      // Notify all members in the chat room except the sender
      const chat = await Chat.findById(chatId).populate('members');
      chat.members.forEach(member => {
        if (member._id.toString() !== userId) {
          const socketId = onlineUsers.get(member._id.toString());
          if (socketId) {
            io.to(socketId).emit('typing:start', { chatId, userId });
          }
        }
      });
    });

    socket.on('typing:stop', async ({ chatId, userId }) => {
      await Chat.findByIdAndUpdate(chatId, { $pull: { typing: userId } });
      const chat = await Chat.findById(chatId).populate('members');
      chat.members.forEach(member => {
        if (member._id.toString() !== userId) {
          const socketId = onlineUsers.get(member._id.toString());
          if (socketId) {
            io.to(socketId).emit('typing:stop', { chatId, userId });
          }
        }
      });
    });


    // Message status: delivered
    socket.on('message:delivered', async ({ messageId, chatId, userId }) => {
      const message = await Message.findByIdAndUpdate(messageId, { status: 'delivered' }, { new: true });
      // Broadcast to chat members
      const chat = await Chat.findById(chatId).populate('members');
      chat.members.forEach(member => {
        const socketId = onlineUsers.get(member._id.toString());
        if (socketId) {
          io.to(socketId).emit('message:status', {
            messageId,
            status: 'delivered',
            userId
          });
        }
      });
    });

    // Message status: read
    socket.on('message:read', async ({ messageId, chatId, userId }) => {
      const message = await Message.findByIdAndUpdate(messageId, { status: 'read' }, { new: true });
      // Broadcast to chat members
      const chat = await Chat.findById(chatId).populate('members');
      chat.members.forEach(member => {
        const socketId = onlineUsers.get(member._id.toString());
        if (socketId) {
          io.to(socketId).emit('message:status', {
            messageId,
            status: 'read',
            userId
          });
        }
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          // await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          onlineUsers.delete(userId);
          io.emit('user:offline', userId);
          break;
        }
      }
    });
  });
  io.on('error', (error) => console.log(error));
};
