import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import baseRouter from './routes/index.js';
import auth from './middlewares/auth.js';
import commonResponse from './middlewares/commonResponse.js';
import { validate } from './middlewares/validate.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());


// Connect to MongoDB
connectDB();



app.use(commonResponse);
// app.use(auth);

app.use('/api', baseRouter);



// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Invalid Endpoint : ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
