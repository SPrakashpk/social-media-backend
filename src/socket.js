import { Server } from "socket.io";

const users = {};       // socket.id → userId
const userSockets = {}; // userId → socket.id

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

        // User registration
        socket.on('register', (userId) => {
            try {
                if (!userId) {
                    console.warn(`❗ Missing userId in register event from socket ${socket.id}`);
                    return;
                }

                users[socket.id] = userId;
                userSockets[userId] = socket.id;
                console.log(`✅ ${userId} registered with socket ${socket.id}`);
            } catch (err) {
                console.error('🔥 Error in register handler:', err);
            }
        });

        // Private messaging
        socket.on('private-message', ({ toUserId, message }) => {
            console.log('private messagin recived')
            try {
                if (!toUserId || !message) {
                    console.warn('❗ Invalid private_message payload:', { toUserId, message });
                    return;
                }

                const toSocketId = userSockets[toUserId];
                if (!toSocketId) {
                    console.warn(`❗ User ${toUserId} is not connected`);
                    return;
                }

                io.to(toSocketId).emit('receive-message', {
                    fromUserId: users[socket.id],
                    message,
                });

                console.log(`📨 Message from ${users[socket.id]} to ${toUserId}`);
            } catch (err) {
                console.error('🔥 Error in private_message handler:', err);
            }
        });

        // Disconnection
        socket.on('disconnect', () => {
            try {
                const userId = users[socket.id];
                if (userId) {
                    delete userSockets[userId];
                }
                delete users[socket.id];
                console.log('❌ User disconnected:', socket.id);
            } catch (err) {
                console.error('🔥 Error during disconnect:', err);
            }
        });

        socket.onAny((event, ...args) => {
            console.log(`[${socket.id}] Received event: ${event}`, args);
        });
    });
};
