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

    // Send message
    socket.on('message:send', async ({ chatId, senderId, content, type, mentions }) => {
      const message = await Message.create({ chat: chatId, sender: senderId, content, type, mention: mentions });

      await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

      const chat = await Chat.findById(chatId).populate('members');
      chat.members.forEach(member => {
        const socketId = onlineUsers.get(member._id.toString());
        if (socketId) {
          io.to(socketId).emit('message:receive', message);
        }
      });
    });

    // Typing
    socket.on('typing:start', async ({ chatId, userId }) => {
      await Chat.findByIdAndUpdate(chatId, { $addToSet: { typing: userId } });
      io.emit('typing:update', { chatId });
    });

    socket.on('typing:stop', async ({ chatId, userId }) => {
      await Chat.findByIdAndUpdate(chatId, { $pull: { typing: userId } });
      io.emit('typing:update', { chatId });
    });

    // Message status update
    socket.on('message:seen', async ({ messageId }) => {
      await Message.findByIdAndUpdate(messageId, { status: 'seen' });
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
};
