import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import connectDB from './config/db.js';

import commonResponse from './middlewares/commonResponse.js';
import baseRouter from './routes/index.js';
import auth from './middlewares/auth.js';
import { initializeSocket } from './socket.js';

// Load environment variables


const app = express();
// app.use(bodyParser.json());



const server = http.createServer(app);
initializeSocket(server);

// Middleware
app.use(cors({
  origin: '*',//process.env.FRONTEND_URL, // or your Vercel frontend URL in production
  credentials: true,
}));
app.use(express.json());


// Connect to MongoDB
connectDB();



app.use(commonResponse);
// app.use(auth);

app.use('/api', baseRouter);



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
