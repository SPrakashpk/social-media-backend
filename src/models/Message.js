import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const MessageSchema = new mongoose.Schema({
   _id: {
        type: String,
        default: () => nanoid(12), // 12-char custom ID
      },
  chat: { type: String, ref: 'Chat' },
  sender: { type: String, ref: 'User' },
  content: String,
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  mention: [{ type: String, ref: 'User' }],
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);